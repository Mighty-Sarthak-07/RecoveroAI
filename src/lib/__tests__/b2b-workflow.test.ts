import { describe, it, expect } from "vitest";
import { B2BReceivablesWorkflow } from "../workflows/b2b-receivables-workflow";
import { MerchantPolicy } from "@/src/types/recovery";

const defaultMerchantPolicy: MerchantPolicy = {
  maxRetries: 4,
  highValueThreshold: 10000000,
  cooldownHours: 6,
  requireConsentForContact: true,
  costCeilingRatio: 0.15,
  maxInvoiceReminders: 3,
  b2bHighValueThreshold: 5000000, // ₹50,000
};

describe("B2B Receivables Workflow", () => {
  const workflow = new B2BReceivablesWorkflow();

  it("detects overdue invoice events", () => {
    const isDetected = workflow.detect({
      eventId: "evt_inv_1",
      eventType: "invoice.overdue",
      source: "b2b",
      merchantId: "m1",
      customerId: "c1",
      amount: 8500000,
      currency: "inr",
      daysOverdue: 12,
      customerSnapshot: {
        name: "TechCorp",
        email: "finance@techcorp.in",
        lifetimeValue: 20000000,
        contactPermission: true,
        previousSuccessfulPayments: 10,
        previousFailures: 0,
      },
      timestamp: new Date().toISOString(),
    });
    expect(isDetected).toBe(true);
  });

  it("selects payment reminder and promise request for aging invoices", () => {
    const candidates = workflow.getCandidateActions({
      invoiceId: "inv_1",
      invoiceNumber: "INV-8500",
      amount: 8500000,
      daysOverdue: 12,
      priority: "high",
      accountOwner: "Pooja",
      previousRemindersCount: 1,
      customerName: "TechCorp",
      customerEmail: "finance@techcorp.in",
      contactPermission: true,
      lifetimeValue: 20000000,
    });

    expect(candidates.length).toBeGreaterThan(0);
    const reminder = candidates.find((c) => c.action === "SEND_PAYMENT_REMINDER");
    expect(reminder).toBeDefined();
    expect(reminder?.expectedNetValue).toBeGreaterThan(0);
  });

  it("escalates to account owner when reminder limit reached", () => {
    const policyResult = workflow.validatePolicy(
      "SEND_PAYMENT_REMINDER",
      {
        invoiceId: "inv_1",
        invoiceNumber: "INV-8500",
        amount: 8500000,
        daysOverdue: 35,
        priority: "critical",
        accountOwner: "Pooja",
        previousRemindersCount: 3, // limit is 3
        customerName: "TechCorp",
        customerEmail: "finance@techcorp.in",
        contactPermission: true,
        lifetimeValue: 20000000,
      },
      defaultMerchantPolicy
    );

    expect(policyResult.decision).toBe("ESCALATE");
    expect(policyResult.checks.find((c) => c.rule === "RULE_8_B2B_REMINDER_LIMIT")?.status).toBe("ESCALATE");
  });
});
