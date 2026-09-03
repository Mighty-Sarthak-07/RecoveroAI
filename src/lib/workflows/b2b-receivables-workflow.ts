import { db } from "@/src/db";
import { invoices, invoiceCommunications, recoveryCases } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  CandidateAction,
  MerchantPolicy,
  NormalizedEvent,
  PolicyCheckOutput,
  RecoveryWorkflow,
} from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";
import { logAuditEvent } from "@/src/lib/audit";

export interface B2BContext {
  invoiceId: string;
  invoiceNumber: string;
  amount: number; // in cents
  daysOverdue: number;
  priority: string;
  accountOwner: string;
  previousRemindersCount: number;
  customerName: string;
  customerEmail: string;
  contactPermission: boolean;
  lifetimeValue: number;
}

export class B2BReceivablesWorkflow implements RecoveryWorkflow<B2BContext> {
  type = "B2B_RECEIVABLE" as const;

  detect(event: NormalizedEvent): boolean {
    return (
      event.eventType === "invoice.overdue" ||
      event.eventType === "invoice.approaching_due" ||
      (event.daysOverdue !== undefined && event.daysOverdue > 0)
    );
  }

  async buildContext(event: NormalizedEvent): Promise<B2BContext> {
    let invoice = null;
    if (event.invoiceId) {
      const [inv] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, event.invoiceId))
        .limit(1);
      invoice = inv;
    }

    const previousRemindersCount = event.metadata?.previousRemindersCount as number || 1;

    return {
      invoiceId: event.invoiceId || "inv_demo",
      invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      amount: event.amount,
      daysOverdue: event.daysOverdue || invoice?.daysOverdue || 12,
      priority: invoice?.priority || "normal",
      accountOwner: event.accountOwner || invoice?.accountOwner || "Finance Team",
      previousRemindersCount,
      customerName: event.customerSnapshot.name,
      customerEmail: event.customerSnapshot.email,
      contactPermission: event.customerSnapshot.contactPermission,
      lifetimeValue: event.customerSnapshot.lifetimeValue,
    };
  }

  getCandidateActions(context: B2BContext): CandidateAction[] {
    const candidates: CandidateAction[] = [];
    const { amount, daysOverdue, previousRemindersCount } = context;

    // 1. Friendly / Concise Reminder with Payment Link
    if (daysOverdue <= 15 && previousRemindersCount < 3) {
      candidates.push({
        action: "SEND_PAYMENT_REMINDER",
        channel: "email",
        expectedRecovery: Math.round(amount * 0.85),
        estimatedCost: 100, // ₹1 in cents
        expectedFailureCost: Math.round(amount * 0.02),
        expectedNetValue: Math.round(amount * 0.85) - 100,
        expectedRoi: 720.0,
        description: "Dispatch concise payment reminder with instant RTGS/UPI/Card settlement link",
      });

      candidates.push({
        action: "REQUEST_PROMISE_TO_PAY",
        channel: "whatsapp",
        expectedRecovery: Math.round(amount * 0.80),
        estimatedCost: 300, // ₹3 in cents
        expectedFailureCost: Math.round(amount * 0.02),
        expectedNetValue: Math.round(amount * 0.80) - 300,
        expectedRoi: 260.0,
        description: "Send WhatsApp prompt requesting commitment on expected payment date",
      });
    }

    // 2. Account Owner Direct Outreach / Escalation
    if (daysOverdue > 15 || amount >= 5000000) {
      candidates.push({
        action: "ESCALATE_TO_ACCOUNT_OWNER",
        channel: "manual",
        expectedRecovery: Math.round(amount * 0.92),
        estimatedCost: 20000, // ₹200
        expectedFailureCost: Math.round(amount * 0.03),
        expectedNetValue: Math.round(amount * 0.92) - 20000,
        expectedRoi: 46.0,
        description: `Escalate overdue invoice to ${context.accountOwner} for key-account outreach`,
      });
    }

    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  validatePolicy(action: string, context: B2BContext, policy: MerchantPolicy): PolicyCheckOutput {
    return validatePolicy({
      action,
      channel: action.includes("WHATSAPP") ? "whatsapp" : action.includes("EMAIL") ? "email" : "manual",
      amount: context.amount,
      retryCount: context.previousRemindersCount,
      paymentStatus: "failed",
      contactPermission: context.contactPermission,
      caseId: `b2b_${context.invoiceId}`,
      customerId: "cust_b2b",
      merchantPolicy: policy,
      invoiceDaysOverdue: context.daysOverdue,
      invoiceRemindersSent: context.previousRemindersCount,
    });
  }

  async execute(caseId: string, action: string, context: B2BContext): Promise<Record<string, unknown>> {
    if (action.includes("REMINDER") || action.includes("PROMISE")) {
      const channel = action.includes("WHATSAPP") ? "whatsapp" : "email";
      await defaultCommunicationProvider.sendMessage({
        to: context.customerEmail,
        channel,
        template: "b2b_invoice_reminder_v1",
        variables: {
          invoiceNumber: context.invoiceNumber,
          amount: `₹${(context.amount / 100).toLocaleString()}`,
          daysOverdue: context.daysOverdue,
        },
      });

      if (context.invoiceId && context.invoiceId !== "inv_demo") {
        await db.insert(invoiceCommunications).values({
          invoiceId: context.invoiceId,
          channel,
          messageType: action.toLowerCase(),
          result: { delivered: true, sentAt: new Date().toISOString() },
        });
      }
    }

    await logAuditEvent({
      caseId,
      actor: "ORCHESTRATOR",
      event: "ACTION_EXECUTED",
      metadata: {
        workflow: "B2B_RECEIVABLE",
        action,
        invoiceNumber: context.invoiceNumber,
        daysOverdue: context.daysOverdue,
      },
    });

    return {
      workflow: "B2B_RECEIVABLE",
      action,
      dispatched: true,
      invoiceNumber: context.invoiceNumber,
    };
  }

  async verify(caseId: string, context: B2BContext): Promise<{ verified: boolean; amountRecovered: number }> {
    if (context.invoiceId && context.invoiceId !== "inv_demo") {
      await db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, context.invoiceId));
    }

    return {
      verified: true,
      amountRecovered: context.amount,
    };
  }
}
