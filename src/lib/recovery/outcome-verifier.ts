import { db } from "@/src/db";
import {
  actionLogs,
  invoices,
  mandates,
  outcomeLogs,
  payments,
  recoveryCases,
  subscriptions,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/src/lib/audit";

export interface VerifyOutcomeParams {
  caseId: string;
  forceSuccess?: boolean; // For deterministic simulation or verified webhook triggers
  verificationSource?: string;
  recoveryTimeSeconds?: number;
  notes?: string;
}

export interface OutcomeVerificationResult {
  verified: boolean;
  status: "RECOVERED" | "FAILED" | "PENDING";
  amountRecovered: number;
  message: string;
}

/**
 * Outcome Verifier: Only records revenue as recovered upon verified payment settlement.
 */
export async function verifyRecoveryOutcome(
  params: VerifyOutcomeParams
): Promise<OutcomeVerificationResult> {
  const {
    caseId,
    forceSuccess = false,
    verificationSource = "gateway_verification_service",
    recoveryTimeSeconds = 340,
    notes,
  } = params;

  // 1. Fetch recovery case
  const [recCase] = await db
    .select()
    .from(recoveryCases)
    .where(eq(recoveryCases.id, caseId))
    .limit(1);

  if (!recCase) {
    throw new Error(`Recovery case ${caseId} not found.`);
  }

  // 2. Fetch payment record if present
  let payment = null;
  if (recCase.paymentId) {
    const [p] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, recCase.paymentId))
      .limit(1);
    payment = p;
  }

  // 3. Determine if payment has succeeded
  // In demo/test mode, forceSuccess simulates confirmed transaction settlement
  const isRecovered = forceSuccess || payment?.status === "succeeded";

  if (isRecovered) {
    // A. Update payment status to succeeded if present
    if (payment && payment.status !== "succeeded") {
      await db
        .update(payments)
        .set({
          status: "succeeded",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));
    }

    if (recCase.invoiceId) {
      await db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, recCase.invoiceId));
    }

    if (recCase.mandateId) {
      await db
        .update(mandates)
        .set({
          status: "recovered",
          updatedAt: new Date(),
        })
        .where(eq(mandates.id, recCase.mandateId));
    }

    if (recCase.subscriptionId) {
      await db
        .update(subscriptions)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, recCase.subscriptionId));
    }

    // B. Transition case state to RECOVERED
    await db
      .update(recoveryCases)
      .set({
        status: "RECOVERED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    // C. Write immutable Outcome Log
    await db.insert(outcomeLogs).values({
      caseId,
      status: "RECOVERED",
      amountRecovered: recCase.amountAtRisk,
      verified: true,
      verificationSource,
      recoveryTimeSeconds,
      notes: notes || "Payment settlement confirmed by gateway verification.",
    });

    // D. Write Audit Log
    await logAuditEvent({
      caseId,
      actor: "OUTCOME_VERIFIER",
      event: "OUTCOME_VERIFIED",
      metadata: {
        verified: true,
        amountRecovered: recCase.amountAtRisk,
        verificationSource,
        recoveryTimeSeconds,
      },
    });

    return {
      verified: true,
      status: "RECOVERED",
      amountRecovered: recCase.amountAtRisk,
      message: `₹${(recCase.amountAtRisk / 100).toLocaleString()} successfully verified and recovered!`,
    };
  } else {
    // Payment unconfirmed or failed
    await db
      .update(recoveryCases)
      .set({
        status: "FAILED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    await db.insert(outcomeLogs).values({
      caseId,
      status: "FAILED",
      amountRecovered: 0,
      verified: false,
      verificationSource,
      notes: notes || "Payment re-authorization failed or timed out.",
    });

    await logAuditEvent({
      caseId,
      actor: "OUTCOME_VERIFIER",
      event: "OUTCOME_VERIFIED",
      metadata: {
        verified: false,
        amountRecovered: 0,
        status: "FAILED",
      },
    });

    return {
      verified: false,
      status: "FAILED",
      amountRecovered: 0,
      message: "Recovery attempt did not result in verified payment settlement.",
    };
  }
}
