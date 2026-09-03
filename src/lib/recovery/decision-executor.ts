import { db } from "@/src/db";
import {
  caseContext,
  customers,
  decisionRecords,
  merchants,
  payments,
  policyCheckLogs,
  recoveryCases,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { AIDecisionOutput, MerchantPolicy } from "@/src/types/recovery";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { executeRecoveryAction } from "@/src/lib/recovery/action-orchestrator";
import { logAuditEvent } from "@/src/lib/audit";

export interface AuthorizeAndExecuteParams {
  caseId: string;
  decision: AIDecisionOutput;
  autoExecuteIfAllowed?: boolean;
}

export interface DecisionExecutionSummary {
  caseId: string;
  decisionRecordId: string;
  policyApproved: boolean;
  policyDecision: "ALLOW" | "BLOCK" | "ESCALATE";
  policyReasons: string[];
  actionExecuted: boolean;
  executionMessage?: string;
}

/**
 * Explicit Architectural Barrier:
 * AI Decision -> Decision Record -> Policy Engine -> Authorization -> Action Orchestrator
 */
export async function authorizeAndExecuteDecision(
  params: AuthorizeAndExecuteParams
): Promise<DecisionExecutionSummary> {
  const { caseId, decision, autoExecuteIfAllowed = true } = params;

  // 1. Fetch case, customer, merchant, and payment
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

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, recCase.merchantId))
    .limit(1);

  let payment = null;
  if (recCase.paymentId) {
    const [p] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, recCase.paymentId))
      .limit(1);
    payment = p;
  }

  // 2. Persist the AI Decision Record
  const [decisionRecord] = await db
    .insert(decisionRecords)
    .values({
      caseId,
      candidateActions: decision.candidateActions,
      selectedAction: decision.selectedAction,
      expectedRecovery: decision.expectedRecovery,
      estimatedCost: decision.estimatedCost,
      expectedNetValue: decision.expectedNetValue,
      expectedRoi: decision.expectedRoi.toString(),
      confidence: decision.confidence.toString(),
      evidence: decision.evidence,
      requiresHumanApproval: decision.requiresHumanApproval,
    })
    .returning();

  await logAuditEvent({
    caseId,
    actor: "RECOVERO_AGENT",
    event: "DECISION_RECORDED",
    metadata: {
      decisionRecordId: decisionRecord.id,
      selectedAction: decision.selectedAction,
      confidence: decision.confidence,
      evidence: decision.evidence,
    },
  });

  // 3. Deterministic Policy Validation
  const merchantPolicy: MerchantPolicy = merchant?.policyJson || {
    maxRetries: 4,
    highValueThreshold: 10000000,
    cooldownHours: 6,
    requireConsentForContact: true,
    costCeilingRatio: 0.15,
  };

  const policyValidation = validatePolicy({
    action: decision.selectedAction,
    channel: decision.selectedChannel || "gateway",
    amount: recCase.amountAtRisk,
    retryCount: payment?.retryCount || 0,
    paymentStatus: payment?.status || "failed",
    contactPermission: customer?.contactPermission ?? true,
    caseId,
    customerId: recCase.customerId,
    merchantPolicy,
    estimatedCost: decision.estimatedCost,
    expectedRecovery: decision.expectedRecovery,
  });

  // 4. Log all policy checks into database
  for (const check of policyValidation.checks) {
    await db.insert(policyCheckLogs).values({
      caseId,
      action: decision.selectedAction,
      ruleName: check.rule,
      result: check.status,
      reason: check.reason,
      checkedAt: new Date(),
    });
  }

  // 5. Handle Policy Outcomes
  if (policyValidation.decision === "BLOCK") {
    await db
      .update(recoveryCases)
      .set({
        status: "BLOCKED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    await logAuditEvent({
      caseId,
      actor: "POLICY_ENGINE",
      event: "POLICY_BLOCKED_ACTION",
      metadata: {
        reasons: policyValidation.reasons,
        checks: policyValidation.checks,
      },
    });

    return {
      caseId,
      decisionRecordId: decisionRecord.id,
      policyApproved: false,
      policyDecision: "BLOCK",
      policyReasons: policyValidation.reasons,
      actionExecuted: false,
      executionMessage: `Action ${decision.selectedAction} BLOCKED by merchant policy.`,
    };
  }

  if (policyValidation.decision === "ESCALATE" || decision.requiresHumanApproval) {
    await db
      .update(recoveryCases)
      .set({
        status: "ESCALATED",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    await logAuditEvent({
      caseId,
      actor: "POLICY_ENGINE",
      event: "HUMAN_ESCALATION_TRIGGERED",
      metadata: {
        reasons: policyValidation.reasons,
        checks: policyValidation.checks,
      },
    });

    return {
      caseId,
      decisionRecordId: decisionRecord.id,
      policyApproved: false,
      policyDecision: "ESCALATE",
      policyReasons: policyValidation.reasons,
      actionExecuted: false,
      executionMessage: "Action requires manual review and has been ESCALATED to human operator.",
    };
  }

  // 6. Policy Approved: Transition to APPROVED
  await db
    .update(recoveryCases)
    .set({
      status: "APPROVED",
      updatedAt: new Date(),
    })
    .where(eq(recoveryCases.id, caseId));

  await logAuditEvent({
    caseId,
    actor: "POLICY_ENGINE",
    event: "POLICY_EVALUATION_PASSED",
    metadata: {
      action: decision.selectedAction,
      reasons: policyValidation.reasons,
    },
  });

  // 7. If Auto-Execute authorized, trigger Action Orchestrator
  if (autoExecuteIfAllowed) {
    const execution = await executeRecoveryAction({
      caseId,
      actionType: decision.selectedAction,
      channel: decision.selectedChannel || "gateway",
      retryAfterHours: decision.retryAfterHours,
    });

    return {
      caseId,
      decisionRecordId: decisionRecord.id,
      policyApproved: true,
      policyDecision: "ALLOW",
      policyReasons: policyValidation.reasons,
      actionExecuted: true,
      executionMessage: execution.message,
    };
  }

  return {
    caseId,
    decisionRecordId: decisionRecord.id,
    policyApproved: true,
    policyDecision: "ALLOW",
    policyReasons: policyValidation.reasons,
    actionExecuted: false,
    executionMessage: "Action approved by policy engine, awaiting dispatch.",
  };
}
