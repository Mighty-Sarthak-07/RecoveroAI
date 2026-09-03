import { describe, it, expect } from "vitest";
import { evaluateCandidateInterventions } from "../cost/cost-engine";

describe("Cost and Economics Engine", () => {
  it("evaluates candidates with safe ROI and expected recovery", () => {
    const candidates = evaluateCandidateInterventions({
      amountAtRisk: 249900, // ₹2,499 in cents
      failureReason: "insufficient_funds",
      retryCount: 1,
      contactPermission: true,
      customerLoyaltyScore: 80,
    });

    expect(candidates.length).toBeGreaterThan(0);
    const delayedRetry = candidates.find((c) => c.action === "DELAYED_RETRY");
    expect(delayedRetry).toBeDefined();
    expect(delayedRetry?.estimatedCost).toBe(0);
    expect(delayedRetry?.expectedRoi).toBe(999.0); // Safe representation for zero cost
    expect(delayedRetry?.expectedNetValue).toBeGreaterThan(0);

    const email = candidates.find((c) => c.action === "SEND_RECOVERY_EMAIL");
    expect(email).toBeDefined();
    expect(email?.estimatedCost).toBe(100); // ₹1 in cents
    expect(email?.expectedRoi).toBeGreaterThan(0);
  });
});
