import { db } from "@/src/db";
import { auditLogs } from "@/src/db/schema";

export type AuditActor =
  | "RECOVERO_AGENT"
  | "POLICY_ENGINE"
  | "ORCHESTRATOR"
  | "OUTCOME_VERIFIER"
  | "SYSTEM"
  | "HUMAN_OPERATOR";

export type AuditEventType =
  | "PAYMENT_FAILURE_DETECTED"
  | "REVENUE_RISK_EVALUATED"
  | "RECOVERY_CASE_CREATED"
  | "CONTEXT_ASSEMBLED"
  | "AI_DIAGNOSIS_COMPLETED"
  | "DECISION_RECORDED"
  | "POLICY_EVALUATION_PASSED"
  | "POLICY_BLOCKED_ACTION"
  | "POLICY_ESCALATED_ACTION"
  | "ACTION_SCHEDULED"
  | "ACTION_EXECUTED"
  | "OUTCOME_VERIFIED"
  | "CASE_CLOSED"
  | "HUMAN_ESCALATION_TRIGGERED";

export interface LogAuditParams {
  caseId?: string | null;
  actor: AuditActor;
  event: AuditEventType;
  metadata?: Record<string, unknown>;
}

/**
 * Appends an immutable record to the audit trail.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      caseId: params.caseId || null,
      actor: params.actor,
      event: params.event,
      metadata: params.metadata || {},
      timestamp: new Date(),
    });
  } catch (error) {
    // Audit log write failure should not crash the core workflow, but must be logged
    console.error("Failed to write audit log:", error, params);
  }
}
