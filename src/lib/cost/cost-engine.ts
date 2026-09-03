import {
  ActionCostConfig,
  CandidateAction,
  DEFAULT_ACTION_COSTS,
} from "@/src/types/recovery";

export interface CalculateInterventionParams {
  amountAtRisk: number; // in cents
  failureReason?: string | null;
  retryCount: number;
  contactPermission: boolean;
  customerLoyaltyScore?: number; // 0 - 100
  workflowType?: string;
  daysOverdue?: number;
  detectedIntent?: string;
  costs?: Partial<ActionCostConfig>;
}

/**
 * Evaluates candidate recovery interventions with cost-aware economics across all workflows.
 */
export function evaluateCandidateInterventions(
  params: CalculateInterventionParams
): CandidateAction[] {
  const {
    amountAtRisk,
    failureReason = "",
    retryCount,
    contactPermission,
    customerLoyaltyScore = 50,
    workflowType = "PAYMENT_FAILURE",
    daysOverdue = 0,
    detectedIntent,
    costs = {},
  } = params;

  const costConfig: ActionCostConfig = { ...DEFAULT_ACTION_COSTS, ...costs };
  const reason = (failureReason || "").toLowerCase();
  const candidates: CandidateAction[] = [];

  const calculateEconomics = (
    action: string,
    channel: string,
    recoveryProbability: number,
    cost: number,
    failureCostRatio = 0.05,
    retryAfterHours?: number,
    description = ""
  ): CandidateAction => {
    const expectedRecovery = Math.round(amountAtRisk * recoveryProbability);
    const expectedFailureCost = Math.round(amountAtRisk * (1 - recoveryProbability) * failureCostRatio);
    const expectedNetValue = expectedRecovery - cost - expectedFailureCost;

    const expectedRoi =
      cost > 0
        ? Number((Math.max(0, expectedNetValue) / cost).toFixed(2))
        : 999.0;

    return {
      action,
      channel,
      expectedRecovery,
      estimatedCost: cost,
      expectedFailureCost,
      expectedNetValue,
      expectedRoi,
      retryAfterHours,
      description,
    };
  };

  // 1. B2B RECEIVABLES WORKFLOW
  if (workflowType === "B2B_RECEIVABLE" || daysOverdue > 0) {
    if (contactPermission && daysOverdue <= 20) {
      candidates.push(
        calculateEconomics(
          "SEND_PAYMENT_REMINDER",
          "email",
          0.85,
          costConfig.SEND_EMAIL,
          0.01,
          0,
          "Send concise invoice payment reminder with instant RTGS/UPI link"
        )
      );

      candidates.push(
        calculateEconomics(
          "REQUEST_PROMISE_TO_PAY",
          "whatsapp",
          0.80,
          costConfig.SEND_WHATSAPP,
          0.01,
          0,
          "Request formal Promise-to-Pay commitment on expected clearance date"
        )
      );
    }

    candidates.push(
      calculateEconomics(
        "ESCALATE_TO_ACCOUNT_OWNER",
        "manual",
        0.92,
        costConfig.B2B_HUMAN_ESCALATION,
        0.02,
        0,
        "Direct escalation to dedicated Account Owner for enterprise engagement"
      )
    );
    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  // 2. MANDATE RETRY SEQUENCER
  if (workflowType === "MANDATE_RETRY" || reason.includes("mandate")) {
    if (retryCount < 3) {
      const hours = retryCount === 0 ? 6 : 24;
      candidates.push(
        calculateEconomics(
          "SCHEDULE_MANDATE_RETRY",
          "gateway",
          0.78 - retryCount * 0.12,
          costConfig.RETRY_PAYMENT,
          0.02,
          hours,
          `Schedule mandate re-presentment attempt after ${hours}h cooling window`
        )
      );
    }
    if (contactPermission) {
      candidates.push(
        calculateEconomics(
          "SEND_MANDATE_UPDATE_PROMPT",
          "whatsapp",
          0.72,
          costConfig.SEND_WHATSAPP,
          0.01,
          0,
          "Notify customer to fund account or update recurring mandate source"
        )
      );
    }
    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  // 3. HINGLISH VOICE RECOVERY
  if (workflowType === "VOICE_RECOVERY" || detectedIntent) {
    if (detectedIntent === "TRY_LATER") {
      candidates.push(
        calculateEconomics(
          "CREATE_PROMISE_TO_PAY",
          "voice",
          0.88,
          costConfig.VOICE_CALL,
          0.02,
          24,
          "Record Promise-to-Pay for tomorrow based on customer verbal commitment"
        )
      );
    } else if (detectedIntent === "PAY_NOW") {
      candidates.push(
        calculateEconomics(
          "SEND_INSTANT_PAYMENT_LINK",
          "whatsapp",
          0.95,
          costConfig.VOICE_CALL + costConfig.SEND_WHATSAPP,
          0.01,
          0,
          "Send instant payment link during call for immediate checkout"
        )
      );
    } else {
      candidates.push(
        calculateEconomics(
          "START_HINGLISH_VOICE_CALL",
          "voice",
          0.78,
          costConfig.VOICE_CALL,
          0.03,
          0,
          "Initiate conversational Hinglish voice recovery call"
        )
      );
    }
    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  // 4. PROMISE TO PAY
  if (workflowType === "PROMISE_TO_PAY") {
    if (contactPermission) {
      candidates.push(
        calculateEconomics(
          "SEND_PROMISE_REMINDER",
          "whatsapp",
          0.90,
          costConfig.SEND_WHATSAPP,
          0.01,
          0,
          "Dispatch friendly morning reminder on promised payment date"
        )
      );
    }
    candidates.push(
      calculateEconomics(
        "ESCALATE_BROKEN_PROMISE",
        "manual",
        0.75,
        costConfig.HUMAN_ESCALATION,
        0.05,
        0,
        "Escalate broken promise for specialist outreach"
      )
    );
    return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
  }

  // 5. STANDARD PAYMENT / CHECKOUT / SUBSCRIPTION FAILURES
  if (retryCount === 0 && !reason.includes("expired") && !reason.includes("fraud")) {
    const prob = reason.includes("insufficient_funds") ? 0.45 : 0.65;
    candidates.push(
      calculateEconomics(
        "IMMEDIATE_RETRY",
        "gateway",
        prob,
        costConfig.RETRY_PAYMENT,
        0.02,
        0,
        "Trigger immediate gateway re-authorization"
      )
    );
  }

  if (retryCount < 3 && !reason.includes("fraud")) {
    const prob = 0.72 * (1 - retryCount * 0.15) * (customerLoyaltyScore / 70);
    const retryHours = retryCount === 0 ? 6 : retryCount === 1 ? 24 : 48;
    candidates.push(
      calculateEconomics(
        "DELAYED_RETRY",
        "gateway",
        Math.min(0.85, Math.max(0.2, prob)),
        costConfig.RETRY_PAYMENT,
        0.02,
        retryHours,
        `Schedule automated retry after ${retryHours} hours`
      )
    );
  }

  if (contactPermission) {
    const prob = reason.includes("expired") ? 0.68 : 0.58;
    candidates.push(
      calculateEconomics(
        "SEND_RECOVERY_EMAIL",
        "email",
        prob,
        costConfig.SEND_EMAIL,
        0.01,
        0,
        "Dispatch branded email with secure 1-click update link"
      )
    );

    candidates.push(
      calculateEconomics(
        "SEND_WHATSAPP",
        "whatsapp",
        Math.min(0.88, Math.max(0.3, 0.76 * (customerLoyaltyScore / 80))),
        costConfig.SEND_WHATSAPP,
        0.01,
        0,
        "Send interactive WhatsApp alert with instant UPI link"
      )
    );
  }

  if (amountAtRisk >= 5000000 || retryCount >= 2) {
    candidates.push(
      calculateEconomics(
        "HUMAN_ESCALATION",
        "manual",
        0.82,
        costConfig.HUMAN_ESCALATION,
        0.05,
        0,
        "Escalate to merchant success team for white-glove outreach"
      )
    );
  }

  return candidates.sort((a, b) => b.expectedNetValue - a.expectedNetValue);
}
