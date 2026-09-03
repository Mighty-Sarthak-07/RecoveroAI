import { db } from "@/src/db";
import {
  customers,
  invoices,
  mandates,
  merchants,
  payments,
  rawEvents,
  subscriptions,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NormalizedEvent } from "@/src/types/recovery";
import { assessRevenueRisk } from "@/src/lib/risk/risk-engine";
import { createRecoveryCase } from "@/src/lib/recovery/recovery-engine";
import { logAuditEvent } from "@/src/lib/audit";

export interface ProcessEventResult {
  eventId: string;
  processed: boolean;
  duplicate: boolean;
  recoveryCaseId?: string;
  atRisk: boolean;
  message: string;
}

/**
 * Idempotent event ingestion and processing pipeline across all 7 workflows.
 */
export async function processEvent(event: NormalizedEvent): Promise<ProcessEventResult> {
  // 1. Idempotency Check
  const [existingEvent] = await db
    .select()
    .from(rawEvents)
    .where(eq(rawEvents.eventId, event.eventId))
    .limit(1);

  if (existingEvent) {
    return {
      eventId: event.eventId,
      processed: false,
      duplicate: true,
      atRisk: false,
      message: `Event ${event.eventId} already processed (idempotency key match).`,
    };
  }

  // 2. Persist raw event
  await db.insert(rawEvents).values({
    eventId: event.eventId,
    eventType: event.eventType,
    source: event.source,
    payload: event as unknown as Record<string, unknown>,
    receivedAt: new Date(),
    processedAt: new Date(),
  });

  // 3. Ensure merchant exists
  let [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, event.merchantId))
    .limit(1);

  if (!merchant) {
    const [newMerchant] = await db
      .insert(merchants)
      .values({
        id: event.merchantId,
        name: "Acme Corp",
        email: "finance@acmecorp.com",
      })
      .onConflictDoNothing()
      .returning();
    if (newMerchant) merchant = newMerchant;
  }

  // 4. Ensure customer exists
  let [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, event.customerId))
    .limit(1);

  if (!customer) {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        id: event.customerId,
        merchantId: event.merchantId,
        externalId: `cus_${event.customerId.substring(0, 8)}`,
        name: event.customerSnapshot?.name || "Customer",
        email: event.customerSnapshot?.email || "customer@example.com",
        phone: event.customerSnapshot?.phone || null,
        lifetimeValue: event.customerSnapshot?.lifetimeValue || 50000,
        contactPermission: event.customerSnapshot?.contactPermission ?? true,
      })
      .onConflictDoNothing()
      .returning();
    if (newCustomer) customer = newCustomer;
  }

  // 5. Ensure payment / invoice / mandate record exists depending on event
  let paymentId = event.paymentId;
  let invoiceId = event.invoiceId;
  let mandateId = event.mandateId;

  if (event.eventType.startsWith("invoice.") || event.source === "b2b") {
    if (!invoiceId) {
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          merchantId: event.merchantId,
          customerId: event.customerId,
          invoiceNumber: (event.metadata?.invoiceNumber as string) || `INV-${Date.now().toString().slice(-4)}`,
          amount: event.amount,
          currency: event.currency || "inr",
          issuedAt: new Date(Date.now() - 30 * 86400000),
          dueAt: new Date(Date.now() - (event.daysOverdue || 12) * 86400000),
          status: "overdue",
          daysOverdue: event.daysOverdue || 12,
          priority: "high",
          accountOwner: event.accountOwner || "Finance Team",
        })
        .returning();
      invoiceId = newInvoice.id;
    }
  } else if (event.eventType.startsWith("mandate.") || event.source === "mandate") {
    if (!mandateId) {
      const [newMandate] = await db
        .insert(mandates)
        .values({
          merchantId: event.merchantId,
          customerId: event.customerId,
          mandateReference: (event.metadata?.mandateReference as string) || `MD-${Date.now().toString().slice(-4)}`,
          amount: event.amount,
          currency: event.currency || "inr",
          status: "failed",
          retryCount: event.retryCount || 1,
          lastFailureReason: event.failureReason || "insufficient_funds",
        })
        .returning();
      mandateId = newMandate.id;
    }
  } else if (!paymentId) {
    const [newPayment] = await db
      .insert(payments)
      .values({
        merchantId: event.merchantId,
        customerId: event.customerId,
        amount: event.amount,
        currency: event.currency || "inr",
        status: event.eventType === "payment.success" ? "succeeded" : "failed",
        failureReason: event.failureReason || null,
        retryCount: event.retryCount || 0,
      })
      .returning();
    paymentId = newPayment.id;
  }

  // 6. Assess Revenue Risk
  const riskAssessment = assessRevenueRisk({
    eventType: event.eventType,
    amount: event.amount,
    failureReason: event.failureReason,
    retryCount: event.retryCount || 0,
    customerLifetimeValue: event.customerSnapshot?.lifetimeValue,
    previousSuccessfulPayments: event.customerSnapshot?.previousSuccessfulPayments,
    previousFailures: event.customerSnapshot?.previousFailures,
    hasActiveSubscription: !!event.subscriptionId,
    daysOverdue: event.daysOverdue,
  });

  await logAuditEvent({
    actor: "SYSTEM",
    event: "REVENUE_RISK_EVALUATED",
    metadata: {
      eventId: event.eventId,
      eventType: event.eventType,
      atRisk: riskAssessment.atRisk,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
    },
  });

  // 7. Resolve Case Type & Create Recovery Case
  let recoveryCaseId: string | undefined;
  if (riskAssessment.atRisk) {
    let caseType = "payment_failure";
    if (event.eventType.startsWith("invoice.") || event.source === "b2b") {
      caseType = "b2b_receivable";
    } else if (event.eventType.startsWith("mandate.") || event.source === "mandate") {
      caseType = "mandate_retry";
    } else if (event.eventType.startsWith("voice.") || event.source === "voice") {
      caseType = "voice_recovery";
    } else if (event.eventType.startsWith("promise.")) {
      caseType = "promise_to_pay";
    } else if (event.eventType === "checkout.abandoned") {
      caseType = "checkout_abandonment";
    } else if (event.eventType === "subscription.failed") {
      caseType = "subscription_failure";
    }

    recoveryCaseId = await createRecoveryCase({
      merchantId: event.merchantId,
      customerId: event.customerId,
      paymentId: paymentId || null,
      subscriptionId: event.subscriptionId,
      invoiceId: invoiceId || null,
      mandateId: mandateId || null,
      caseType,
      amountAtRisk: event.amount,
      riskAssessment,
      rootCause: event.failureReason || (event.daysOverdue ? `overdue_${event.daysOverdue}d` : caseType),
      metadata: event.metadata,
    });
  }

  return {
    eventId: event.eventId,
    processed: true,
    duplicate: false,
    recoveryCaseId,
    atRisk: riskAssessment.atRisk,
    message: riskAssessment.atRisk
      ? `Revenue at risk detected. Recovery case #${recoveryCaseId} created.`
      : "Event processed without revenue risk.",
  };
}
