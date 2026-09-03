import { describe, it, expect } from "vitest";
import { MandateRetryWorkflow } from "../workflows/mandate-retry-workflow";
import { MerchantPolicy } from "@/src/types/recovery";

const defaultMerchantPolicy: MerchantPolicy = {
  maxRetries: 4,
  highValueThreshold: 10000000,
  cooldownHours: 6,
  requireConsentForContact: true,
  costCeilingRatio: 0.15,
  maxMandateRetries: 3,
};

describe("Mandate Retry Sequencer Workflow", () => {
  const workflow = new MandateRetryWorkflow();

  it("schedules next attempt within cooling window when retries < max", () => {
    const candidates = workflow.getCandidateActions({
      mandateId: "md_1",
      mandateReference: "MD-1042",
      amount: 249900,
      retryCount: 1,
      maxRetries: 3,
      lastFailureReason: "insufficient_funds",
      frequency: "monthly",
      customerName: "Rahul Sharma",
      customerEmail: "rahul@example.com",
      contactPermission: true,
    });

    const retry = candidates.find((c) => c.action === "SCHEDULE_MANDATE_RETRY");
    expect(retry).toBeDefined();
    expect(retry?.retryAfterHours).toBe(6);
  });

  it("escalates when max retries exceeded", () => {
    const candidates = workflow.getCandidateActions({
      mandateId: "md_1",
      mandateReference: "MD-1042",
      amount: 249900,
      retryCount: 3,
      maxRetries: 3,
      lastFailureReason: "insufficient_funds",
      frequency: "monthly",
      customerName: "Rahul Sharma",
      customerEmail: "rahul@example.com",
      contactPermission: true,
    });

    const escalation = candidates.find((c) => c.action === "HUMAN_ESCALATION");
    expect(escalation).toBeDefined();
  });
});
