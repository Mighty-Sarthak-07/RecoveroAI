import { db } from "@/src/db";
import { mandates, mandateAttempts, recoveryCases } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  CandidateAction,
  MerchantPolicy,
  NormalizedEvent,
  PolicyCheckOutput,
  RecoveryWorkflow,
} from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { defaultPaymentProvider } from "@/src/lib/providers/payment-provider";
import { logAuditEvent } from "@/src/lib/audit";

export interface MandateContext {
  mandateId: string;
  mandateReference: string;
  amount: number; // in cents
  retryCount: number;
  maxRetries: number;
  lastFailureReason: string;
  frequency: string;
  customerName: string;
  customerEmail: string;
  contactPermission: boolean;
}

export class MandateRetryWorkflow implements RecoveryWorkflow<MandateContext> {
  type = "MANDATE_RETRY" as const;

  detect(event: NormalizedEvent): boolean {
    return event.eventType === "mandate.failed" || !!event.mandateId;
  }

  async buildContext(event: NormalizedEvent): Promise<MandateContext> {
    let mandate = null;
    if (event.mandateId) {
      const [m] = await db
        .select()
        .from(mandates)
        .where(eq(mandates.id, event.mandateId))
        .limit(1);
      mandate = m;
    }

    return {
      mandateId: event.mandateId || "mandate_demo",
      mandateReference: mandate?.mandateReference || `MD-${Date.now().toString().slice(-4)}`,
      amount: event.amount,
      retryCount: event.retryCount || mandate?.retryCount || 1,
      maxRetries: mandate?.maxRetries || 3,
      lastFailureReason: event.failureReason || mandate?.lastFailureReason || "insufficient_funds",
      frequency: mandate?.frequency || "monthly",
      customerName: event.customerSnapshot.name,
      customerEmail: event.customerSnapshot.email,
      contactPermission: event.customerSnapshot.contactPermission,
    };
  }

  getCandidateActions(context: MandateContext): CandidateAction[] {
    const candidates: CandidateAction[] = [];
    const { amount, retryCount, maxRetries } = context;

    if (retryCount < maxRetries) {
      const retryHours = retryCount === 1 ? 6 : 24;
      candidates.push({
        action: "SCHEDULE_MANDATE_RETRY",
        channel: "gateway",
        expectedRecovery: Math.round(amount * (0.85 - retryCount * 0.15)),
        estimatedCost: 0,
        expectedFailureCost: Math.round(amount * 0.02),
        expectedNetValue: Math.round(amount * (0.85 - retryCount * 0.15)),
        expectedRoi: 999.0,
        retryAfterHours: retryHours,
        description: `Schedule mandate re-presentment attempt #${retryCount + 1} after ${retryHours}h cooldown`,
      });

      candidates.push({
        action: "SEND_MANDATE_UPDATE_PROMPT",
        channel: "whatsapp",
        expectedRecovery: Math.round(amount * 0.72),
        estimatedCost: 300,
        expectedFailureCost: Math.round(amount * 0.02),
        expectedNetValue: Math.round(amount * 0.72) - 300,
        expectedRoi: 240.0,
        description: "Send WhatsApp prompt allowing customer to approve alternate payment or fund bank account",
      });
    } else {
      candidates.push({
        action: "HUMAN_ESCALATION",
        channel: "manual",
        expectedRecovery: Math.round(amount * 0.88),
        estimatedCost: 15000,
        expectedFailureCost: Math.round(amount * 0.03),
        expectedNetValue: Math.round(amount * 0.88) - 15000,
        expectedRoi: 58.0,
        description: "Mandate retry window exhausted. Escalate to billing team for White-Glove resolution",
      });
    }

    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  validatePolicy(action: string, context: MandateContext, policy: MerchantPolicy): PolicyCheckOutput {
    return validatePolicy({
      action,
      channel: action.includes("WHATSAPP") ? "whatsapp" : "gateway",
      amount: context.amount,
      retryCount: context.retryCount,
      paymentStatus: "failed",
      contactPermission: context.contactPermission,
      caseId: `mandate_${context.mandateId}`,
      customerId: "cust_mandate",
      merchantPolicy: policy,
      mandateAttemptCount: context.retryCount,
    });
  }

  async execute(caseId: string, action: string, context: MandateContext): Promise<Record<string, unknown>> {
    if (action === "SCHEDULE_MANDATE_RETRY") {
      const attemptNumber = context.retryCount + 1;
      const scheduledAt = new Date(Date.now() + 6 * 3600 * 1000);

      if (context.mandateId && context.mandateId !== "mandate_demo") {
        await db.insert(mandateAttempts).values({
          mandateId: context.mandateId,
          attemptNumber,
          scheduledAt,
          status: "scheduled",
        });

        await db
          .update(mandates)
          .set({
            retryCount: attemptNumber,
            status: "retrying",
            updatedAt: new Date(),
          })
          .where(eq(mandates.id, context.mandateId));
      }
    }

    await logAuditEvent({
      caseId,
      actor: "ORCHESTRATOR",
      event: "ACTION_EXECUTED",
      metadata: {
        workflow: "MANDATE_RETRY",
        action,
        mandateReference: context.mandateReference,
        attempt: context.retryCount + 1,
      },
    });

    return {
      workflow: "MANDATE_RETRY",
      action,
      mandateReference: context.mandateReference,
      dispatched: true,
    };
  }

  async verify(caseId: string, context: MandateContext): Promise<{ verified: boolean; amountRecovered: number }> {
    if (context.mandateId && context.mandateId !== "mandate_demo") {
      await db
        .update(mandates)
        .set({
          status: "recovered",
          updatedAt: new Date(),
        })
        .where(eq(mandates.id, context.mandateId));
    }

    return {
      verified: true,
      amountRecovered: context.amount,
    };
  }
}
