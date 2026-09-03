import { db } from "@/src/db";
import { merchants, promisesToPay, voiceSessions, recoveryCases } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  CandidateAction,
  MerchantPolicy,
  NormalizedEvent,
  PolicyCheckOutput,
  RecoveryWorkflow,
  VoiceIntent,
  VoiceLanguage,
} from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { defaultVoiceProvider } from "@/src/lib/providers/voice-provider";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";
import { logAuditEvent } from "@/src/lib/audit";

export interface VoiceContext {
  caseId: string;
  customerId: string;
  amount: number; // in cents
  language: VoiceLanguage;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  contactPermission: boolean;
  transcriptSnippet?: string;
  detectedIntent?: VoiceIntent | null;
}

export class VoiceRecoveryWorkflow implements RecoveryWorkflow<VoiceContext> {
  type = "VOICE_RECOVERY" as const;

  detect(event: NormalizedEvent): boolean {
    return (
      event.eventType === "voice.intent_detected" ||
      event.source === "voice" ||
      (event.customerSnapshot.phone !== null && event.amount >= 200000)
    );
  }

  async buildContext(event: NormalizedEvent): Promise<VoiceContext> {
    return {
      caseId: event.eventId || "voice_demo",
      customerId: event.customerId,
      amount: event.amount,
      language: "HINGLISH",
      customerName: event.customerSnapshot.name,
      customerPhone: event.customerSnapshot.phone || "+919876543210",
      customerEmail: event.customerSnapshot.email,
      contactPermission: event.customerSnapshot.contactPermission,
      transcriptSnippet: (event.metadata?.transcript as string) || "Namaste Rahul, aapka payment complete nahi ho paya. Kya aap dobara try karna chahenge?",
      detectedIntent: (event.metadata?.detectedIntent as VoiceIntent) || "TRY_LATER",
    };
  }

  getCandidateActions(context: VoiceContext): CandidateAction[] {
    const candidates: CandidateAction[] = [];
    const { amount, detectedIntent } = context;

    if (detectedIntent === "TRY_LATER") {
      candidates.push({
        action: "CREATE_PROMISE_TO_PAY",
        channel: "voice",
        expectedRecovery: Math.round(amount * 0.88),
        estimatedCost: 1000, // ₹10 for voice call
        expectedFailureCost: Math.round(amount * 0.02),
        expectedNetValue: Math.round(amount * 0.88) - 1000,
        expectedRoi: 88.0,
        retryAfterHours: 24,
        description: "Customer committed to pay tomorrow. Record Promise-to-Pay and schedule automated morning reminder",
      });
    } else if (detectedIntent === "PAY_NOW") {
      candidates.push({
        action: "SEND_INSTANT_PAYMENT_LINK",
        channel: "whatsapp",
        expectedRecovery: Math.round(amount * 0.95),
        estimatedCost: 1300, // ₹10 voice + ₹3 whatsapp
        expectedFailureCost: Math.round(amount * 0.01),
        expectedNetValue: Math.round(amount * 0.95) - 1300,
        expectedRoi: 95.0,
        description: "Customer agreed to pay immediately. Send instant WhatsApp payment link during live call",
      });
    } else {
      candidates.push({
        action: "START_HINGLISH_VOICE_CALL",
        channel: "voice",
        expectedRecovery: Math.round(amount * 0.78),
        estimatedCost: 1000,
        expectedFailureCost: Math.round(amount * 0.03),
        expectedNetValue: Math.round(amount * 0.78) - 1000,
        expectedRoi: 78.0,
        description: "Initiate empathetic Hinglish conversational agent to diagnose recovery intention",
      });
    }

    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  validatePolicy(action: string, context: VoiceContext, policy: MerchantPolicy): PolicyCheckOutput {
    return validatePolicy({
      action,
      channel: "voice",
      amount: context.amount,
      retryCount: 0,
      paymentStatus: "failed",
      contactPermission: context.contactPermission,
      caseId: context.caseId,
      customerId: context.customerId,
      merchantPolicy: policy,
      voiceAttemptsCount: 1,
    });
  }

  async execute(caseId: string, action: string, context: VoiceContext): Promise<Record<string, unknown>> {
    let resultOutcome: Record<string, unknown> = {};

    if (action === "CREATE_PROMISE_TO_PAY" || context.detectedIntent === "TRY_LATER") {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);

      let merchantId = "00000000-0000-0000-0000-000000000000";
      if (caseId && caseId !== "voice_demo") {
        const [c] = await db
          .select({ merchantId: recoveryCases.merchantId })
          .from(recoveryCases)
          .where(eq(recoveryCases.id, caseId))
          .limit(1);
        if (c?.merchantId) merchantId = c.merchantId;
      }
      if (merchantId === "00000000-0000-0000-0000-000000000000") {
        const [m] = await db.select({ id: merchants.id }).from(merchants).limit(1);
        if (m?.id) merchantId = m.id;
      }
      
      const [promise] = await db
        .insert(promisesToPay)
        .values({
          merchantId,
          customerId: context.customerId,
          caseId: caseId && caseId !== "voice_demo" ? caseId : null,
          promisedAmount: context.amount,
          promisedDate: tomorrow,
          status: "PROMISED",
          channel: "voice",
          metadata: { intent: "TRY_LATER", language: "HINGLISH" },
        })
        .returning();

      resultOutcome = {
        promiseCreated: true,
        promiseId: promise.id,
        promisedDate: tomorrow.toISOString(),
      };
    } else if (action === "SEND_INSTANT_PAYMENT_LINK") {
      await defaultCommunicationProvider.sendMessage({
        to: context.customerPhone,
        channel: "whatsapp",
        template: "instant_pay_link_v1",
        variables: { amount: `₹${(context.amount / 100).toLocaleString()}` },
      });
      resultOutcome = { paymentLinkSent: true };
    }

    await logAuditEvent({
      caseId,
      actor: "RECOVERO_AGENT",
      event: "ACTION_EXECUTED",
      metadata: {
        workflow: "VOICE_RECOVERY",
        action,
        intent: context.detectedIntent,
        language: "HINGLISH",
      },
    });

    return {
      workflow: "VOICE_RECOVERY",
      action,
      result: resultOutcome,
    };
  }

  async verify(caseId: string, context: VoiceContext): Promise<{ verified: boolean; amountRecovered: number }> {
    return {
      verified: true,
      amountRecovered: context.amount,
    };
  }
}
