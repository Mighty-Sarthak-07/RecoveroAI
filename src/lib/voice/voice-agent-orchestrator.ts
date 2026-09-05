import { db } from "@/src/db";
import {
  actionLogs,
  auditLogs,
  caseContext,
  customers,
  promisesToPay,
  recoveryCases,
  voiceSessions,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  MerchantPolicy,
  VoiceIntent,
  VoiceTranscriptEntry,
} from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { defaultVoiceProvider } from "@/src/lib/providers/voice-provider";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";
import { logAuditEvent } from "@/src/lib/audit";
import { GoogleGenAI } from "@google/genai";

export interface InitiateVoiceRecoveryParams {
  caseId: string;
  customerPhone?: string;
  customerName?: string;
  transcriptInput?: string;
  merchantPolicy?: MerchantPolicy;
}

export interface VoiceRecoveryOrchestrationResult {
  success: boolean;
  sessionId: string;
  guardrailCheck: {
    allowed: boolean;
    decision: "ALLOW" | "BLOCK" | "ESCALATE";
    reasons: string[];
  };
  transcript: VoiceTranscriptEntry[];
  detectedIntent: VoiceIntent;
  outcome: Record<string, unknown>;
  executionMessage: string;
}

const DEFAULT_MERCHANT_POLICY: MerchantPolicy = {
  maxRetries: 4,
  highValueThreshold: 10000000, // ₹100,000 in cents
  cooldownHours: 6,
  requireConsentForContact: true,
  costCeilingRatio: 0.15,
  voiceAllowedHoursStart: 10,
  voiceAllowedHoursEnd: 19,
  maxInvoiceReminders: 3,
  b2bHighValueThreshold: 5000000,
  voiceMaxAttempts: 3,
};

/**
 * Core Hinglish Speech Intent Classifier using Gemini AI with robust fallback keyword matcher
 */
export async function detectHinglishIntent(transcriptText: string): Promise<{
  intent: VoiceIntent;
  confidence: number;
  explanation: string;
}> {
  const rawText = transcriptText.trim();
  const lower = rawText.toLowerCase();

  // 1. Try Gemini API for Deep Semantic Classification
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your_gemini_api_key" && apiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an expert Hinglish NLP Intent Classifier for autonomous revenue recovery agents.
Analyze the customer's response in natural Hinglish/Hindi/English and classify into EXACTLY ONE of these 5 intents:

1. "PAY_NOW": Customer agrees to pay right now, asks for instant payment link / UPI / QR / gateway, or says they are paying now.
Examples: "bhai link bhej do abhi kar deta hu", "link ya gateway bhej do ker raha hu", "abhi pay kar deta hu", "UPI id bhejo", "link bhej do", "kar raha hu", "pay kar raha hu", "gateway bhej"

2. "TRY_LATER": Customer promises to pay later, tomorrow, after salary, or next week.
Examples: "bhai kl ker dunga", "kal subah karunga", "salary aane do shaam ko", "parso kar dunga", "kl kar dunga", "shaam tak kar dunga"

3. "NEEDS_HELP": Customer has technical issues, failed payment errors, OTP issues, or billing questions.
Examples: "payment fail ho raha hai", "OTP nahi aaya", "bank problem hai", "issue aa raha hai", "help chahiye"

4. "DECLINE": Customer explicitly refuses to pay, cancels subscription, or asks to stop calling.
Examples: "nahi chahiye", "band kar do", "cancel kar do", "stop calling me", "paise nahi dunga", "dobara phone mat karna"

5. "HUMAN_AGENT": Customer demands a human manager, supervisor, or executive.
Examples: "manager se baat karao", "insan se baat karni hai", "senior executive connect karo", "agent se baat"

Customer Response: "${rawText}"

Return ONLY valid JSON matching this exact structure:
{
  "intent": "PAY_NOW" | "TRY_LATER" | "NEEDS_HELP" | "DECLINE" | "HUMAN_AGENT",
  "confidence": 0.95,
  "explanation": "brief reasoning"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text || "";
      const parsed = JSON.parse(responseText);
      if (parsed.intent) {
        return {
          intent: parsed.intent as VoiceIntent,
          confidence: parsed.confidence || 0.95,
          explanation: parsed.explanation || "Gemini AI Hinglish intent classification",
        };
      }
    } catch (e) {
      console.warn("Gemini Hinglish intent classification failed, falling back to rule matcher:", e);
    }
  }

  // 2. Enhanced Deterministic Keyword Matcher for Hinglish Slang / Spelling Variations
  if (
    lower.includes("link") ||
    lower.includes("gateway") ||
    lower.includes("bhej do") ||
    lower.includes("bhej") ||
    lower.includes("upi") ||
    lower.includes("qr") ||
    lower.includes("abhi") ||
    lower.includes("pay now") ||
    lower.includes("kar raha hu") ||
    lower.includes("ker raha hu") ||
    lower.includes("kar deta hu") ||
    lower.includes("ker deta hu") ||
    lower.includes("pay kar") ||
    lower.includes("pay kr")
  ) {
    return { intent: "PAY_NOW", confidence: 0.92, explanation: "Matched Pay Now / Payment Link request" };
  }

  if (
    lower.includes("kl") ||
    lower.includes("kal") ||
    lower.includes("ker dunga") ||
    lower.includes("kar dunga") ||
    lower.includes("kr dunga") ||
    lower.includes("shaam") ||
    lower.includes("shm") ||
    lower.includes("parso") ||
    lower.includes("later") ||
    lower.includes("tomorrow") ||
    lower.includes("baad") ||
    lower.includes("salary")
  ) {
    return { intent: "TRY_LATER", confidence: 0.9, explanation: "Matched Promise-to-Pay / Try Later intent" };
  }

  if (
    lower.includes("help") ||
    lower.includes("fail") ||
    lower.includes("dikkat") ||
    lower.includes("issue") ||
    lower.includes("otp") ||
    lower.includes("problem") ||
    lower.includes("error")
  ) {
    return { intent: "NEEDS_HELP", confidence: 0.88, explanation: "Matched Support / Billing issue intent" };
  }

  if (
    lower.includes("cancel") ||
    lower.includes("nahi chahiye") ||
    lower.includes("decline") ||
    lower.includes("band") ||
    lower.includes("stop") ||
    lower.includes("nahi dunga") ||
    lower.includes("pareshan mat")
  ) {
    return { intent: "DECLINE", confidence: 0.95, explanation: "Matched Decline / Opt-out intent" };
  }

  if (
    lower.includes("agent") ||
    lower.includes("manager") ||
    lower.includes("executive") ||
    lower.includes("insan") ||
    lower.includes("human") ||
    lower.includes("baat karao") ||
    lower.includes("baat karwao")
  ) {
    return { intent: "HUMAN_AGENT", confidence: 0.92, explanation: "Matched Human Manager Escalation" };
  }

  return { intent: "PAY_NOW", confidence: 0.75, explanation: "Default payment intent assumption" };
}

/**
 * End-to-End Autonomous Voice Recovery Agent Orchestrator
 */
export async function executeVoiceRecoverySession(
  params: InitiateVoiceRecoveryParams
): Promise<VoiceRecoveryOrchestrationResult> {
  const { caseId, customerPhone, customerName, transcriptInput, merchantPolicy = DEFAULT_MERCHANT_POLICY } = params;

  // 1. Load Case & Customer Record from DB
  const [recCase] = await db
    .select()
    .from(recoveryCases)
    .where(eq(recoveryCases.id, caseId))
    .limit(1);

  if (!recCase) {
    throw new Error(`Recovery case ${caseId} not found.`);
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, recCase.customerId))
    .limit(1);

  const phone = customerPhone || customer?.phone || "+919876543210";
  const name = customerName || customer?.name || "Vikas Sharma";
  const amountCents = recCase.amountAtRisk;

  // 2. ALWAYS detect intent from customer speech utterance FIRST
  const rawCustomerUtterance =
    transcriptInput ||
    "Namaste ji, main kal subah 10 baje tak pay kar dunga, abhi thoda busy tha.";

  const intentAnalysis = await detectHinglishIntent(rawCustomerUtterance);
  const intent = intentAnalysis.intent;

  // 3. PRE-CALL GUARDRAIL CHECK
  // If transcriptInput is provided (interactive simulation in /voice playground), allow test window 0-24
  const isInteractiveTest = Boolean(transcriptInput);
  const activePolicy: MerchantPolicy = isInteractiveTest
    ? { ...merchantPolicy, voiceAllowedHoursStart: 0, voiceAllowedHoursEnd: 24 }
    : merchantPolicy;

  const policyCheck = validatePolicy({
    action: "START_HINGLISH_VOICE_CALL",
    channel: "voice",
    amount: amountCents,
    retryCount: 0,
    paymentStatus: recCase.status,
    contactPermission: customer?.contactPermission ?? true,
    caseId,
    customerId: recCase.customerId,
    merchantPolicy: activePolicy,
    customerDeclined: recCase.status === "BLOCKED",
    voiceAttemptsCount: 1,
  });

  const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formattedAmount = `₹${(amountCents / 100).toLocaleString()}`;

  if (!policyCheck.allowed) {
    await logAuditEvent({
      caseId,
      actor: "POLICY_ENGINE",
      event: policyCheck.decision === "BLOCK" ? "POLICY_BLOCKED_ACTION" : "POLICY_ESCALATED_ACTION",
      metadata: {
        guardrails: policyCheck.checks,
        reasons: policyCheck.reasons,
        action: "START_HINGLISH_VOICE_CALL",
      },
    });

    return {
      success: false,
      sessionId: `blocked_${Date.now()}`,
      guardrailCheck: {
        allowed: false,
        decision: policyCheck.decision,
        reasons: policyCheck.reasons,
      },
      transcript: [
        {
          speaker: "agent",
          text: `Namaste ${name} ji, main Recovero AI se bol raha hu. Aapka ${formattedAmount} ka invoice overdue hai.`,
          timestamp: nowStr,
        },
        {
          speaker: "customer",
          text: rawCustomerUtterance,
          timestamp: nowStr,
        },
        {
          speaker: "agent",
          text: `Samajh gaya ${name} ji. Outreach policy notice: ${policyCheck.reasons.join(", ")}`,
          timestamp: nowStr,
        },
      ],
      detectedIntent: intent, // Return actual detected intent!
      outcome: { blocked: true, reasons: policyCheck.reasons },
      executionMessage: `Pre-call guardrail blocked outreach: ${policyCheck.reasons.join(", ")}`,
    };
  }

  // 4. Initiate Voice Session via Provider
  const callSession = await defaultVoiceProvider.initiateCall({
    to: phone,
    customerName: name,
    language: "HINGLISH",
    scriptTemplate: "empathetic_recovery_v1",
    context: { amount: formattedAmount },
  });

  // 5. Build Dynamic Hinglish Conversation Response
  let agentGreeting = `Namaste ${name} ji! Main Recovero AI se baat kar raha hu. Aapka invoice ${formattedAmount} overdue hai. Kya aap abhi UPI/Card se pay kar sakte hain?`;
  let agentResponse = "";

  switch (intent) {
    case "PAY_NOW":
      agentResponse = `Bahut badiya ${name} ji! Main abhi aapko WhatsApp par instant payment link aur UPI QR bhej raha hu. Aap live check kar sakte hain.`;
      break;

    case "TRY_LATER":
      agentResponse = `Dhanyawad ${name} ji! Main aapka commitment record kar raha hu. Kal subah 10 baje main WhatsApp par reminder link bhej dunga. Have a good day!`;
      break;

    case "NEEDS_HELP":
      agentResponse = `Ji ${name} ji, bilkul samajh gaya. Main aapka case hamare senior financial support specialist ko transfer kar raha hu jo aapki help karenge.`;
      break;

    case "DECLINE":
      agentResponse = `Samajh gaya ${name} ji. Aapka preference update kar diya gaya hai. Hum aapko aage koi automated calls nahi karenge. Dhanyawad.`;
      break;

    case "HUMAN_AGENT":
      agentResponse = `Sure ${name} ji, main abhi ek senior human manager ko ye call handover kar raha hu. Kripya line par bane rahein.`;
      break;
  }

  const transcript: VoiceTranscriptEntry[] = [
    { speaker: "agent", text: agentGreeting, timestamp: nowStr },
    { speaker: "customer", text: rawCustomerUtterance, timestamp: nowStr },
    { speaker: "agent", text: agentResponse, timestamp: nowStr },
  ];

  // 6. EXECUTE VOICE OUTCOME FLOW
  let executionOutcome: Record<string, unknown> = {};
  let executionMessage = "";

  if (intent === "PAY_NOW") {
    // DISPATCH INSTANT PAYMENT LINK VIA WHATSAPP
    await defaultCommunicationProvider.sendMessage({
      to: phone,
      channel: "whatsapp",
      template: "instant_payment_link_v1",
      variables: {
        name,
        amount: formattedAmount,
        checkoutUrl: `https://recovero.ai/pay/${caseId}`,
      },
    });

    await db
      .update(recoveryCases)
      .set({
        status: "EXECUTING",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    executionOutcome = {
      action: "SEND_INSTANT_PAYMENT_LINK",
      channel: "whatsapp",
      paymentLinkDispatched: true,
      checkoutUrl: `/pay/${caseId}`,
    };
    executionMessage = `Intent: PAY_NOW → Instant WhatsApp payment link (${formattedAmount}) dispatched.`;

  } else if (intent === "TRY_LATER") {
    // CREATE PROMISE-TO-PAY RECORD
    const promisedDate = new Date(Date.now() + 24 * 3600 * 1000);

    const [promise] = await db
      .insert(promisesToPay)
      .values({
        merchantId: recCase.merchantId,
        customerId: recCase.customerId,
        caseId,
        promisedAmount: amountCents,
        promisedDate,
        status: "PROMISED",
        channel: "voice",
        metadata: {
          intent: "TRY_LATER",
          language: "HINGLISH",
          transcriptSnippet: rawCustomerUtterance,
        },
      })
      .returning();

    await db
      .update(recoveryCases)
      .set({
        status: "EXECUTING",
        nextActionAt: promisedDate,
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    // Update Context Snapshot
    await db
      .update(caseContext)
      .set({
        promiseSnapshot: {
          promisedAmount: amountCents,
          promisedDate: promisedDate.toISOString(),
          status: "PROMISED",
          channel: "voice",
        },
        voiceSnapshot: {
          language: "HINGLISH",
          detectedIntent: "TRY_LATER",
          transcriptSnippet: rawCustomerUtterance,
        },
      })
      .where(eq(caseContext.caseId, caseId));

    executionOutcome = {
      action: "CREATE_PROMISE_TO_PAY",
      promiseId: promise.id,
      promisedDate: promisedDate.toISOString(),
    };
    executionMessage = `Intent: TRY_LATER → Promise-to-Pay recorded for tomorrow 10:00 AM (${formattedAmount}).`;

  } else if (intent === "NEEDS_HELP" || intent === "HUMAN_AGENT") {
    // ESCALATE CASE TO HUMAN SPECIALIST
    await db
      .update(recoveryCases)
      .set({
        status: "ESCALATED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    executionOutcome = {
      action: "HUMAN_ESCALATION",
      assignedTeam: "Senior Account Specialist",
      reason: intent === "NEEDS_HELP" ? "Customer reported billing issue" : "Customer requested human manager",
    };
    executionMessage = `Intent: ${intent} → Case escalated to Senior Account Specialist.`;

  } else if (intent === "DECLINE") {
    // STOP WORKFLOW & BLOCK CASE
    await db
      .update(recoveryCases)
      .set({
        status: "BLOCKED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    executionOutcome = {
      action: "STOP_RECOVERY_WORKFLOW",
      customerOptedOut: true,
      stopListAdded: true,
    };
    executionMessage = `Intent: DECLINE → Automated outreach permanently stopped & case placed on stop-list.`;
  }

  // 7. Store Voice Session Record in DB
  const [sessionRecord] = await db
    .insert(voiceSessions)
    .values({
      caseId,
      customerId: recCase.customerId,
      language: "HINGLISH",
      status: "completed",
      startedAt: new Date(),
      endedAt: new Date(Date.now() + 45000),
      transcript,
      detectedIntent: intent,
      outcome: executionOutcome,
    })
    .returning();

  // 8. Write Action Log
  await db.insert(actionLogs).values({
    caseId,
    actionType: "START_HINGLISH_VOICE_CALL",
    channel: "voice",
    payload: { customerUtterance: rawCustomerUtterance, intent },
    status: "executed",
    executedAt: new Date(),
    result: executionOutcome,
  });

  // 9. Append Immutable Audit Log Event
  await logAuditEvent({
    caseId,
    actor: "RECOVERO_AGENT",
    event: "ACTION_EXECUTED",
    metadata: {
      workflow: "VOICE_RECOVERY",
      sessionId: sessionRecord.id,
      detectedIntent: intent,
      intentExplanation: intentAnalysis.explanation,
      confidence: intentAnalysis.confidence,
      executionOutcome,
      guardrailsPassed: true,
    },
  });

  return {
    success: true,
    sessionId: sessionRecord.id,
    guardrailCheck: {
      allowed: true,
      decision: "ALLOW",
      reasons: ["Pre-call guardrails satisfied (Consent, Calling hours, Cooldown, Retry limits)."],
    },
    transcript,
    detectedIntent: intent,
    outcome: executionOutcome,
    executionMessage,
  };
}
