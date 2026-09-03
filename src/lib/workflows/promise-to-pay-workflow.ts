import { db } from "@/src/db";
import { promisesToPay, recoveryCases } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  CandidateAction,
  MerchantPolicy,
  NormalizedEvent,
  PolicyCheckOutput,
  PromiseStatus,
  RecoveryWorkflow,
} from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";
import { logAuditEvent } from "@/src/lib/audit";

export interface PromiseContext {
  promiseId: string;
  customerId: string;
  invoiceId?: string | null;
  amount: number; // in cents
  promisedDate: string;
  status: PromiseStatus;
  channel: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail: string;
  contactPermission: boolean;
}

export class PromiseToPayWorkflow implements RecoveryWorkflow<PromiseContext> {
  type = "PROMISE_TO_PAY" as const;

  detect(event: NormalizedEvent): boolean {
    return event.eventType === "promise.created" || event.eventType === "promise.broken";
  }

  async buildContext(event: NormalizedEvent): Promise<PromiseContext> {
    return {
      promiseId: event.eventId || "promise_demo",
      customerId: event.customerId,
      invoiceId: event.invoiceId,
      amount: event.amount,
      promisedDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: (event.metadata?.status as PromiseStatus) || "PROMISED",
      channel: (event.metadata?.channel as string) || "voice",
      customerName: event.customerSnapshot.name,
      customerPhone: event.customerSnapshot.phone,
      customerEmail: event.customerSnapshot.email,
      contactPermission: event.customerSnapshot.contactPermission,
    };
  }

  getCandidateActions(context: PromiseContext): CandidateAction[] {
    const candidates: CandidateAction[] = [];
    const { amount, status } = context;

    if (status === "BROKEN" || status === "OVERDUE") {
      candidates.push({
        action: "ESCALATE_BROKEN_PROMISE",
        channel: "manual",
        expectedRecovery: Math.round(amount * 0.75),
        estimatedCost: 15000, // ₹150
        expectedFailureCost: Math.round(amount * 0.05),
        expectedNetValue: Math.round(amount * 0.75) - 15000,
        expectedRoi: 50.0,
        description: "Promised payment window lapsed. Escalate to collections specialist for immediate phone follow-up",
      });
    } else {
      candidates.push({
        action: "SEND_PROMISE_REMINDER",
        channel: "whatsapp",
        expectedRecovery: Math.round(amount * 0.90),
        estimatedCost: 300, // ₹3
        expectedFailureCost: Math.round(amount * 0.01),
        expectedNetValue: Math.round(amount * 0.90) - 300,
        expectedRoi: 300.0,
        description: "Send friendly morning reminder with instant 1-click UPI payment link on promised date",
      });
    }

    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  validatePolicy(action: string, context: PromiseContext, policy: MerchantPolicy): PolicyCheckOutput {
    return validatePolicy({
      action,
      channel: action.includes("WHATSAPP") ? "whatsapp" : "manual",
      amount: context.amount,
      retryCount: 0,
      paymentStatus: context.status === "FULFILLED" ? "succeeded" : "failed",
      contactPermission: context.contactPermission,
      caseId: `promise_${context.promiseId}`,
      customerId: context.customerId,
      merchantPolicy: policy,
    });
  }

  async execute(caseId: string, action: string, context: PromiseContext): Promise<Record<string, unknown>> {
    if (action === "SEND_PROMISE_REMINDER") {
      await defaultCommunicationProvider.sendMessage({
        to: context.customerPhone || context.customerEmail,
        channel: "whatsapp",
        template: "promise_due_reminder_v1",
        variables: {
          amount: `₹${(context.amount / 100).toLocaleString()}`,
          dueDate: new Date(context.promisedDate).toLocaleDateString(),
        },
      });
    }

    await logAuditEvent({
      caseId,
      actor: "ORCHESTRATOR",
      event: "ACTION_EXECUTED",
      metadata: {
        workflow: "PROMISE_TO_PAY",
        action,
        status: context.status,
      },
    });

    return {
      workflow: "PROMISE_TO_PAY",
      action,
      dispatched: true,
    };
  }

  async verify(caseId: string, context: PromiseContext): Promise<{ verified: boolean; amountRecovered: number }> {
    if (context.promiseId && context.promiseId !== "promise_demo") {
      await db
        .update(promisesToPay)
        .set({
          status: "FULFILLED",
          updatedAt: new Date(),
        })
        .where(eq(promisesToPay.id, context.promiseId));
    }

    return {
      verified: true,
      amountRecovered: context.amount,
    };
  }
}
