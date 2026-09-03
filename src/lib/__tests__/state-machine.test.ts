import { describe, it, expect } from "vitest";
import { isValidTransition } from "@/src/types/recovery";

describe("Recovery State Machine", () => {
  it("permits standard forward progression", () => {
    expect(isValidTransition("DETECTED", "DIAGNOSING")).toBe(true);
    expect(isValidTransition("DIAGNOSING", "DECIDING")).toBe(true);
    expect(isValidTransition("DECIDING", "POLICY_REVIEW")).toBe(true);
    expect(isValidTransition("POLICY_REVIEW", "APPROVED")).toBe(true);
    expect(isValidTransition("APPROVED", "EXECUTING")).toBe(true);
    expect(isValidTransition("EXECUTING", "VERIFYING")).toBe(true);
    expect(isValidTransition("VERIFYING", "RECOVERED")).toBe(true);
    expect(isValidTransition("RECOVERED", "CLOSED")).toBe(true);
  });

  it("rejects illegal backward or skip transitions", () => {
    expect(isValidTransition("RECOVERED", "EXECUTING")).toBe(false);
    expect(isValidTransition("BLOCKED", "EXECUTING")).toBe(false);
    expect(isValidTransition("CLOSED", "DETECTED")).toBe(false);
  });
});
