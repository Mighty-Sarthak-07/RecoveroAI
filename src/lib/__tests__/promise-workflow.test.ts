import { describe, it, expect } from "vitest";
import { PromiseToPayWorkflow } from "../workflows/promise-to-pay-workflow";

describe("Promise-to-Pay Workflow", () => {
  const workflow = new PromiseToPayWorkflow();

  it("selects friendly reminder on due date for promised commitments", () => {
    const candidates = workflow.getCandidateActions({
      promiseId: "ptp_1",
      customerId: "c1",
      amount: 249900,
      promisedDate: new Date().toISOString(),
      status: "PROMISED",
      channel: "voice",
      customerName: "Rahul Sharma",
      customerEmail: "rahul@example.com",
      contactPermission: true,
    });

    const reminder = candidates.find((c) => c.action === "SEND_PROMISE_REMINDER");
    expect(reminder).toBeDefined();
    expect(reminder?.expectedNetValue).toBeGreaterThan(0);
  });

  it("escalates when promise is broken", () => {
    const candidates = workflow.getCandidateActions({
      promiseId: "ptp_2",
      customerId: "c2",
      amount: 20000000,
      promisedDate: new Date(Date.now() - 86400000).toISOString(),
      status: "BROKEN",
      channel: "voice",
      customerName: "Vikram Malhotra",
      customerEmail: "vikram@enterprise.com",
      contactPermission: true,
    });

    const brokenAction = candidates.find((c) => c.action === "ESCALATE_BROKEN_PROMISE");
    expect(brokenAction).toBeDefined();
  });
});
