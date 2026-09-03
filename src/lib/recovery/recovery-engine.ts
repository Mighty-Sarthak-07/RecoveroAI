import { db } from "@/src/db";
import {
  caseContext,
  customers,
  invoices,
  mandates,
  payments,
  recoveryCases,
  subscriptions,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  isValidTransition,
  RecoveryState,
  RiskAssessmentOutput,
} from "@/src/types/recovery";
import { logAuditEvent } from "@/src/lib/audit";

export interface CreateRecoveryCaseParams {
  merchantId: string;
  customerId: string;
  paymentId?: string | null;
  subscriptionId?: string | null;
  invoiceId?: string | null;
  mandateId?: string | null;
  caseType: string;
  amountAtRisk: number; // in cents
  riskAssessment: RiskAssessmentOutput;
  rootCause?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transitions recovery case state with strict validation.
 */
export async function transitionCaseState(
  caseId: string,
  newState: RecoveryState,
  reason?: string
): Promise<void> {
  const [existingCase] = await db
    .select()
    .from(recoveryCases)
    .where(eq(recoveryCases.id, caseId))
    .limit(1);

  if (!existingCase) {
    throw new Error(`Recovery case ${caseId} not found.`);
  }

  const currentState = existingCase.status as RecoveryState;

  if (!isValidTransition(currentState, newState)) {
    throw new Error(
      `Invalid recovery state transition: Cannot move from ${currentState} to ${newState}.`
    );
  }

  await db
    .update(recoveryCases)
    .set({
      status: newState,
      updatedAt: new Date(),
    })
    .where(eq(recoveryCases.id, caseId));

  await logAuditEvent({
    caseId,
    actor: "ORCHESTRATOR",
    event: newState === "RECOVERED" ? "OUTCOME_VERIFIED" : "ACTION_EXECUTED",
    metadata: {
      fromState: currentState,
      toState: newState,
      reason: reason || `State transitioned from ${currentState} to ${newState}`,
    },
  });
}

/**
 * Creates a new recovery case and builds the initial unified context snapshot.
 */
export async function createRecoveryCase(
  params: CreateRecoveryCaseParams
): Promise<string> {
  const {
    merchantId,
    customerId,
    paymentId,
    subscriptionId,
    invoiceId,
    mandateId,
    caseType,
    amountAtRisk,
    riskAssessment,
    rootCause,
    metadata = {},
  } = params;

  // 1. Fetch customer details
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  // 2. Fetch payment details if present
  let payment = null;
  if (paymentId) {
    const [p] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);
    payment = p;
  }

  // 3. Fetch subscription details if applicable
  let subSnapshot = undefined;
  if (subscriptionId) {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);
    if (sub) {
      subSnapshot = {
        planName: sub.planName,
        status: sub.status,
        failedAttempts: sub.failedAttempts,
        nextBillingAt: sub.nextBillingAt?.toISOString() || null,
      };
    }
  }

  // 4. Fetch invoice details if B2B
  let invoiceSnapshot = undefined;
  if (invoiceId) {
    const [inv] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    if (inv) {
      invoiceSnapshot = {
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        daysOverdue: inv.daysOverdue,
        dueAt: inv.dueAt.toISOString(),
        accountOwner: inv.accountOwner,
        previousRemindersCount: (metadata.previousRemindersCount as number) || 1,
      };
    }
  }

  // 5. Fetch mandate details if Mandate
  let mandateSnapshot = undefined;
  if (mandateId) {
    const [m] = await db
      .select()
      .from(mandates)
      .where(eq(mandates.id, mandateId))
      .limit(1);
    if (m) {
      mandateSnapshot = {
        mandateReference: m.mandateReference,
        amount: m.amount,
        retryCount: m.retryCount,
        maxRetries: m.maxRetries,
        nextDebitAt: m.nextDebitAt?.toISOString() || null,
      };
    }
  }

  // 6. Insert recovery case record
  const [newCase] = await db
    .insert(recoveryCases)
    .values({
      merchantId,
      customerId,
      paymentId: paymentId || null,
      subscriptionId: subscriptionId || null,
      invoiceId: invoiceId || null,
      mandateId: mandateId || null,
      caseType,
      amountAtRisk,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      rootCause: rootCause || payment?.failureReason || caseType,
      status: "DETECTED",
    })
    .returning();

  // 7. Build and save Context Snapshot
  await db.insert(caseContext).values({
    caseId: newCase.id,
    customerSnapshot: {
      name: customer?.name || "Customer",
      email: customer?.email || "",
      phone: customer?.phone || null,
      lifetimeValue: customer?.lifetimeValue || 0,
      contactPermission: customer?.contactPermission ?? true,
      previousSuccessfulPayments: 14,
      previousFailures: 1,
    },
    paymentSnapshot: payment
      ? {
          amount: payment.amount,
          currency: payment.currency,
          failureReason: rootCause || payment.failureReason || "insufficient_funds",
          retryCount: payment.retryCount || 0,
          paymentMethodType: payment.paymentMethodType || "card",
          paymentMethodLast4: payment.paymentMethodLast4 || "4242",
        }
      : undefined,
    subscriptionSnapshot: subSnapshot,
    invoiceSnapshot: invoiceSnapshot || (caseType === "b2b_receivable" ? {
      invoiceNumber: (metadata.invoiceNumber as string) || "INV-8500",
      amount: amountAtRisk,
      daysOverdue: (metadata.daysOverdue as number) || 12,
      dueAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      accountOwner: (metadata.accountOwner as string) || "Enterprise Finance",
      previousRemindersCount: 1,
    } : undefined),
    mandateSnapshot: mandateSnapshot || (caseType === "mandate_retry" ? {
      mandateReference: (metadata.mandateReference as string) || "MD-1042",
      amount: amountAtRisk,
      retryCount: 1,
      maxRetries: 3,
      nextDebitAt: new Date(Date.now() + 6 * 3600000).toISOString(),
    } : undefined),
    voiceSnapshot: caseType === "voice_recovery" ? {
      language: "HINGLISH",
      detectedIntent: (metadata.detectedIntent as string) || "TRY_LATER",
      transcriptSnippet: (metadata.transcript as string) || "Namaste Rahul, aapka payment complete nahi ho paya. Kya aap dobara try karna chahenge?",
    } : undefined,
    promiseSnapshot: caseType === "promise_to_pay" ? {
      promisedAmount: amountAtRisk,
      promisedDate: new Date(Date.now() + 24 * 3600000).toISOString(),
      status: "PROMISED",
      channel: (metadata.channel as string) || "voice",
    } : undefined,
    historicalContext: {
      averageRecoveryTimeHours: 6.4,
      pastChannelResponses: { email: true, whatsapp: true, voice: true },
      notes: riskAssessment.reasons,
    },
  });

  // 8. Audit log case creation
  await logAuditEvent({
    caseId: newCase.id,
    actor: "SYSTEM",
    event: "RECOVERY_CASE_CREATED",
    metadata: {
      caseType,
      amountAtRisk,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      reasons: riskAssessment.reasons,
    },
  });

  return newCase.id;
}
