import { NormalizedEvent } from "@/src/types/recovery";

const INDIAN_NAMES = [
  "Rahul Sharma",
  "Priya Singh",
  "Aarav Patel",
  "Neha Verma",
  "Rohan Mehta",
  "Ananya Iyer",
  "Vikram Malhotra",
  "Kavita Reddy",
  "Arjun Nair",
  "Deepika Joshi",
  "Siddharth Gupta",
  "Pooja Deshmukh",
  "Aditya Rao",
  "Sneha Kulkarni",
  "Manish Bhatt",
];

const FAILURE_REASONS = [
  "insufficient_funds",
  "insufficient_funds",
  "card_declined",
  "expired_card",
  "authentication_error",
  "mandate_limit_exceeded",
  "invoice_due_date_passed",
];

const AMOUNTS_INR = [
  79900,   // ₹799
  129900,  // ₹1,299
  249900,  // ₹2,499
  499900,  // ₹4,999
  8500000, // ₹85,000 (B2B Invoice)
  1299900, // ₹12,999
  2450000, // ₹24,500
];

/**
 * Generates realistic synthetic events across all 7 workflows with hidden ground truth.
 */
export function generateSyntheticEvents(
  count: number,
  merchantId = "default-merchant",
  workflowFilter = "ALL"
): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];

  for (let i = 1; i <= count; i++) {
    const customerName = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const emailName = customerName.toLowerCase().replace(/\s+/g, ".");
    const email = `${emailName}.${i}@example.com`;

    const workflowMod = i % 7;
    let eventType: NormalizedEvent["eventType"] = "payment.failed";
    let source: NormalizedEvent["source"] = "synthetic";
    let daysOverdue: number | undefined;
    let amount = AMOUNTS_INR[i % AMOUNTS_INR.length];

    if (workflowFilter === "B2B" || (workflowFilter === "ALL" && workflowMod === 0)) {
      eventType = "invoice.overdue";
      source = "b2b";
      daysOverdue = (i % 25) + 5;
      amount = 8500000; // ₹85,000 B2B invoice
    } else if (workflowFilter === "MANDATE" || (workflowFilter === "ALL" && workflowMod === 1)) {
      eventType = "mandate.failed";
      source = "mandate";
      amount = 249900;
    } else if (workflowFilter === "VOICE" || (workflowFilter === "ALL" && workflowMod === 2)) {
      eventType = "voice.intent_detected";
      source = "voice";
    } else if (workflowFilter === "PROMISE" || (workflowFilter === "ALL" && workflowMod === 3)) {
      eventType = i % 2 === 0 ? "promise.created" : "promise.broken";
    } else if (workflowMod === 4) {
      eventType = "checkout.abandoned";
      amount = 129900;
    } else if (workflowMod === 5) {
      eventType = "subscription.failed";
      amount = 499900;
    } else {
      eventType = "payment.failed";
    }

    const failureReason = FAILURE_REASONS[i % FAILURE_REASONS.length];
    const previousSuccesses = (i % 18) + 1;
    const retryCount = (i % 3);

    let groundTruthRecoveryProb = 0.68;
    if (eventType === "invoice.overdue") groundTruthRecoveryProb = 0.82;
    else if (eventType === "mandate.failed") groundTruthRecoveryProb = 0.74;
    else if (eventType === "voice.intent_detected") groundTruthRecoveryProb = 0.86;
    else if (eventType === "promise.created") groundTruthRecoveryProb = 0.88;

    events.push({
      eventId: `evt_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      source,
      merchantId,
      customerId: `cust_${(i % 50) + 1}`,
      amount,
      currency: "inr",
      failureReason,
      retryCount,
      daysOverdue,
      customerSnapshot: {
        name: customerName,
        email,
        phone: `+9198${(10000000 + i).toString().substring(0, 8)}`,
        lifetimeValue: amount * previousSuccesses,
        contactPermission: i % 10 !== 0,
        previousSuccessfulPayments: previousSuccesses,
        previousFailures: i % 4,
      },
      metadata: {
        groundTruthRecoverable: groundTruthRecoveryProb > 0.5,
        groundTruthRecoveryProbability: groundTruthRecoveryProb,
        detectedIntent: i % 3 === 0 ? "PAY_NOW" : i % 3 === 1 ? "TRY_LATER" : "NEEDS_HELP",
      },
      timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
    });
  }

  return events;
}
