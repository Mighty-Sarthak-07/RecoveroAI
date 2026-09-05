import { db } from "@/src/db";
import { eq } from "drizzle-orm";
import {
  actionLogs,
  caseContext,
  customers,
  decisionRecords,
  invoices,
  invoiceCommunications,
  mandates,
  mandateAttempts,
  merchants,
  outcomeLogs,
  payments,
  policyCheckLogs,
  promisesToPay,
  recoveryCases,
  subscriptions,
  voiceSessions,
} from "@/src/db/schema";
import { logAuditEvent } from "@/src/lib/audit";

/**
 * Seeds realistic RecoveroAI demo data including:
 * 1. Hero Scenario: ₹2,499 Payment Failure (Rahul Sharma) -> Recovered
 * 2. Scenario 2: ₹1,299 Checkout Abandonment (Priya Singh) -> Scheduled / Recovered
 * 3. Scenario 3: ₹12,999 Subscription Failure (Acme Corp) -> Escalated
 * 4. Scenario 4: ₹4,099 Payment Failure (Neha Verma) -> In Progress
 * 5. Scenario 5: ₹200,000 High-Value Policy Blocked Kill Switch Demo (Vikram Malhotra)
 */
export async function seedDemoData() {
  console.log("Seeding RecoveroAI database...");

  // 0. Clean up existing demo merchant if present to guarantee idempotency
  const existingMerchants = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.email, "finance@recoveroai.com"));

  for (const m of existingMerchants) {
    await db.delete(merchants).where(eq(merchants.id, m.id));
  }

  // 1. Merchant
  const [merchant] = await db
    .insert(merchants)
    .values({
      name: "Stripe / Razorpay Merchant Store",
      email: "finance@recoveroai.com",
      policyJson: {
        maxRetries: 4,
        highValueThreshold: 10000000, // ₹100,000 in cents
        cooldownHours: 6,
        requireConsentForContact: true,
        costCeilingRatio: 0.15,
      },
    })
    .returning();

  // 2. Customers
  const [rahul] = await db
    .insert(customers)
    .values({
      merchantId: merchant.id,
      externalId: "cus_rahul_1042",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+919876543210",
      lifetimeValue: 3498600, // ₹34,986
      contactPermission: true,
      riskScore: 35,
      status: "active",
    })
    .returning();

  const [priya] = await db
    .insert(customers)
    .values({
      merchantId: merchant.id,
      externalId: "cus_priya_1041",
      name: "Priya Singh",
      email: "priya.singh@example.com",
      phone: "+919812345678",
      lifetimeValue: 1299000,
      contactPermission: true,
      riskScore: 25,
      status: "active",
    })
    .returning();

  const [acme] = await db
    .insert(customers)
    .values({
      merchantId: merchant.id,
      externalId: "cus_acme_1040",
      name: "Acme Corp Ltd",
      email: "finance@acmecorp.in",
      phone: "+919822334455",
      lifetimeValue: 15598800,
      contactPermission: true,
      riskScore: 75,
      status: "in_recovery",
    })
    .returning();

  const [neha] = await db
    .insert(customers)
    .values({
      merchantId: merchant.id,
      externalId: "cus_neha_1039",
      name: "Neha Verma",
      email: "neha.v@example.com",
      phone: "+919899887766",
      lifetimeValue: 2459400,
      contactPermission: true,
      riskScore: 45,
      status: "at_risk",
    })
    .returning();

  const [vikram] = await db
    .insert(customers)
    .values({
      merchantId: merchant.id,
      externalId: "cus_vikram_1099",
      name: "Vikram Malhotra",
      email: "vikram.m@enterprise.com",
      phone: "+919877001122",
      lifetimeValue: 150000000,
      contactPermission: true,
      riskScore: 85,
      status: "at_risk",
    })
    .returning();

  // 3. Subscriptions
  const [proSub] = await db
    .insert(subscriptions)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      planName: "Pro Annual Plan",
      amount: 249900,
      currency: "inr",
      status: "active",
    })
    .returning();

  // 4. Payments
  const [payRahul] = await db
    .insert(payments)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      subscriptionId: proSub.id,
      razorpayPaymentId: "pay_rahul_1042",
      amount: 249900, // ₹2,499
      currency: "inr",
      status: "succeeded", // Recovered!
      failureReason: "insufficient_funds",
      retryCount: 1,
      paymentMethodType: "card",
      paymentMethodLast4: "4242",
    })
    .returning();

  const [payPriya] = await db
    .insert(payments)
    .values({
      merchantId: merchant.id,
      customerId: priya.id,
      amount: 129900, // ₹1,299
      currency: "inr",
      status: "failed",
      failureReason: "cart_abandoned_at_checkout",
      retryCount: 0,
    })
    .returning();

  const [payAcme] = await db
    .insert(payments)
    .values({
      merchantId: merchant.id,
      customerId: acme.id,
      amount: 1299900, // ₹12,999
      currency: "inr",
      status: "failed",
      failureReason: "card_declined_expired",
      retryCount: 3,
    })
    .returning();

  const [payNeha] = await db
    .insert(payments)
    .values({
      merchantId: merchant.id,
      customerId: neha.id,
      amount: 409900, // ₹4,099
      currency: "inr",
      status: "failed",
      failureReason: "insufficient_funds",
      retryCount: 1,
    })
    .returning();

  const [payVikram] = await db
    .insert(payments)
    .values({
      merchantId: merchant.id,
      customerId: vikram.id,
      amount: 20000000, // ₹200,000
      currency: "inr",
      status: "failed",
      failureReason: "do_not_honor",
      retryCount: 4,
    })
    .returning();

  // 5. HERO RECOVERY CASE: RV-1042 (Rahul Sharma - Recovered ₹2,499)
  const [caseRahul] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      paymentId: payRahul.id,
      subscriptionId: proSub.id,
      caseType: "payment_failure",
      amountAtRisk: 249900,
      riskScore: 35,
      riskLevel: "MEDIUM",
      rootCause: "insufficient_funds",
      status: "RECOVERED",
    })
    .returning();

  await db.insert(caseContext).values({
    caseId: caseRahul.id,
    customerSnapshot: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+919876543210",
      lifetimeValue: 3498600,
      contactPermission: true,
      previousSuccessfulPayments: 14,
      previousFailures: 1,
    },
    paymentSnapshot: {
      amount: 249900,
      currency: "inr",
      failureReason: "insufficient_funds",
      retryCount: 1,
      paymentMethodType: "card",
      paymentMethodLast4: "4242",
    },
    subscriptionSnapshot: {
      planName: "Pro Annual Plan",
      status: "active",
    },
    historicalContext: {
      averageRecoveryTimeHours: 6.4,
      pastChannelResponses: { email: true, whatsapp: true },
      notes: [
        "14 successful previous payments",
        "1 previous failure",
        "Active subscription",
        "Retry count below configured limit",
      ],
    },
  });

  const [decRahul] = await db
    .insert(decisionRecords)
    .values({
      caseId: caseRahul.id,
      candidateActions: [
        {
          action: "DELAYED_RETRY",
          channel: "gateway",
          expectedRecovery: 180000,
          estimatedCost: 0,
          expectedFailureCost: 2000,
          expectedNetValue: 178000,
          expectedRoi: 999.0,
          retryAfterHours: 6,
          description: "Schedule smart retry after 6 hours",
        },
        {
          action: "SEND_RECOVERY_EMAIL",
          channel: "email",
          expectedRecovery: 160000,
          estimatedCost: 100,
          expectedFailureCost: 3000,
          expectedNetValue: 156900,
          expectedRoi: 1569.0,
          description: "Dispatch email with 1-click update link",
        },
        {
          action: "SEND_WHATSAPP",
          channel: "whatsapp",
          expectedRecovery: 190000,
          estimatedCost: 300,
          expectedFailureCost: 2000,
          expectedNetValue: 187700,
          expectedRoi: 625.67,
          description: "Send WhatsApp message with payment button",
        },
      ],
      selectedAction: "DELAYED_RETRY",
      expectedRecovery: 180000,
      estimatedCost: 0,
      expectedNetValue: 178000,
      expectedRoi: "999.00",
      confidence: "0.910",
      evidence: [
        "14 successful previous payments",
        "1 previous failure recorded",
        "Active recurring subscription",
        "Retry count (1) below configured maximum",
      ],
      requiresHumanApproval: false,
    })
    .returning();

  await db.insert(policyCheckLogs).values([
    {
      caseId: caseRahul.id,
      action: "DELAYED_RETRY",
      ruleName: "RULE_1_MAX_RETRIES",
      result: "ALLOW",
      reason: "Retry count (1) is within configured limit (4).",
    },
    {
      caseId: caseRahul.id,
      action: "DELAYED_RETRY",
      ruleName: "RULE_2_HIGH_VALUE",
      result: "ALLOW",
      reason: "Transaction value (₹2,499) is within automated threshold (₹100,000).",
    },
    {
      caseId: caseRahul.id,
      action: "DELAYED_RETRY",
      ruleName: "RULE_4_CUSTOMER_CONTACT",
      result: "ALLOW",
      reason: "Customer has authorized automated notifications.",
    },
  ]);

  await db.insert(actionLogs).values({
    caseId: caseRahul.id,
    actionType: "DELAYED_RETRY",
    channel: "gateway",
    status: "executed",
    executedAt: new Date(Date.now() - 3600000),
    result: { gateway: "razorpay_test_mode", reauthorization: "succeeded" },
  });

  await db.insert(outcomeLogs).values({
    caseId: caseRahul.id,
    status: "RECOVERED",
    amountRecovered: 249900,
    verified: true,
    verificationSource: "razorpay_webhook",
    recoveryTimeSeconds: 384,
    notes: "Payment verified by Razorpay webhook.",
  });

  // 6. SUPPORTING SCENARIO 2: Priya Singh (Checkout Abandonment)
  const [casePriya] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: priya.id,
      paymentId: payPriya.id,
      caseType: "checkout_abandonment",
      amountAtRisk: 129900,
      riskScore: 25,
      riskLevel: "LOW",
      rootCause: "cart_abandoned_at_checkout",
      status: "EXECUTING",
    })
    .returning();

  await db.insert(actionLogs).values({
    caseId: casePriya.id,
    actionType: "SEND_RECOVERY_EMAIL",
    channel: "email",
    status: "executed",
    executedAt: new Date(Date.now() - 900000),
    result: { emailId: "msg_priya_1041", delivered: true },
  });

  // 7. SUPPORTING SCENARIO 3: Acme Corp (Subscription Failure -> Escalated)
  const [caseAcme] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: acme.id,
      paymentId: payAcme.id,
      caseType: "subscription_failure",
      amountAtRisk: 1299900,
      riskScore: 75,
      riskLevel: "HIGH",
      rootCause: "card_declined_expired",
      status: "ESCALATED",
    })
    .returning();

  // 8. SUPPORTING SCENARIO 4: Neha Verma (Payment Failure -> Scheduled)
  const [caseNeha] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: neha.id,
      paymentId: payNeha.id,
      caseType: "payment_failure",
      amountAtRisk: 409900,
      riskScore: 45,
      riskLevel: "MEDIUM",
      rootCause: "insufficient_funds",
      status: "APPROVED",
      nextActionAt: new Date(Date.now() + 18000000), // in 5 hours
    })
    .returning();

  // 9. KILL SWITCH SCENARIO: Vikram Malhotra (₹200,000 Blocked)
  const [caseVikram] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: vikram.id,
      paymentId: payVikram.id,
      caseType: "payment_failure",
      amountAtRisk: 20000000,
      riskScore: 85,
      riskLevel: "CRITICAL",
      rootCause: "do_not_honor",
      status: "BLOCKED",
    })
    .returning();

  await db.insert(policyCheckLogs).values([
    {
      caseId: caseVikram.id,
      action: "IMMEDIATE_RETRY",
      ruleName: "RULE_1_MAX_RETRIES",
      result: "ESCALATE",
      reason: "Retry count (4) reached max allowed retry limit (4).",
    },
    {
      caseId: caseVikram.id,
      action: "IMMEDIATE_RETRY",
      ruleName: "RULE_2_HIGH_VALUE",
      result: "ESCALATE",
      reason: "Transaction amount ₹200,000 exceeds high-value threshold ₹100,000. Human approval required.",
    },
  ]);

  // 10. Audit Logs
  await logAuditEvent({
    caseId: caseRahul.id,
    actor: "SYSTEM",
    event: "PAYMENT_FAILURE_DETECTED",
    metadata: { amount: 249900, failureReason: "insufficient_funds" },
  });
  await logAuditEvent({
    caseId: caseRahul.id,
    actor: "RECOVERO_AGENT",
    event: "AI_DIAGNOSIS_COMPLETED",
    metadata: { selectedAction: "DELAYED_RETRY", confidence: 0.91 },
  });
  await logAuditEvent({
    caseId: caseRahul.id,
    actor: "POLICY_ENGINE",
    event: "POLICY_EVALUATION_PASSED",
    metadata: { rulesPassed: 3 },
  });
  await logAuditEvent({
    caseId: caseRahul.id,
    actor: "ORCHESTRATOR",
    event: "ACTION_EXECUTED",
    metadata: { action: "DELAYED_RETRY", status: "executed" },
  });
  await logAuditEvent({
    caseId: caseRahul.id,
    actor: "OUTCOME_VERIFIER",
    event: "OUTCOME_VERIFIED",
    metadata: { amountRecovered: 249900, verified: true },
  });

  // 11. B2B INVOICE SCENARIO: TechCorp Global India (₹85,000 Overdue)
  const [invTechCorp] = await db
    .insert(invoices)
    .values({
      merchantId: merchant.id,
      customerId: vikram.id,
      invoiceNumber: "INV-2026-8500",
      amount: 8500000, // ₹85,000
      currency: "inr",
      issuedAt: new Date(Date.now() - 42 * 86400000),
      dueAt: new Date(Date.now() - 12 * 86400000),
      status: "overdue",
      daysOverdue: 12,
      priority: "high",
      accountOwner: "Pooja Deshmukh",
    })
    .returning();

  await db.insert(invoiceCommunications).values({
    invoiceId: invTechCorp.id,
    channel: "email",
    messageType: "friendly_reminder",
    result: { delivered: true },
  });

  const [caseB2B] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: vikram.id,
      invoiceId: invTechCorp.id,
      caseType: "b2b_receivable",
      amountAtRisk: 8500000,
      riskScore: 65,
      riskLevel: "HIGH",
      rootCause: "overdue_invoice_12d",
      status: "EXECUTING",
    })
    .returning();

  await db.insert(caseContext).values({
    caseId: caseB2B.id,
    customerSnapshot: {
      name: "Vikram Malhotra",
      email: "vikram@enterprise.com",
      lifetimeValue: 20000000,
      contactPermission: true,
      previousSuccessfulPayments: 8,
      previousFailures: 0,
    },
    invoiceSnapshot: {
      invoiceNumber: "INV-2026-8500",
      amount: 8500000,
      daysOverdue: 12,
      dueAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      accountOwner: "Pooja Deshmukh",
      previousRemindersCount: 1,
    },
  });

  // 12. MANDATE RETRY SCENARIO: Rahul Sharma (₹2,499 Monthly e-Mandate)
  const [mandateRahul] = await db
    .insert(mandates)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      mandateReference: "MD-2026-1042",
      amount: 249900, // ₹2,499
      currency: "inr",
      frequency: "monthly",
      status: "retrying",
      retryCount: 1,
      maxRetries: 3,
      lastFailureReason: "insufficient_funds",
    })
    .returning();

  await db.insert(mandateAttempts).values({
    mandateId: mandateRahul.id,
    attemptNumber: 1,
    scheduledAt: new Date(Date.now() - 6 * 3600000),
    executedAt: new Date(Date.now() - 6 * 3600000),
    status: "failed",
    failureReason: "insufficient_funds",
  });

  const [caseMandate] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      mandateId: mandateRahul.id,
      caseType: "mandate_retry",
      amountAtRisk: 249900,
      riskScore: 40,
      riskLevel: "MEDIUM",
      rootCause: "mandate_liquidity_cooling",
      status: "EXECUTING",
      nextActionAt: new Date(Date.now() + 2 * 3600000),
    })
    .returning();

  await db.insert(caseContext).values({
    caseId: caseMandate.id,
    customerSnapshot: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+919876543210",
      lifetimeValue: 3498600,
      contactPermission: true,
      previousSuccessfulPayments: 14,
      previousFailures: 1,
    },
    mandateSnapshot: {
      mandateReference: "MD-2026-1042",
      amount: 249900,
      retryCount: 1,
      maxRetries: 3,
      nextDebitAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    },
  });

  // 13. HINGLISH VOICE RECOVERY SCENARIO
  const [caseVoice] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      caseType: "voice_recovery",
      amountAtRisk: 249900,
      riskScore: 45,
      riskLevel: "MEDIUM",
      rootCause: "voice_intent_try_later",
      status: "APPROVED",
    })
    .returning();

  await db.insert(voiceSessions).values({
    caseId: caseVoice.id,
    customerId: rahul.id,
    language: "HINGLISH",
    status: "completed",
    transcript: [
      { speaker: "agent", text: "Namaste Rahul ji, main RecoveroAI se bol raha hoon. Aapka payment pending tha.", timestamp: "10:32 AM" },
      { speaker: "customer", text: "Haan main thoda busy tha, kal subah 10 baje pakka kar dunga.", timestamp: "10:32 AM" },
      { speaker: "agent", text: "Dhanyawad Rahul ji! Kal subah reminder link send kar denge.", timestamp: "10:33 AM" },
    ],
    detectedIntent: "TRY_LATER",
    outcome: { promiseCreated: true },
  });

  // 14. PROMISE TO PAY SCENARIO
  const [promiseRahul] = await db
    .insert(promisesToPay)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      caseId: caseVoice.id,
      promisedAmount: 249900,
      promisedDate: new Date(Date.now() + 18 * 3600000),
      status: "DUE_SOON",
      channel: "voice",
      metadata: { intent: "TRY_LATER", language: "HINGLISH" },
    })
    .returning();

  const [casePromise] = await db
    .insert(recoveryCases)
    .values({
      merchantId: merchant.id,
      customerId: rahul.id,
      caseType: "promise_to_pay",
      amountAtRisk: 249900,
      riskScore: 30,
      riskLevel: "LOW",
      rootCause: "promise_due_tracking",
      status: "APPROVED",
      nextActionAt: new Date(Date.now() + 18 * 3600000),
    })
    .returning();

  await db.insert(caseContext).values({
    caseId: casePromise.id,
    customerSnapshot: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+919876543210",
      lifetimeValue: 3498600,
      contactPermission: true,
      previousSuccessfulPayments: 14,
      previousFailures: 1,
    },
    promiseSnapshot: {
      promisedAmount: 249900,
      promisedDate: new Date(Date.now() + 18 * 3600000).toISOString(),
      status: "DUE_SOON",
      channel: "voice",
    },
  });

  console.log("Seeding completed successfully!");
  return { merchantId: merchant.id };
}

export async function generateDemoTransactionsBatch(requestedCount: number = 50) {
  const count = Math.max(10, Math.min(requestedCount, 500));
  console.log(`Generating ${count} realistic demo transactions...`);

  // Ensure default merchant exists
  let [merchant] = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(eq(merchants.email, "finance@recoveroai.com"))
    .limit(1);

  if (!merchant) {
    const seedRes = await seedDemoData();
    merchant = { id: seedRes.merchantId };
  }

  const indianNames = [
    "Aarav Patel", "Ananya Sharma", "Rohan Gupta", "Pooja Verma", "Vikram Singh",
    "Siddharth Rao", "Divya Nair", "Karan Mehta", "Meera Iyer", "Kabir Joshi",
    "Neha Agarwal", "Aditya Kulkarni", "Kavya Menon", "Manish Saxena", "Shreya Bhat",
  ];

  const caseTypes = [
    "payment_failure", "checkout_abandonment", "subscription_failure",
    "b2b_receivable", "mandate_retry", "voice_recovery", "promise_to_pay", "success"
  ];

  const failureReasons = [
    "insufficient_funds", "do_not_honor", "card_expired", "mandate_technical_decline",
    "checkout_session_timeout", "bank_server_down", "authentication_failed"
  ];

  let casesCreated = 0;
  let totalRevenueAtRiskCents = 0;

  for (let i = 0; i < count; i++) {
    const name = indianNames[i % indianNames.length] + ` #${i + 1}`;
    const email = `demo_customer_${Date.now()}_${i}@example.com`;
    const phone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const ltvCents = Math.floor(1000000 + Math.random() * 90000000);

    const [customer] = await db
      .insert(customers)
      .values({
        merchantId: merchant.id,
        externalId: `cus_batch_${Date.now()}_${i}`,
        name,
        email,
        phone,
        lifetimeValue: ltvCents,
        contactPermission: true,
        riskScore: Math.floor(10 + Math.random() * 70),
        status: "active",
      })
      .returning();

    const selectedType = caseTypes[i % caseTypes.length];
    const isSuccess = selectedType === "success";
    const amountCents = Math.floor(99900 + Math.random() * 1500000);
    const reason = failureReasons[i % failureReasons.length];

    const [payment] = await db
      .insert(payments)
      .values({
        merchantId: merchant.id,
        customerId: customer.id,
        razorpayPaymentId: `pay_demo_${Date.now()}_${i}`,
        amount: amountCents,
        currency: "inr",
        status: isSuccess ? "succeeded" : "failed",
        failureReason: isSuccess ? null : reason,
        paymentMethodType: i % 3 === 0 ? "upi" : i % 3 === 1 ? "nach" : "card",
        paymentMethodLast4: `${1000 + (i % 9000)}`,
        retryCount: isSuccess ? 0 : 1,
      })
      .returning();

    if (!isSuccess) {
      casesCreated++;
      totalRevenueAtRiskCents += amountCents;

      await db.insert(recoveryCases).values({
        merchantId: merchant.id,
        customerId: customer.id,
        paymentId: payment.id,
        caseType: selectedType,
        amountAtRisk: amountCents,
        riskScore: Math.floor(30 + Math.random() * 50),
        riskLevel: amountCents > 5000000 ? "HIGH" : "MEDIUM",
        rootCause: reason,
        status: "DETECTED",
        nextActionAt: new Date(Date.now() + 6 * 3600000),
      });
    }
  }

  return {
    generatedCount: count,
    casesCreated,
    totalRevenueAtRiskRupees: Math.round(totalRevenueAtRiskCents / 100),
  };
}
