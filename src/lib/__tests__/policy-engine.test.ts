import { describe, it, expect } from "vitest";
import { validatePolicy } from "../policy/policy-engine";
import { MerchantPolicy } from "@/src/types/recovery";

const defaultMerchantPolicy: MerchantPolicy = {
  maxRetries: 4,
  highValueThreshold: 10000000, // ₹100,000 in cents
  cooldownHours: 6,
  requireConsentForContact: true,
  costCeilingRatio: 0.15,
};

describe("Policy Engine", () => {
  it("allows valid retry within threshold and retry limit", () => {
    const output = validatePolicy({
      action: "DELAYED_RETRY",
      channel: "gateway",
      amount: 249900, // ₹2,499
      retryCount: 1,
      paymentStatus: "failed",
      contactPermission: true,
      caseId: "case-1",
      customerId: "cust-1",
      merchantPolicy: defaultMerchantPolicy,
    });
    expect(output.allowed).toBe(true);
    expect(output.decision).toBe("ALLOW");
  });

  it("escalates and blocks automated retry when max retries exceeded (RULE 1)", () => {
    const output = validatePolicy({
      action: "DELAYED_RETRY",
      channel: "gateway",
      amount: 249900,
      retryCount: 4,
      paymentStatus: "failed",
      contactPermission: true,
      caseId: "case-2",
      customerId: "cust-2",
      merchantPolicy: defaultMerchantPolicy,
    });
    expect(output.allowed).toBe(false);
    expect(output.decision).toBe("ESCALATE");
    expect(output.checks.find((c) => c.rule === "RULE_1_MAX_RETRIES")?.status).toBe("ESCALATE");
  });

  it("requires human approval for high-value transactions (RULE 2 / KILL SWITCH)", () => {
    const output = validatePolicy({
      action: "IMMEDIATE_RETRY",
      channel: "gateway",
      amount: 20000000, // ₹200,000 (exceeds ₹100,000 threshold)
      retryCount: 4,
      paymentStatus: "failed",
      contactPermission: true,
      caseId: "case-3",
      customerId: "cust-3",
      merchantPolicy: defaultMerchantPolicy,
    });
    expect(output.allowed).toBe(false);
    expect(output.decision).toBe("ESCALATE");
    expect(output.checks.find((c) => c.rule === "RULE_2_HIGH_VALUE")?.status).toBe("ESCALATE");
  });

  it("blocks communication actions if customer permission is revoked (RULE 4)", () => {
    const output = validatePolicy({
      action: "SEND_RECOVERY_EMAIL",
      channel: "email",
      amount: 249900,
      retryCount: 1,
      paymentStatus: "failed",
      contactPermission: false,
      caseId: "case-4",
      customerId: "cust-4",
      merchantPolicy: defaultMerchantPolicy,
    });
    expect(output.allowed).toBe(false);
    expect(output.decision).toBe("BLOCK");
    expect(output.checks.find((c) => c.rule === "RULE_4_CUSTOMER_CONTACT")?.status).toBe("BLOCK");
  });

  it("stops workflow if payment is already recovered (RULE 3)", () => {
    const output = validatePolicy({
      action: "IMMEDIATE_RETRY",
      channel: "gateway",
      amount: 249900,
      retryCount: 0,
      paymentStatus: "succeeded",
      contactPermission: true,
      caseId: "case-5",
      customerId: "cust-5",
      merchantPolicy: defaultMerchantPolicy,
    });
    expect(output.allowed).toBe(false);
    expect(output.decision).toBe("BLOCK");
  });
});
