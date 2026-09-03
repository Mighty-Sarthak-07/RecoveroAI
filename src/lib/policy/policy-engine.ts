import {
  PolicyCheckInput,
  PolicyCheckOutput,
  PolicyDecision,
  PolicyRuleResult,
} from "@/src/types/recovery";

/**
 * Deterministic Business Policy Validation Engine
 * Enforces strict merchant guardrails across all 7 revenue recovery workflows.
 */
export function validatePolicy(input: PolicyCheckInput): PolicyCheckOutput {
  const checks: PolicyRuleResult[] = [];
  const reasons: string[] = [];
  let finalDecision: PolicyDecision = "ALLOW";

  const {
    merchantPolicy,
    action,
    amount,
    retryCount,
    paymentStatus,
    contactPermission,
    executedActionsHistory,
  } = input;

  // RULE 3 — ALREADY RECOVERED
  if (paymentStatus === "succeeded" || paymentStatus === "RECOVERED" || paymentStatus === "paid") {
    checks.push({
      rule: "RULE_3_ALREADY_RECOVERED",
      status: "BLOCK",
      reason: "Payment or invoice is already marked as succeeded. No further action permitted.",
    });
    return {
      decision: "BLOCK",
      allowed: false,
      reasons: ["Obligation is already recovered."],
      checks,
    };
  }

  // RULE 1 — MAX RETRIES (Payment & Mandates)
  const maxRetries = input.mandateAttemptCount !== undefined
    ? merchantPolicy.maxMandateRetries || 3
    : merchantPolicy.maxRetries || 4;

  if (action.includes("RETRY") && retryCount >= maxRetries) {
    checks.push({
      rule: "RULE_1_MAX_RETRIES",
      status: "ESCALATE",
      reason: `Maximum retry limit of ${maxRetries} reached (current: ${retryCount}).`,
    });
    finalDecision = "ESCALATE";
    reasons.push(`Exceeded max allowed retries (${maxRetries}).`);
  } else if (action.includes("RETRY")) {
    checks.push({
      rule: "RULE_1_MAX_RETRIES",
      status: "ALLOW",
      reason: `Retry count (${retryCount}) is within configured limit (${maxRetries}).`,
    });
  }

  // RULE 2 — HIGH VALUE
  const highValueThreshold = action.includes("INVOICE") || action.includes("ACCOUNT_OWNER")
    ? merchantPolicy.b2bHighValueThreshold || 5000000
    : merchantPolicy.highValueThreshold || 10000000;

  if (amount >= highValueThreshold) {
    const formattedAmount = (amount / 100).toLocaleString();
    const formattedThreshold = (highValueThreshold / 100).toLocaleString();
    checks.push({
      rule: "RULE_2_HIGH_VALUE",
      status: "ESCALATE",
      reason: `Transaction value (₹${formattedAmount}) exceeds threshold (₹${formattedThreshold}). Requires human authorization.`,
    });
    finalDecision = "ESCALATE";
    reasons.push(`High-value transaction above ₹${formattedThreshold}.`);
  } else {
    checks.push({
      rule: "RULE_2_HIGH_VALUE",
      status: "ALLOW",
      reason: "Transaction value is within automated recovery limit.",
    });
  }

  // RULE 4 — CUSTOMER CONTACT PERMISSION
  const isCommunicationAction =
    action.includes("EMAIL") ||
    action.includes("WHATSAPP") ||
    action.includes("SMS") ||
    action.includes("VOICE") ||
    action.includes("REMINDER") ||
    input.channel === "email" ||
    input.channel === "whatsapp" ||
    input.channel === "sms" ||
    input.channel === "voice";

  if (isCommunicationAction && !contactPermission) {
    checks.push({
      rule: "RULE_4_CUSTOMER_CONTACT",
      status: "BLOCK",
      reason: "Customer has opted out of direct outreach channels.",
    });
    finalDecision = "BLOCK";
    reasons.push("Customer communication permission revoked.");
  } else if (isCommunicationAction) {
    checks.push({
      rule: "RULE_4_CUSTOMER_CONTACT",
      status: "ALLOW",
      reason: "Customer has authorized communication via this channel.",
    });
  }

  // RULE 5 — DUPLICATE ACTION
  if (executedActionsHistory && executedActionsHistory.includes(action)) {
    checks.push({
      rule: "RULE_5_DUPLICATE_ACTION",
      status: "BLOCK",
      reason: `Action '${action}' was already executed for this recovery case.`,
    });
    finalDecision = "BLOCK";
    reasons.push(`Duplicate action protection triggered for ${action}.`);
  } else {
    checks.push({
      rule: "RULE_5_DUPLICATE_ACTION",
      status: "ALLOW",
      reason: "No duplicate action detected for this recovery cycle.",
    });
  }

  // RULE 8 — B2B REMINDER FREQUENCY LIMIT
  if (input.invoiceRemindersSent !== undefined && (action.includes("REMINDER") || action.includes("INVOICE"))) {
    const maxReminders = merchantPolicy.maxInvoiceReminders || 3;
    if (input.invoiceRemindersSent >= maxReminders) {
      checks.push({
        rule: "RULE_8_B2B_REMINDER_LIMIT",
        status: "ESCALATE",
        reason: `Maximum invoice reminders (${maxReminders}) reached. Requires account owner escalation.`,
      });
      finalDecision = "ESCALATE";
      reasons.push(`Invoice reminders limit of ${maxReminders} reached.`);
    } else {
      checks.push({
        rule: "RULE_8_B2B_REMINDER_LIMIT",
        status: "ALLOW",
        reason: `Invoice reminders count (${input.invoiceRemindersSent}) within limit (${maxReminders}).`,
      });
    }
  }

  // RULE 9 — VOICE CALLING HOURS
  if (action.includes("VOICE") || input.channel === "voice") {
    const startHour = merchantPolicy.voiceAllowedHoursStart ?? 10;
    const endHour = merchantPolicy.voiceAllowedHoursEnd ?? 19;
    const currentHour = new Date().getHours();

    if (currentHour < startHour || currentHour >= endHour) {
      checks.push({
        rule: "RULE_9_VOICE_CALLING_HOURS",
        status: "BLOCK",
        reason: `Voice outreach restricted outside business hours (${startHour}:00 - ${endHour}:00).`,
      });
      finalDecision = "BLOCK";
      reasons.push("Voice calling hours restriction active.");
    } else {
      checks.push({
        rule: "RULE_9_VOICE_CALLING_HOURS",
        status: "ALLOW",
        reason: "Within permissible voice outreach window.",
      });
    }
  }

  // RULE 6 — COST CEILING
  if (input.estimatedCost && input.expectedRecovery && input.expectedRecovery > 0) {
    const costRatio = input.estimatedCost / input.expectedRecovery;
    const limitRatio = merchantPolicy.costCeilingRatio || 0.15;
    if (costRatio > limitRatio) {
      checks.push({
        rule: "RULE_6_COST_CEILING",
        status: "BLOCK",
        reason: `Intervention cost (${(costRatio * 100).toFixed(1)}%) exceeds allowable ratio (${(limitRatio * 100).toFixed(1)}%).`,
      });
      finalDecision = "BLOCK";
      reasons.push("Intervention cost exceeds merchant economic ceiling.");
    } else {
      checks.push({
        rule: "RULE_6_COST_CEILING",
        status: "ALLOW",
        reason: "Cost to expected recovery ratio is economically viable.",
      });
    }
  }

  return {
    decision: finalDecision,
    allowed: finalDecision === "ALLOW",
    reasons,
    checks,
  };
}
