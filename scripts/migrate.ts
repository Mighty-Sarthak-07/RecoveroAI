import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/recovero";

const sql = postgres(connectionString, {
  prepare: false,
  ssl: "require",
});

async function runMigration() {
  console.log("Starting RecoveroAI database schema migration...");

  try {
    // 1. Enums
    await sql.unsafe(`
      DO $$ BEGIN
        CREATE TYPE recovery_case_status AS ENUM (
          'DETECTED', 'DIAGNOSING', 'DECIDING', 'POLICY_REVIEW',
          'APPROVED', 'EXECUTING', 'VERIFYING', 'RECOVERED',
          'FAILED', 'ESCALATED', 'BLOCKED', 'CLOSED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE customer_status AS ENUM ('active', 'at_risk', 'in_recovery', 'churned');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'paused', 'trialing');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE policy_result AS ENUM ('ALLOW', 'BLOCK', 'ESCALATE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE action_status AS ENUM ('pending', 'executing', 'executed', 'failed', 'skipped');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE invoice_status AS ENUM (
          'pending', 'approaching_due', 'due', 'overdue', 'critically_overdue', 'paid', 'written_off'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE mandate_status AS ENUM (
          'active', 'failed', 'retrying', 'paused', 'exhausted', 'recovered'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE promise_status AS ENUM (
          'PROMISED', 'DUE_SOON', 'DUE_TODAY', 'FULFILLED', 'OVERDUE', 'BROKEN', 'ESCALATED', 'CANCELLED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE voice_session_status AS ENUM (
          'initiated', 'connected', 'completed', 'failed', 'transferred'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Tables
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        policy_json JSONB NOT NULL DEFAULT '{"maxRetries":4,"highValueThreshold":10000000,"cooldownHours":6,"requireConsentForContact":true,"costCeilingRatio":0.15}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        external_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        lifetime_value INTEGER NOT NULL DEFAULT 0,
        contact_permission BOOLEAN NOT NULL DEFAULT true,
        risk_score INTEGER NOT NULL DEFAULT 0,
        status customer_status NOT NULL DEFAULT 'active',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        razorpay_subscription_id TEXT,
        plan_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'inr',
        status subscription_status NOT NULL DEFAULT 'active',
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        next_billing_at TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        razorpay_payment_id TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'inr',
        status payment_status NOT NULL,
        failure_reason TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        payment_method_type TEXT DEFAULT 'card',
        payment_method_last4 TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        invoice_number TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'inr',
        issued_at TIMESTAMPTZ NOT NULL,
        due_at TIMESTAMPTZ NOT NULL,
        paid_at TIMESTAMPTZ,
        status invoice_status NOT NULL DEFAULT 'pending',
        days_overdue INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'normal',
        account_owner TEXT NOT NULL DEFAULT 'Finance Team',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invoice_communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        channel TEXT NOT NULL,
        message_type TEXT NOT NULL,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        result JSONB DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS mandates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        mandate_reference TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'inr',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        next_debit_at TIMESTAMPTZ,
        status mandate_status NOT NULL DEFAULT 'active',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_failure_reason TEXT,
        max_retries INTEGER NOT NULL DEFAULT 3,
        retry_window_end TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mandate_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
        attempt_number INTEGER NOT NULL,
        scheduled_at TIMESTAMPTZ NOT NULL,
        executed_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'scheduled',
        failure_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS promises_to_pay (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
        case_id UUID,
        promised_amount INTEGER NOT NULL,
        promised_date TIMESTAMPTZ NOT NULL,
        status promise_status NOT NULL DEFAULT 'PROMISED',
        channel TEXT NOT NULL DEFAULT 'voice',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS voice_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        language TEXT NOT NULL DEFAULT 'HINGLISH',
        status voice_session_status NOT NULL DEFAULT 'initiated',
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
        detected_intent TEXT,
        outcome JSONB DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS raw_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id TEXT NOT NULL UNIQUE,
        event_type TEXT NOT NULL,
        source TEXT NOT NULL,
        payload JSONB NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMPTZ,
        processing_error TEXT
      );

      CREATE TABLE IF NOT EXISTS recovery_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
        invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
        mandate_id UUID REFERENCES mandates(id) ON DELETE SET NULL,
        case_type TEXT NOT NULL,
        amount_at_risk INTEGER NOT NULL,
        risk_score INTEGER NOT NULL DEFAULT 0,
        risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
        root_cause TEXT,
        status recovery_case_status NOT NULL DEFAULT 'DETECTED',
        next_action_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS case_context (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
        customer_snapshot JSONB NOT NULL,
        payment_snapshot JSONB,
        subscription_snapshot JSONB,
        invoice_snapshot JSONB,
        mandate_snapshot JSONB,
        voice_snapshot JSONB,
        promise_snapshot JSONB,
        historical_context JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS decision_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
        candidate_actions JSONB NOT NULL,
        selected_action TEXT NOT NULL,
        expected_recovery INTEGER NOT NULL,
        estimated_cost INTEGER NOT NULL DEFAULT 0,
        expected_net_value INTEGER NOT NULL,
        expected_roi NUMERIC(8, 2) NOT NULL,
        confidence NUMERIC(4, 3) NOT NULL,
        evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
        requires_human_approval BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS policy_check_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        result policy_result NOT NULL,
        reason TEXT NOT NULL,
        checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS action_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        channel TEXT NOT NULL,
        payload JSONB DEFAULT '{}'::jsonb,
        status action_status NOT NULL DEFAULT 'pending',
        executed_at TIMESTAMPTZ,
        result JSONB DEFAULT '{}'::jsonb
      );

      CREATE TABLE IF NOT EXISTS outcome_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        amount_recovered INTEGER NOT NULL DEFAULT 0,
        verified BOOLEAN NOT NULL DEFAULT false,
        verification_source TEXT,
        recovery_time_seconds INTEGER,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_id UUID REFERENCES recovery_cases(id) ON DELETE SET NULL,
        actor TEXT NOT NULL,
        event TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS simulation_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        strategy TEXT NOT NULL DEFAULT 'RECOVERO_AI',
        workflow_type TEXT NOT NULL DEFAULT 'ALL',
        total_events INTEGER NOT NULL,
        revenue_at_risk INTEGER NOT NULL,
        potentially_recoverable INTEGER NOT NULL,
        revenue_recovered INTEGER NOT NULL,
        recovery_rate NUMERIC(5, 2) NOT NULL,
        intervention_cost INTEGER NOT NULL,
        roi NUMERIC(8, 2) NOT NULL,
        automated_actions INTEGER NOT NULL DEFAULT 0,
        human_escalations INTEGER NOT NULL DEFAULT 0,
        policy_blocks INTEGER NOT NULL DEFAULT 0,
        failed_interventions INTEGER NOT NULL DEFAULT 0,
        baseline_recovered INTEGER,
        baseline_recovery_rate NUMERIC(5, 2),
        baseline_cost INTEGER,
        baseline_roi NUMERIC(8, 2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ All RecoveroAI database tables and enums created successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
