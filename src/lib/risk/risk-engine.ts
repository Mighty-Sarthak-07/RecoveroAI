import { RiskAssessmentInput, RiskAssessmentOutput, RiskLevel } from "@/src/types/recovery";

/**
 * Deterministic Revenue Risk Engine
 * Computes explainable risk scores across all 7 revenue-recovery workflows.
 */
export function assessRevenueRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
  const reasons: string[] = [];

  // 1. Success events are not at risk
  if (input.eventType === "payment.success" || input.eventType === "promise.fulfilled") {
    return {
      atRisk: false,
      score: 0,
      level: "LOW",
      reasons: ["Revenue settled or obligation fulfilled successfully"],
      priority: 5,
    };
  }

  let baseScore = 40; // Base risk score

  // 2. Workflow & Event Type Classification
  const reason = (input.failureReason || "").toLowerCase();

  if (input.eventType === "invoice.overdue" || (input.daysOverdue !== undefined && input.daysOverdue > 0)) {
    const days = input.daysOverdue || 10;
    baseScore = 45;
    if (days >= 30) {
      baseScore += 35;
      reasons.push(`Invoice critically overdue by ${days} days`);
    } else if (days >= 15) {
      baseScore += 20;
      reasons.push(`Invoice overdue by ${days} days`);
    } else {
      baseScore += 10;
      reasons.push(`Invoice overdue by ${days} days (grace window)`);
    }
  } else if (input.eventType === "mandate.failed") {
    baseScore += 20;
    reasons.push("Recurring e-mandate / AutoPay debit failed");
  } else if (input.eventType === "promise.broken") {
    baseScore += 35;
    reasons.push("Customer promise-to-pay commitment broken");
  } else if (input.eventType === "voice.intent_detected") {
    baseScore += 15;
    reasons.push("Voice recovery interaction initiated");
  } else if (input.eventType === "checkout.abandoned") {
    baseScore += 10;
    reasons.push("Cart abandoned during checkout sequence");
  } else if (reason.includes("insufficient_funds") || reason.includes("balance")) {
    baseScore += 15;
    reasons.push("Temporary liquidity issue (insufficient funds)");
  } else if (reason.includes("expired_card") || reason.includes("card_expired")) {
    baseScore += 25;
    reasons.push("Payment method expired — requires card update");
  } else if (reason.includes("fraud") || reason.includes("stolen")) {
    baseScore += 45;
    reasons.push("High fraud risk or lost/stolen card indicator");
  } else {
    reasons.push("Unclassified revenue loss event");
  }

  // 3. Retry history / Reminders impact
  const retries = input.retryCount || input.mandateRetryCount || input.previousRemindersCount || 0;
  if (retries >= 3) {
    baseScore += 25;
    reasons.push(`Multiple prior collection/retry attempts (${retries} attempts)`);
  } else if (retries >= 1) {
    baseScore += 10;
    reasons.push(`Previous recovery attempt failed (${retries} attempt)`);
  }

  // 4. Customer loyalty & historical behavior
  const prevSuccesses = input.previousSuccessfulPayments || 0;
  if (prevSuccesses >= 5) {
    baseScore -= 15;
    reasons.push(`High loyalty customer (${prevSuccesses} prior successful payments)`);
  }

  // 5. Subscription / Mandate relationship
  if (input.hasActiveSubscription) {
    baseScore += 10;
    reasons.push("Active recurring contract at risk of churn");
  }

  // 6. High Value impact
  const amountInRupees = (input.amount || 0) / 100;
  if (amountInRupees >= 50000) {
    baseScore += 20;
    reasons.push(`High monetary impact (₹${amountInRupees.toLocaleString()})`);
  } else if (amountInRupees >= 5000) {
    baseScore += 10;
    reasons.push(`Significant transaction value (₹${amountInRupees.toLocaleString()})`);
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(5, Math.min(100, Math.round(baseScore)));

  // Derive risk level
  let level: RiskLevel = "MEDIUM";
  if (finalScore >= 80) level = "CRITICAL";
  else if (finalScore >= 60) level = "HIGH";
  else if (finalScore >= 40) level = "MEDIUM";
  else level = "LOW";

  let priority = 3;
  if (level === "CRITICAL") priority = 1;
  else if (level === "HIGH") priority = 2;
  else if (level === "MEDIUM") priority = 3;
  else priority = 4;

  return {
    atRisk: true,
    score: finalScore,
    level,
    reasons,
    priority,
  };
}
