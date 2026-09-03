import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============================================================
// ENUMS
// ============================================================

export const recoveryCaseStatusEnum = pgEnum("recovery_case_status", [
  "DETECTED",
  "DIAGNOSING",
  "DECIDING",
  "POLICY_REVIEW",
  "APPROVED",
  "EXECUTING",
  "VERIFYING",
  "RECOVERED",
  "FAILED",
  "ESCALATED",
  "BLOCKED",
  "CLOSED",
]);

export const customerStatusEnum = pgEnum("customer_status", [
  "active",
  "at_risk",
  "in_recovery",
  "churned",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "paused",
  "trialing",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const policyResultEnum = pgEnum("policy_result", [
  "ALLOW",
  "BLOCK",
  "ESCALATE",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "pending",
  "executing",
  "executed",
  "failed",
  "skipped",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "approaching_due",
  "due",
  "overdue",
  "critically_overdue",
  "paid",
  "written_off",
]);

export const mandateStatusEnum = pgEnum("mandate_status", [
  "active",
  "failed",
  "retrying",
  "paused",
  "exhausted",
  "recovered",
]);

export const promiseStatusEnum = pgEnum("promise_status", [
  "PROMISED",
  "DUE_SOON",
  "DUE_TODAY",
  "FULFILLED",
  "OVERDUE",
  "BROKEN",
  "ESCALATED",
  "CANCELLED",
]);

export const voiceSessionStatusEnum = pgEnum("voice_session_status", [
  "initiated",
  "connected",
  "completed",
  "failed",
  "transferred",
]);

// ============================================================
// 1. MERCHANTS (First-Class Tenant Root)
// ============================================================

export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  policyJson: jsonb("policy_json").$type<{
    maxRetries: number;
    highValueThreshold: number; // in cents
    cooldownHours: number;
    requireConsentForContact: boolean;
    costCeilingRatio: number;
    quietHoursStart?: number; // 0-23
    quietHoursEnd?: number; // 0-23
    maxInvoiceReminders?: number;
    b2bHighValueThreshold?: number;
    maxMandateRetries?: number;
    mandateMinIntervalHours?: number;
    voiceMaxAttempts?: number;
    voiceAllowedHoursStart?: number;
    voiceAllowedHoursEnd?: number;
  }>().default({
    maxRetries: 4,
    highValueThreshold: 10000000, // ₹100,000 in cents
    cooldownHours: 6,
    requireConsentForContact: true,
    costCeilingRatio: 0.15,
    maxInvoiceReminders: 3,
    b2bHighValueThreshold: 5000000, // ₹50,000
    maxMandateRetries: 3,
    mandateMinIntervalHours: 6,
    voiceMaxAttempts: 2,
    voiceAllowedHoursStart: 10,
    voiceAllowedHoursEnd: 19,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 2. CUSTOMERS
// ============================================================

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(), // Stripe / Razorpay customer ID
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  lifetimeValue: integer("lifetime_value").default(0).notNull(), // in cents
  contactPermission: boolean("contact_permission").default(true).notNull(),
  riskScore: integer("risk_score").default(0).notNull(), // 0-100
  status: customerStatusEnum("status").default("active").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 3. SUBSCRIPTIONS
// ============================================================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  planName: text("plan_name").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("inr").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  nextBillingAt: timestamp("next_billing_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 4. PAYMENTS
// ============================================================

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("inr").notNull(),
  status: paymentStatusEnum("status").notNull(),
  failureReason: text("failure_reason"), // insufficient_funds, card_declined, etc.
  retryCount: integer("retry_count").default(0).notNull(),
  paymentMethodType: text("payment_method_type").default("card"),
  paymentMethodLast4: text("payment_method_last4"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 5. INVOICES (B2B Receivables)
// ============================================================

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("inr").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  status: invoiceStatusEnum("status").default("pending").notNull(),
  daysOverdue: integer("days_overdue").default(0).notNull(),
  priority: text("priority").default("normal").notNull(), // low, normal, high, critical
  accountOwner: text("account_owner").default("Finance Team").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceCommunications = pgTable("invoice_communications", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(), // email, whatsapp, sms, phone
  messageType: text("message_type").notNull(), // friendly_reminder, overdue_notice, final_demand
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().default({}),
});

// ============================================================
// 6. MANDATES (Recurring e-Mandates / NACH / UPI AutoPay)
// ============================================================

export const mandates = pgTable("mandates", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  mandateReference: text("mandate_reference").notNull().unique(), // e.g. UMN/e-Mandate ID
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("inr").notNull(),
  frequency: text("frequency").default("monthly").notNull(), // monthly, quarterly, annual
  nextDebitAt: timestamp("next_debit_at", { withTimezone: true }),
  status: mandateStatusEnum("status").default("active").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  lastFailureReason: text("last_failure_reason"),
  maxRetries: integer("max_retries").default(3).notNull(),
  retryWindowEnd: timestamp("retry_window_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mandateAttempts = pgTable("mandate_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  mandateId: uuid("mandate_id")
    .notNull()
    .references(() => mandates.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  executedAt: timestamp("executed_at", { withTimezone: true }),
  status: text("status").default("scheduled").notNull(), // scheduled, succeeded, failed
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 7. PROMISES TO PAY
// ============================================================

export const promisesToPay = pgTable("promises_to_pay", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  caseId: uuid("case_id"), // linked recovery case
  promisedAmount: integer("promised_amount").notNull(), // in cents
  promisedDate: timestamp("promised_date", { withTimezone: true }).notNull(),
  status: promiseStatusEnum("status").default("PROMISED").notNull(),
  channel: text("channel").default("voice").notNull(), // voice, email, whatsapp, agent
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 8. VOICE SESSIONS (Hinglish Voice Agent)
// ============================================================

export const voiceSessions = pgTable("voice_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id"), // linked recovery case
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  language: text("language").default("HINGLISH").notNull(), // HINGLISH, ENGLISH, HINDI
  status: voiceSessionStatusEnum("status").default("initiated").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  transcript: jsonb("transcript").$type<
    Array<{ speaker: "agent" | "customer"; text: string; timestamp: string }>
  >().default([]).notNull(),
  detectedIntent: text("detected_intent"), // PAY_NOW, TRY_LATER, NEEDS_HELP, DECLINE, WRONG_NUMBER, HUMAN_AGENT
  outcome: jsonb("outcome").$type<Record<string, unknown>>().default({}),
});

// ============================================================
// 9. RAW EVENTS (Idempotent Webhook Ingestion)
// ============================================================

export const rawEvents = pgTable("raw_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: text("event_id").notNull().unique(), // idempotency key
  eventType: text("event_type").notNull(), // payment.failed, checkout.abandoned, invoice.overdue, mandate.failed, etc.
  source: text("source").notNull(), // razorpay, synthetic, system, b2b, mandate, voice
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingError: text("processing_error"),
});

// ============================================================
// 10. RECOVERY CASES (Unified State Machine Managed Root)
// ============================================================

export const recoveryCases = pgTable("recovery_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  mandateId: uuid("mandate_id").references(() => mandates.id, { onDelete: "set null" }),
  caseType: text("case_type").notNull(), // payment_failure, checkout_abandonment, subscription_failure, b2b_receivable, mandate_retry, voice_recovery, promise_to_pay
  amountAtRisk: integer("amount_at_risk").notNull(), // in cents
  riskScore: integer("risk_score").default(0).notNull(),
  riskLevel: riskLevelEnum("risk_level").default("MEDIUM").notNull(),
  rootCause: text("root_cause"), // insufficient_funds, overdue_invoice, mandate_declined, promise_broken, etc.
  status: recoveryCaseStatusEnum("status").default("DETECTED").notNull(),
  nextActionAt: timestamp("next_action_at", { withTimezone: true }), // persistent schedule
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 11. CASE CONTEXT (Snapshot for AI & Decision Engines)
// ============================================================

export const caseContext = pgTable("case_context", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => recoveryCases.id, { onDelete: "cascade" }),
  customerSnapshot: jsonb("customer_snapshot").$type<{
    name: string;
    email: string;
    phone?: string | null;
    lifetimeValue: number;
    contactPermission: boolean;
    previousSuccessfulPayments: number;
    previousFailures: number;
  }>().notNull(),
  paymentSnapshot: jsonb("payment_snapshot").$type<{
    amount: number;
    currency: string;
    failureReason: string;
    retryCount: number;
    paymentMethodType?: string | null;
    paymentMethodLast4?: string | null;
  }>(),
  subscriptionSnapshot: jsonb("subscription_snapshot").$type<{
    planName?: string | null;
    status?: string | null;
    failedAttempts?: number;
    nextBillingAt?: string | null;
  }>(),
  invoiceSnapshot: jsonb("invoice_snapshot").$type<{
    invoiceNumber: string;
    amount: number;
    daysOverdue: number;
    dueAt: string;
    accountOwner: string;
    previousRemindersCount?: number;
  }>(),
  mandateSnapshot: jsonb("mandate_snapshot").$type<{
    mandateReference: string;
    amount: number;
    retryCount: number;
    maxRetries: number;
    nextDebitAt?: string | null;
  }>(),
  voiceSnapshot: jsonb("voice_snapshot").$type<{
    language: string;
    detectedIntent?: string | null;
    transcriptSnippet?: string;
  }>(),
  promiseSnapshot: jsonb("promise_snapshot").$type<{
    promisedAmount: number;
    promisedDate: string;
    status: string;
    channel: string;
  }>(),
  historicalContext: jsonb("historical_context").$type<{
    averageRecoveryTimeHours?: number;
    pastChannelResponses?: Record<string, boolean>;
    notes?: string[];
  }>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 12. DECISION RECORDS (AI & Deterministic Recommendations)
// ============================================================

export const decisionRecords = pgTable("decision_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => recoveryCases.id, { onDelete: "cascade" }),
  candidateActions: jsonb("candidate_actions").$type<
    Array<{
      action: string;
      channel: string;
      expectedRecovery: number;
      estimatedCost: number;
      expectedFailureCost: number;
      expectedNetValue: number;
      expectedRoi: number;
      retryAfterHours?: number;
      description?: string;
    }>
  >().notNull(),
  selectedAction: text("selected_action").notNull(),
  expectedRecovery: integer("expected_recovery").notNull(), // in cents
  estimatedCost: integer("estimated_cost").default(0).notNull(), // in cents
  expectedNetValue: integer("expected_net_value").notNull(), // in cents
  expectedRoi: numeric("expected_roi", { precision: 8, scale: 2 }).notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(), // 0.000 - 1.000
  evidence: jsonb("evidence").$type<string[]>().default([]).notNull(),
  requiresHumanApproval: boolean("requires_human_approval").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 13. POLICY CHECK LOGS (Deterministic Business Rules)
// ============================================================

export const policyCheckLogs = pgTable("policy_check_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => recoveryCases.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  ruleName: text("rule_name").notNull(),
  result: policyResultEnum("result").notNull(), // ALLOW, BLOCK, ESCALATE
  reason: text("reason").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 14. ACTION LOGS (Executed Interventions)
// ============================================================

export const actionLogs = pgTable("action_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => recoveryCases.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),
  channel: text("channel").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  status: actionStatusEnum("status").default("pending").notNull(),
  executedAt: timestamp("executed_at", { withTimezone: true }),
  result: jsonb("result").$type<Record<string, unknown>>().default({}),
});

// ============================================================
// 15. OUTCOME LOGS (Verified Financial Recovery)
// ============================================================

export const outcomeLogs = pgTable("outcome_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => recoveryCases.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // RECOVERED, FAILED, ABANDONED
  amountRecovered: integer("amount_recovered").default(0).notNull(), // in cents
  verified: boolean("verified").default(false).notNull(),
  verificationSource: text("verification_source"),
  recoveryTimeSeconds: integer("recovery_time_seconds"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 16. AUDIT LOGS (Immutable Operational Trace)
// ============================================================

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").references(() => recoveryCases.id, {
    onDelete: "set null",
  }),
  actor: text("actor").notNull(),
  event: text("event").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// 17. SIMULATION RUNS (Batch Performance & Baseline Comparison)
// ============================================================

export const simulationRuns = pgTable("simulation_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  strategy: text("strategy").default("RECOVERO_AI").notNull(),
  workflowType: text("workflow_type").default("ALL").notNull(), // ALL, PAYMENT, B2B, MANDATE, VOICE, PROMISE
  totalEvents: integer("total_events").notNull(),
  revenueAtRisk: integer("revenue_at_risk").notNull(), // in cents
  potentiallyRecoverable: integer("potentially_recoverable").notNull(), // in cents
  revenueRecovered: integer("revenue_recovered").notNull(), // in cents
  recoveryRate: numeric("recovery_rate", { precision: 5, scale: 2 }).notNull(),
  interventionCost: integer("intervention_cost").notNull(), // in cents
  roi: numeric("roi", { precision: 8, scale: 2 }).notNull(),
  automatedActions: integer("automated_actions").default(0).notNull(),
  humanEscalations: integer("human_escalations").default(0).notNull(),
  policyBlocks: integer("policy_blocks").default(0).notNull(),
  failedInterventions: integer("failed_interventions").default(0).notNull(),
  baselineRecovered: integer("baseline_recovered"), // in cents
  baselineRecoveryRate: numeric("baseline_recovery_rate", { precision: 5, scale: 2 }),
  baselineCost: integer("baseline_cost"), // in cents
  baselineRoi: numeric("baseline_roi", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const merchantsRelations = relations(merchants, ({ many }) => ({
  customers: many(customers),
  payments: many(payments),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  mandates: many(mandates),
  promisesToPay: many(promisesToPay),
  recoveryCases: many(recoveryCases),
  simulationRuns: many(simulationRuns),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [customers.merchantId],
    references: [merchants.id],
  }),
  payments: many(payments),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  mandates: many(mandates),
  promisesToPay: many(promisesToPay),
  voiceSessions: many(voiceSessions),
  recoveryCases: many(recoveryCases),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [invoices.merchantId],
    references: [merchants.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  communications: many(invoiceCommunications),
  promisesToPay: many(promisesToPay),
  recoveryCases: many(recoveryCases),
}));

export const invoiceCommunicationsRelations = relations(invoiceCommunications, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceCommunications.invoiceId],
    references: [invoices.id],
  }),
}));

export const mandatesRelations = relations(mandates, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [mandates.merchantId],
    references: [merchants.id],
  }),
  customer: one(customers, {
    fields: [mandates.customerId],
    references: [customers.id],
  }),
  attempts: many(mandateAttempts),
  recoveryCases: many(recoveryCases),
}));

export const mandateAttemptsRelations = relations(mandateAttempts, ({ one }) => ({
  mandate: one(mandates, {
    fields: [mandateAttempts.mandateId],
    references: [mandates.id],
  }),
}));

export const promisesToPayRelations = relations(promisesToPay, ({ one }) => ({
  merchant: one(merchants, {
    fields: [promisesToPay.merchantId],
    references: [merchants.id],
  }),
  customer: one(customers, {
    fields: [promisesToPay.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [promisesToPay.invoiceId],
    references: [invoices.id],
  }),
}));

export const voiceSessionsRelations = relations(voiceSessions, ({ one }) => ({
  customer: one(customers, {
    fields: [voiceSessions.customerId],
    references: [customers.id],
  }),
}));

export const recoveryCasesRelations = relations(recoveryCases, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [recoveryCases.merchantId],
    references: [merchants.id],
  }),
  customer: one(customers, {
    fields: [recoveryCases.customerId],
    references: [customers.id],
  }),
  payment: one(payments, {
    fields: [recoveryCases.paymentId],
    references: [payments.id],
  }),
  subscription: one(subscriptions, {
    fields: [recoveryCases.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [recoveryCases.invoiceId],
    references: [invoices.id],
  }),
  mandate: one(mandates, {
    fields: [recoveryCases.mandateId],
    references: [mandates.id],
  }),
  context: many(caseContext),
  decisions: many(decisionRecords),
  policyChecks: many(policyCheckLogs),
  actions: many(actionLogs),
  outcomes: many(outcomeLogs),
  auditLogs: many(auditLogs),
}));

export const caseContextRelations = relations(caseContext, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [caseContext.caseId],
    references: [recoveryCases.id],
  }),
}));

export const decisionRecordsRelations = relations(decisionRecords, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [decisionRecords.caseId],
    references: [recoveryCases.id],
  }),
}));

export const policyCheckLogsRelations = relations(policyCheckLogs, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [policyCheckLogs.caseId],
    references: [recoveryCases.id],
  }),
}));

export const actionLogsRelations = relations(actionLogs, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [actionLogs.caseId],
    references: [recoveryCases.id],
  }),
}));

export const outcomeLogsRelations = relations(outcomeLogs, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [outcomeLogs.caseId],
    references: [recoveryCases.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  recoveryCase: one(recoveryCases, {
    fields: [auditLogs.caseId],
    references: [recoveryCases.id],
  }),
}));

export const simulationRunsRelations = relations(simulationRuns, ({ one }) => ({
  merchant: one(merchants, {
    fields: [simulationRuns.merchantId],
    references: [merchants.id],
  }),
}));
