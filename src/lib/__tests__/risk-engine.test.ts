import { describe, it, expect } from "vitest";
import { assessRevenueRisk } from "../risk/risk-engine";

describe("Risk Engine", () => {
  it("marks successful payment as not at risk with score 0", () => {
    const result = assessRevenueRisk({
      eventType: "payment.success",
      amount: 249900,
    });
    expect(result.atRisk).toBe(false);
    expect(result.score).toBe(0);
    expect(result.level).toBe("LOW");
  });

  it("classifies insufficient funds payment failure appropriately", () => {
    const result = assessRevenueRisk({
      eventType: "payment.failed",
      amount: 249900,
      failureReason: "insufficient_funds",
      retryCount: 1,
      previousSuccessfulPayments: 14,
      previousFailures: 1,
      hasActiveSubscription: true,
    });
    expect(result.atRisk).toBe(true);
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThan(75);
    expect(result.reasons).toContain("Temporary liquidity issue (insufficient funds)");
  });

  it("elevates risk score for multiple retry failures and high value", () => {
    const result = assessRevenueRisk({
      eventType: "payment.failed",
      amount: 20000000, // ₹200,000
      failureReason: "card_declined",
      retryCount: 4,
      previousSuccessfulPayments: 0,
      previousFailures: 3,
    });
    expect(result.atRisk).toBe(true);
    expect(result.level).toBe("CRITICAL");
    expect(result.priority).toBe(1);
  });
});
