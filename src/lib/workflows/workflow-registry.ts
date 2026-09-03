import {
  NormalizedEvent,
  RecoveryWorkflow,
  RecoveryWorkflowType,
} from "@/src/types/recovery";
import { B2BReceivablesWorkflow } from "./b2b-receivables-workflow";
import { MandateRetryWorkflow } from "./mandate-retry-workflow";
import { VoiceRecoveryWorkflow } from "./voice-recovery-workflow";
import { PromiseToPayWorkflow } from "./promise-to-pay-workflow";

export class UnifiedWorkflowRegistry {
  private workflows: Map<RecoveryWorkflowType, RecoveryWorkflow> = new Map();

  constructor() {
    this.registerWorkflow(new B2BReceivablesWorkflow());
    this.registerWorkflow(new MandateRetryWorkflow());
    this.registerWorkflow(new VoiceRecoveryWorkflow());
    this.registerWorkflow(new PromiseToPayWorkflow());
  }

  registerWorkflow(workflow: RecoveryWorkflow) {
    this.workflows.set(workflow.type, workflow);
  }

  getWorkflow(type: RecoveryWorkflowType): RecoveryWorkflow | undefined {
    return this.workflows.get(type);
  }

  resolveWorkflowForEvent(event: NormalizedEvent): RecoveryWorkflowType {
    if (event.eventType === "invoice.overdue" || event.eventType === "invoice.approaching_due" || event.source === "b2b") {
      return "B2B_RECEIVABLE";
    }
    if (event.eventType === "mandate.failed" || event.source === "mandate") {
      return "MANDATE_RETRY";
    }
    if (event.eventType === "voice.intent_detected" || event.source === "voice") {
      return "VOICE_RECOVERY";
    }
    if (event.eventType === "promise.created" || event.eventType === "promise.broken") {
      return "PROMISE_TO_PAY";
    }
    if (event.eventType === "checkout.abandoned") {
      return "CHECKOUT_ABANDONMENT";
    }
    if (event.eventType === "subscription.failed") {
      return "SUBSCRIPTION_FAILURE";
    }
    return "PAYMENT_FAILURE";
  }
}

export const workflowRegistry = new UnifiedWorkflowRegistry();
