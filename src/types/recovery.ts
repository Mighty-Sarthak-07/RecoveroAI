// ============================================================
// RECOVERY WORKFLOW REGISTRY ENUM & TYPES
// ============================================================

export type RecoveryWorkflowType =
  | "PAYMENT_FAILURE"
  | "CHECKOUT_ABANDONMENT"
  | "SUBSCRIPTION_FAILURE"
  | "B2B_RECEIVABLE"
  | "MANDATE_RETRY"
  | "VOICE_RECOVERY"
  | "PROMISE_TO_PAY";

// ============================================================
// RECOVERY STATE MACHINE TYPES
// ============================================================

export type RecoveryState =
  | "DETECTED"
  | "DIAGNOSING"
  | "DECIDING"
  | "POLICY_REVIEW"
  | "APPROVED"
  | "EXECUTING"
  | "VERIFYING"
  | "RECOVERED"
  | "FAILED"
  | "ESCALATED"
  | "BLOCKED"
  | "CLOSED";

export const VALID_STATE_TRANSITIONS: Record<RecoveryState, RecoveryState[]> = {
  DETECTED: ["DIAGNOSING", "ESCALATED", "CLOSED"],
  DIAGNOSING: ["DECIDING", "ESCALATED", "FAILED", "CLOSED"],
  DECIDING: ["POLICY_REVIEW", "ESCALATED", "FAILED"],
  POLICY_REVIEW: ["APPROVED", "BLOCKED", "ESCALATED"],
  APPROVED: ["EXECUTING", "BLOCKED", "ESCALATED"],
  EXECUTING: ["VERIFYING", "ESCALATED", "FAILED"],
  VERIFYING: ["RECOVERED", "FAILED", "EXECUTING", "ESCALATED"],
  RECOVERED: ["CLOSED"],
  FAILED: ["DIAGNOSING", "ESCALATED", "CLOSED"],
  ESCALATED: ["APPROVED", "CLOSED", "EXECUTING"],
  BLOCKED: ["ESCALATED", "CLOSED"],
  CLOSED: [],
};

export function isValidTransition(from: RecoveryState, to: RecoveryState): boolean {
  return VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================
// RISK ENGINE TYPES
// ============================================================

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskAssessmentInput {
  eventType: string; // 'payment.failed', 'checkout.abandoned', 'invoice.overdue', 'mandate.failed', etc.
  amount: number; // in cents
  failureReason?: string | null;
  retryCount?: number;
  customerLifetimeValue?: number; // in cents
  previousSuccessfulPayments?: number;
  previousFailures?: number;
  hasActiveSubscription?: boolean;
  paymentMethodType?: string | null;
  daysOverdue?: number;
  previousRemindersCount?: number;
  mandateRetryCount?: number;
  promiseBrokenCount?: number;
}

export interface RiskAssessmentOutput {
  atRisk: boolean;
  score: number; // 0 - 100
  level: RiskLevel;
  reasons: string[];
  priority: number; // 1 (highest) - 5 (lowest)
}

// ============================================================
// POLICY ENGINE TYPES
// ============================================================

export type PolicyDecision = "ALLOW" | "BLOCK" | "ESCALATE";

export interface MerchantPolicy {
  maxRetries: number;
  highValueThreshold: number; // in cents (e.g. 10000000 = ₹100,000)
  cooldownHours: number;
  requireConsentForContact: boolean;
  costCeilingRatio: number;
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  maxInvoiceReminders?: number;
  b2bHighValueThreshold?: number;
  maxMandateRetries?: number;
  mandateMinIntervalHours?: number;
  voiceMaxAttempts?: number;
  voiceAllowedHoursStart?: number;
  voiceAllowedHoursEnd?: number;
}

export interface PolicyCheckInput {
  action: string;
  channel: string;
  amount: number; // in cents
  retryCount: number;
  paymentStatus: string;
  contactPermission: boolean;
  caseId: string;
  customerId: string;
  merchantPolicy: MerchantPolicy;
  executedActionsHistory?: string[];
  estimatedCost?: number; // in cents
  expectedRecovery?: number; // in cents
  invoiceDaysOverdue?: number;
  invoiceRemindersSent?: number;
  mandateAttemptCount?: number;
  voiceAttemptsCount?: number;
  promiseAlreadyActive?: boolean;
}

export interface PolicyRuleResult {
  rule: string;
  status: PolicyDecision;
  reason: string;
}

export interface PolicyCheckOutput {
  decision: PolicyDecision;
  allowed: boolean;
  reasons: string[];
  checks: PolicyRuleResult[];
}

// ============================================================
// COST & ECONOMIC DECISION ENGINE TYPES
// ============================================================

export interface ActionCostConfig {
  RETRY_PAYMENT: number; // in cents e.g. 0
  SEND_EMAIL: number; // in cents e.g. 100 (₹1)
  SEND_WHATSAPP: number; // in cents e.g. 300 (₹3)
  SEND_SMS: number; // in cents e.g. 150 (₹1.5)
  VOICE_CALL: number; // in cents e.g. 1000 (₹10)
  HUMAN_ESCALATION: number; // in cents e.g. 15000 (₹150)
  B2B_HUMAN_ESCALATION: number; // in cents e.g. 20000 (₹200)
  CHECKOUT_INCENTIVE: number; // in cents e.g. 5000 (₹50)
}

export const DEFAULT_ACTION_COSTS: ActionCostConfig = {
  RETRY_PAYMENT: 0,
  SEND_EMAIL: 100, // ₹1
  SEND_WHATSAPP: 300, // ₹3
  SEND_SMS: 150, // ₹1.5
  VOICE_CALL: 1000, // ₹10
  HUMAN_ESCALATION: 15000, // ₹150
  B2B_HUMAN_ESCALATION: 20000, // ₹200
  CHECKOUT_INCENTIVE: 5000, // ₹50
};

export interface CandidateAction {
  action: string;
  channel: string;
  expectedRecovery: number; // in cents
  estimatedCost: number; // in cents
  expectedFailureCost: number; // in cents
  expectedNetValue: number; // in cents = expectedRecovery - estimatedCost - expectedFailureCost
  expectedRoi: number; // multiplier e.g. 999 or net / cost
  retryAfterHours?: number;
  description?: string;
}

// ============================================================
// AI AGENT STRUCTURED OUTPUT TYPES
// ============================================================

export interface AIDecisionOutput {
  diagnosis: string;
  riskLevel: RiskLevel;
  candidateActions: CandidateAction[];
  selectedAction: string;
  selectedChannel: string;
  retryAfterHours?: number;
  expectedRecovery: number;
  estimatedCost: number;
  expectedNetValue: number;
  expectedRoi: number;
  confidence: number; // 0.00 - 1.00
  evidence: string[];
  requiresHumanApproval: boolean;
  notes?: string;
}

// ============================================================
// B2B RECEIVABLES TYPES
// ============================================================

export type InvoiceStatus =
  | "pending"
  | "approaching_due"
  | "due"
  | "overdue"
  | "critically_overdue"
  | "paid"
  | "written_off";

export interface InvoiceRecord {
  id: string;
  merchantId: string;
  customerId: string;
  invoiceNumber: string;
  amount: number; // in cents
  currency: string;
  issuedAt: string;
  dueAt: string;
  paidAt?: string | null;
  status: InvoiceStatus;
  daysOverdue: number;
  priority: string;
  accountOwner: string;
}

// ============================================================
// MANDATE RETRY SEQUENCER TYPES
// ============================================================

export type MandateStatus =
  | "active"
  | "failed"
  | "retrying"
  | "paused"
  | "exhausted"
  | "recovered";

export interface MandateRecord {
  id: string;
  merchantId: string;
  customerId: string;
  mandateReference: string;
  amount: number; // in cents
  currency: string;
  frequency: string;
  nextDebitAt?: string | null;
  status: MandateStatus;
  retryCount: number;
  lastFailureReason?: string | null;
  maxRetries: number;
}

export interface MandateAttemptRecord {
  id: string;
  mandateId: string;
  attemptNumber: number;
  scheduledAt: string;
  executedAt?: string | null;
  status: "scheduled" | "succeeded" | "failed";
  failureReason?: string | null;
}

// ============================================================
// HINGLISH VOICE RECOVERY TYPES
// ============================================================

export type VoiceLanguage = "HINGLISH" | "ENGLISH" | "HINDI";

export type VoiceIntent =
  | "PAY_NOW"
  | "TRY_LATER"
  | "NEEDS_HELP"
  | "DECLINE"
  | "WRONG_NUMBER"
  | "HUMAN_AGENT";

export interface VoiceTranscriptEntry {
  speaker: "agent" | "customer";
  text: string;
  timestamp: string;
}

export interface VoiceSessionRecord {
  id: string;
  caseId?: string | null;
  customerId: string;
  language: VoiceLanguage;
  status: "initiated" | "connected" | "completed" | "failed" | "transferred";
  startedAt: string;
  endedAt?: string | null;
  transcript: VoiceTranscriptEntry[];
  detectedIntent?: VoiceIntent | null;
  outcome?: Record<string, unknown>;
}

// ============================================================
// PROMISE-TO-PAY TYPES
// ============================================================

export type PromiseStatus =
  | "PROMISED"
  | "DUE_SOON"
  | "DUE_TODAY"
  | "FULFILLED"
  | "OVERDUE"
  | "BROKEN"
  | "ESCALATED"
  | "CANCELLED";

export interface PromiseToPayRecord {
  id: string;
  merchantId: string;
  customerId: string;
  invoiceId?: string | null;
  caseId?: string | null;
  promisedAmount: number; // in cents
  promisedDate: string;
  status: PromiseStatus;
  channel: string;
  createdAt: string;
}

// ============================================================
// PROVIDER ADAPTER INTERFACES
// ============================================================

export interface CommunicationMessage {
  to: string;
  channel: "email" | "whatsapp" | "sms";
  template: string;
  variables: Record<string, string | number>;
}

export interface CommunicationProvider {
  sendMessage(msg: CommunicationMessage): Promise<{ id: string; delivered: boolean }>;
}

export interface VoiceCallRequest {
  to: string;
  customerName?: string;
  customerPhone?: string;
  language: VoiceLanguage;
  scriptTemplate: string;
  context: Record<string, string | number>;
}

export interface VoiceProvider {
  initiateCall(
    req: VoiceCallRequest
  ): Promise<{ sessionId: string; status: "connected" | "completed" }>;
  detectIntent(transcriptText: string): Promise<VoiceIntent>;
}

export interface PaymentProvider {
  retryDebit(mandateId: string, amount: number): Promise<{ success: boolean; transactionId?: string }>;
  checkStatus(transactionId: string): Promise<"succeeded" | "failed" | "pending">;
}

// ============================================================
// UNIFIED RECOVERY WORKFLOW INTERFACE
// ============================================================

export interface RecoveryWorkflow<TContext = any> {
  type: RecoveryWorkflowType;
  detect(event: NormalizedEvent): boolean;
  buildContext(event: NormalizedEvent): Promise<TContext>;
  getCandidateActions(context: TContext): CandidateAction[];
  validatePolicy(action: string, context: TContext, policy: MerchantPolicy): PolicyCheckOutput;
  execute(caseId: string, action: string, context: TContext): Promise<Record<string, unknown>>;
  verify(caseId: string, context: TContext): Promise<{ verified: boolean; amountRecovered: number }>;
}

// ============================================================
// EVENT INGESTION & NORMALIZATION TYPES
// ============================================================

export interface NormalizedEvent {
  eventId: string;
  eventType:
    | "payment.failed"
    | "payment.success"
    | "checkout.abandoned"
    | "subscription.failed"
    | "invoice.overdue"
    | "invoice.approaching_due"
    | "mandate.failed"
    | "voice.intent_detected"
    | "promise.created"
    | "promise.broken";
  source: "razorpay" | "synthetic" | "system" | "b2b" | "mandate" | "voice";
  merchantId: string;
  customerId: string;
  paymentId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  mandateId?: string;
  amount: number; // in cents
  currency: string;
  failureReason?: string;
  retryCount?: number;
  daysOverdue?: number;
  accountOwner?: string;
  customerSnapshot: {
    name: string;
    email: string;
    phone?: string | null;
    lifetimeValue: number;
    contactPermission: boolean;
    previousSuccessfulPayments: number;
    previousFailures: number;
  };
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================
// SIMULATION & BASELINE TYPES
// ============================================================

export interface SimulationResult {
  runId: string;
  strategy: "RECOVERO_AI" | "BASELINE" | "COMPARISON";
  workflowType?: string;
  totalEvents: number;
  revenueAtRisk: number; // in cents
  potentiallyRecoverable: number; // in cents
  revenueRecovered: number; // in cents
  recoveryRate: number; // percentage (0 - 100)
  interventionCost: number; // in cents
  netRevenueRecovered: number; // in cents
  roi: number;
  automatedActions: number;
  humanEscalations: number;
  policyBlocks: number;
  failedInterventions: number;
  averageRecoveryTimeSeconds: number;
  workflowBreakdown?: Record<string, { events: number; recovered: number; rate: number }>;
  baselineComparison?: {
    baselineRecovered: number;
    baselineRecoveryRate: number;
    baselineCost: number;
    baselineRoi: number;
    recoveryUpliftPercentage: number;
    costReductionPercentage: number;
    additionalRevenueRecovered: number;
    roiImprovementMultiplier: number;
  };
}
