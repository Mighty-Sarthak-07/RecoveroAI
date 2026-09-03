
import { GoogleGenAI } from "@google/genai";
import { AIDecisionOutput } from "@/src/types/recovery";
import {
  ContextParams,
  generateDeterministicDecision,
} from "@/src/lib/agent/deterministic-agent";

/**
 * AI Revenue Recovery Agent
 * Leverages Google Gemini API with structured JSON output and fallback to deterministic engine.
 */
export async function runRecoveryAgent(
  context: ContextParams
): Promise<AIDecisionOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to deterministic agent if API key not provided or in demo environment
  if (!apiKey || apiKey === "your_gemini_api_key" || apiKey.trim() === "") {
    return generateDeterministicDecision(context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const workflow = (context.workflowType || "PAYMENT_FAILURE").toUpperCase();

    const prompt = `
You are RecoveroAI's autonomous revenue recovery decision engine.
Your task is to analyze the revenue risk event, formulate root cause diagnosis, evaluate candidate interventions with economic ROI, and recommend the single best recovery action.

Recovery Workflow: ${workflow}

Context:
- Amount at Risk: ₹${((context.amountAtRisk || 0) / 100).toLocaleString()} (${context.amountAtRisk} cents)
- Failure Reason / Root Cause: ${context.failureReason || "insufficient_funds"}
- Prior Retries / Reminders Sent: ${context.retryCount || 0}
- Customer Name: ${context.customerName || "Customer"}
- Customer Lifetime Value (LTV): ₹${((context.customerLifetimeValue || 0) / 100).toLocaleString()}
- Prior Successful Settlements: ${context.previousSuccessfulPayments || 0}
- Prior Failures: ${context.previousFailures || 0}
- Active Subscription / Agreement: ${context.hasActiveSubscription ? "YES" : "NO"}
- Customer Contact Permission: ${context.contactPermission ? "YES" : "NO"}
${context.daysOverdue ? `- Days Overdue (B2B): ${context.daysOverdue} days` : ""}
${context.detectedIntent ? `- Detected Voice Intent: ${context.detectedIntent}` : ""}

Available Actions by Workflow:
- PAYMENT_FAILURE: IMMEDIATE_RETRY, DELAYED_RETRY, SEND_RECOVERY_EMAIL, SEND_WHATSAPP, HUMAN_ESCALATION
- B2B_RECEIVABLE: SEND_PAYMENT_REMINDER, REQUEST_PROMISE_TO_PAY, ESCALATE_TO_ACCOUNT_OWNER
- MANDATE_RETRY: SCHEDULE_MANDATE_RETRY, SEND_MANDATE_UPDATE_PROMPT, HUMAN_ESCALATION
- VOICE_RECOVERY: START_HINGLISH_VOICE_CALL, SEND_INSTANT_PAYMENT_LINK, CREATE_PROMISE_TO_PAY
- PROMISE_TO_PAY: SEND_PROMISE_REMINDER, ESCALATE_BROKEN_PROMISE

Return ONLY valid JSON matching this exact structure:
{
  "diagnosis": "concise root cause diagnosis string",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "candidateActions": [
    {
      "action": "ACTION_NAME",
      "channel": "gateway" | "email" | "whatsapp" | "voice" | "manual",
      "expectedRecovery": number_in_cents,
      "estimatedCost": number_in_cents,
      "expectedFailureCost": number_in_cents,
      "expectedNetValue": number_in_cents,
      "expectedRoi": number,
      "retryAfterHours": number_optional,
      "description": "string"
    }
  ],
  "selectedAction": "ACTION_NAME",
  "selectedChannel": "gateway" | "email" | "whatsapp" | "voice" | "manual",
  "retryAfterHours": number_optional,
  "expectedRecovery": number_in_cents,
  "estimatedCost": number_in_cents,
  "expectedNetValue": number_in_cents,
  "expectedRoi": number,
  "confidence": number_between_0_and_1,
  "evidence": ["bullet 1", "bullet 2", "bullet 3"],
  "requiresHumanApproval": boolean,
  "notes": "string explanation of economic decision"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim();
    if (responseText) {
      const parsed = JSON.parse(responseText) as AIDecisionOutput;
      if (parsed.selectedAction && parsed.candidateActions && parsed.candidateActions.length > 0) {
        return parsed;
      }
    }
    return generateDeterministicDecision(context);
  } catch (error) {
    console.warn("Gemini agent call failed, falling back to deterministic engine:", error);
    return generateDeterministicDecision(context);
  }
}
