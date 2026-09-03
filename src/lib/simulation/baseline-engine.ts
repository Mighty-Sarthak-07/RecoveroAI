import { NormalizedEvent } from "@/src/types/recovery";

export interface BaselineResult {
  totalEvents: number;
  revenueAtRisk: number; // in cents
  revenueRecovered: number; // in cents
  recoveryRate: number; // percentage e.g. 28.5
  interventionCost: number; // in cents
  netRevenueRecovered: number; // in cents
  roi: number;
  retriesExecuted: number;
}

/**
 * Baseline Recovery Engine
 * Traditional naive strategy: blindly trigger immediate retries for all failed payments.
 */
export function runBaselineStrategy(events: NormalizedEvent[]): BaselineResult {
  let revenueAtRisk = 0;
  let revenueRecovered = 0;
  let retriesExecuted = 0;

  for (const event of events) {
    if (event.eventType === "payment.failed" || event.eventType === "subscription.failed") {
      revenueAtRisk += event.amount;
      retriesExecuted += 1;

      // Naive immediate retry without timing optimization or channel routing:
      // Typically succeeds on ~22% - 30% of transient failures only.
      const reason = (event.failureReason || "").toLowerCase();
      let successRate = 0.26;
      if (reason.includes("expired") || reason.includes("fraud")) {
        successRate = 0.02; // Naive retries almost completely fail on expired/fraud
      } else if (reason.includes("insufficient")) {
        successRate = 0.22; // Without delayed timing, retrying immediately yields poor recovery
      }

      const randomVal = ((event.eventId.charCodeAt(0) * 17 + event.amount) % 100) / 100;
      if (randomVal < successRate) {
        revenueRecovered += event.amount;
      }
    }
  }

  // Cost for baseline: gateway retry transaction fee (~₹5 per failed/success retry in high volume or 0)
  const interventionCost = retriesExecuted * 20; // in cents (~₹0.20 per API call)
  const recoveryRate = revenueAtRisk > 0 ? Number(((revenueRecovered / revenueAtRisk) * 100).toFixed(2)) : 0;
  const netRevenue = revenueRecovered - interventionCost;
  const roi = interventionCost > 0 ? Number((netRevenue / interventionCost).toFixed(2)) : 999.0;

  return {
    totalEvents: events.length,
    revenueAtRisk,
    revenueRecovered,
    recoveryRate,
    interventionCost,
    netRevenueRecovered: netRevenue,
    roi,
    retriesExecuted,
  };
}
