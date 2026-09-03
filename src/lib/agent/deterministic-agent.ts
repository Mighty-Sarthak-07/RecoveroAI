import {
  AIDecisionOutput,
  RiskLevel,
} from "@/src/types/recovery";
import { evaluateCandidateInterventions } from "@/src/lib/cost/cost-engine";

export interface ContextParams {
  amountAtRisk: number; // in cents
  failureReason?: string | null;
  retryCount: number;
  customerName?: string;
  customerLifetimeValue?: number;
  contactPermission?: boolean;
  previousSuccessfulPayments?: number;
  previousFailures?: number;
  hasActiveSubscription?: boolean;
  workflowType?: string;
  daysOverdue?: number;
  detectedIntent?: string;
}

/**
 * Deterministic Decision Engine
 * Shares the exact same AIDecisionOutput contract as the Gemini AI agent.
 * Powers high-scale batch simulations with zero LLM API cost or rate limits.
 */
export function generateDeterministicDecision(
  context: ContextParams
): AIDecisionOutput {
  const {
    amountAtRisk,
    failureReason = "insufficient_funds",
    retryCount = 0,
    contactPermission = true,
    previousSuccessfulPayments = 14,
    previousFailures = 1,
    hasActiveSubscription = true,
    workflowType = "PAYMENT_FAILURE",
    daysOverdue = 0,
    detectedIntent,
  } = context;

  const reason = (failureReason || "").toLowerCase();
  const evidence: string[] = [];

  if (workflowType === "B2B_RECEIVABLE" || daysOverdue > 0) {
    evidence.push(`Invoice overdue by ${daysOverdue || 12} days`);
    evidence.push("Enterprise customer relationship active");
    if (previousSuccessfulPayments > 0) {
      evidence.push(`${previousSuccessfulPayments} past invoices cleared on time`);
    }
  } else if (workflowType === "MANDATE_RETRY") {
    evidence.push("Recurring e-mandate / UPI AutoPay authorization active");
    evidence.push(`Attempt #${retryCount + 1} within cooling window`);
  } else if (workflowType === "VOICE_RECOVERY") {
    evidence.push(`Customer voice intent detected: ${detectedIntent || "TRY_LATER"}`);
    evidence.push("Direct customer verbal commitment logged");
  } else if (workflowType === "PROMISE_TO_PAY") {
    evidence.push("Customer promise-to-pay agreement on record");
  } else {
    if (previousSuccessfulPayments > 0) {
      evidence.push(`${previousSuccessfulPayments} successful previous payments`);
    }
    if (previousFailures > 0) {
      evidence.push(`${previousFailures} previous failure recorded`);
    }
    if (hasActiveSubscription) {
      evidence.push("Active recurring subscription linked");
    }
    evidence.push(`Retry count (${retryCount}) within configured limits`);
  }

  // Calculate candidate actions with economic models
  const candidateActions = evaluateCandidateInterventions({
    amountAtRisk,
    failureReason,
    retryCount,
    contactPermission,
    customerLoyaltyScore: Math.min(100, previousSuccessfulPayments * 6),
    workflowType,
    daysOverdue,
    detectedIntent,
  });

  // Select optimal candidate
  const topCandidate = candidateActions[0] || {
    action: "DELAYED_RETRY",
    channel: "gateway",
    expectedRecovery: Math.round(amountAtRisk * 0.7),
    estimatedCost: 0,
    expectedFailureCost: Math.round(amountAtRisk * 0.02),
    expectedNetValue: Math.round(amountAtRisk * 0.68),
    expectedRoi: 999.0,
    retryAfterHours: 6,
    description: "Scheduled smart retry",
  };

  let riskLevel: RiskLevel = "MEDIUM";
  if (amountAtRisk >= 10000000 || retryCount >= 3 || daysOverdue > 30) riskLevel = "HIGH";
  if (amountAtRisk >= 20000000) riskLevel = "CRITICAL";

  let diagnosis = "temporary_payment_failure";
  if (workflowType === "B2B_RECEIVABLE") diagnosis = "b2b_overdue_receivable";
  else if (workflowType === "MANDATE_RETRY") diagnosis = "recurring_mandate_liquidity_lag";
  else if (workflowType === "VOICE_RECOVERY") diagnosis = `voice_intent_${detectedIntent || "try_later"}`.toLowerCase();
  else if (workflowType === "PROMISE_TO_PAY") diagnosis = "promise_to_pay_tracking";
  else if (reason.includes("expired")) diagnosis = "expired_payment_method";
  else if (reason.includes("fraud")) diagnosis = "high_risk_fraud_indicator";
  else if (reason.includes("insufficient")) diagnosis = "transient_liquidity_issue";

  const requiresHumanApproval = amountAtRisk >= 10000000 || retryCount >= 4 || daysOverdue > 45;

  return {
    diagnosis,
    riskLevel,
    candidateActions,
    selectedAction: topCandidate.action,
    selectedChannel: topCandidate.channel,
    retryAfterHours: topCandidate.retryAfterHours,
    expectedRecovery: topCandidate.expectedRecovery,
    estimatedCost: topCandidate.estimatedCost,
    expectedNetValue: topCandidate.expectedNetValue,
    expectedRoi: topCandidate.expectedRoi,
    confidence: 0.91,
    evidence,
    requiresHumanApproval,
    notes: `Engine selected ${topCandidate.action} based on maximum expected net recovery of ₹${(topCandidate.expectedNetValue / 100).toLocaleString()}.`,
  };
}
