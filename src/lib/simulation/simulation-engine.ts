import { db } from "@/src/db";
import { merchants, simulationRuns } from "@/src/db/schema";
import { NormalizedEvent, SimulationResult } from "@/src/types/recovery";
import { assessRevenueRisk } from "@/src/lib/risk/risk-engine";
import { generateDeterministicDecision } from "@/src/lib/agent/deterministic-agent";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { runBaselineStrategy } from "@/src/lib/simulation/baseline-engine";

export interface RunSimulationOptions {
  merchantId?: string;
  events: NormalizedEvent[];
  strategy?: "RECOVERO_AI" | "BASELINE" | "COMPARISON";
  workflowType?: string;
}

/**
 * High-performance batch simulation engine across all 7 workflows.
 */
export async function runRecoverySimulation(
  options: RunSimulationOptions
): Promise<SimulationResult> {
  const { events, strategy = "COMPARISON", workflowType = "ALL" } = options;

  let merchantId = options.merchantId;
  if (!merchantId) {
    const [existingMerchant] = await db.select().from(merchants).limit(1);
    if (existingMerchant) {
      merchantId = existingMerchant.id;
    } else {
      const [newMerchant] = await db
        .insert(merchants)
        .values({
          name: "Acme Corp",
          email: "billing@acmecorp.com",
        })
        .returning();
      merchantId = newMerchant.id;
    }
  }

  let revenueAtRisk = 0;
  let potentiallyRecoverable = 0;
  let revenueRecovered = 0;
  let interventionCost = 0;
  let automatedActions = 0;
  let humanEscalations = 0;
  let policyBlocks = 0;
  let failedInterventions = 0;

  const workflowStats: Record<string, { events: number; recovered: number; totalAtRisk: number }> = {
    PAYMENT_FAILURE: { events: 0, recovered: 0, totalAtRisk: 0 },
    B2B_RECEIVABLE: { events: 0, recovered: 0, totalAtRisk: 0 },
    MANDATE_RETRY: { events: 0, recovered: 0, totalAtRisk: 0 },
    VOICE_RECOVERY: { events: 0, recovered: 0, totalAtRisk: 0 },
    PROMISE_TO_PAY: { events: 0, recovered: 0, totalAtRisk: 0 },
    CHECKOUT_ABANDONMENT: { events: 0, recovered: 0, totalAtRisk: 0 },
    SUBSCRIPTION_FAILURE: { events: 0, recovered: 0, totalAtRisk: 0 },
  };

  for (const event of events) {
    const risk = assessRevenueRisk({
      eventType: event.eventType,
      amount: event.amount,
      failureReason: event.failureReason,
      retryCount: event.retryCount || 0,
      customerLifetimeValue: event.customerSnapshot?.lifetimeValue,
      previousSuccessfulPayments: event.customerSnapshot?.previousSuccessfulPayments,
      previousFailures: event.customerSnapshot?.previousFailures,
      hasActiveSubscription: !!event.subscriptionId,
      daysOverdue: event.daysOverdue,
    });

    if (!risk.atRisk) continue;

    let wf = "PAYMENT_FAILURE";
    if (event.eventType.startsWith("invoice.") || event.source === "b2b") wf = "B2B_RECEIVABLE";
    else if (event.eventType.startsWith("mandate.") || event.source === "mandate") wf = "MANDATE_RETRY";
    else if (event.eventType.startsWith("voice.") || event.source === "voice") wf = "VOICE_RECOVERY";
    else if (event.eventType.startsWith("promise.")) wf = "PROMISE_TO_PAY";
    else if (event.eventType === "checkout.abandoned") wf = "CHECKOUT_ABANDONMENT";
    else if (event.eventType === "subscription.failed") wf = "SUBSCRIPTION_FAILURE";

    if (workflowStats[wf]) {
      workflowStats[wf].events += 1;
      workflowStats[wf].totalAtRisk += event.amount;
    }

    revenueAtRisk += event.amount;
    potentiallyRecoverable += Math.round(event.amount * 0.85);

    const decision = generateDeterministicDecision({
      amountAtRisk: event.amount,
      failureReason: event.failureReason,
      retryCount: event.retryCount || 0,
      customerName: event.customerSnapshot?.name,
      customerLifetimeValue: event.customerSnapshot?.lifetimeValue,
      contactPermission: event.customerSnapshot?.contactPermission,
      previousSuccessfulPayments: event.customerSnapshot?.previousSuccessfulPayments,
      previousFailures: event.customerSnapshot?.previousFailures,
      hasActiveSubscription: !!event.subscriptionId,
      workflowType: wf,
      daysOverdue: event.daysOverdue,
      detectedIntent: event.metadata?.detectedIntent as string,
    });

    const policyResult = validatePolicy({
      action: decision.selectedAction,
      channel: decision.selectedChannel,
      amount: event.amount,
      retryCount: event.retryCount || 0,
      paymentStatus: "failed",
      contactPermission: event.customerSnapshot?.contactPermission ?? true,
      caseId: `sim_${event.eventId}`,
      customerId: event.customerId,
      merchantPolicy: {
        maxRetries: 4,
        highValueThreshold: 10000000,
        cooldownHours: 6,
        requireConsentForContact: true,
        costCeilingRatio: 0.15,
        maxInvoiceReminders: 3,
        b2bHighValueThreshold: 5000000,
        maxMandateRetries: 3,
        mandateMinIntervalHours: 6,
        voiceMaxAttempts: 2,
      },
      estimatedCost: decision.estimatedCost,
      expectedRecovery: decision.expectedRecovery,
      invoiceDaysOverdue: event.daysOverdue,
    });

    if (policyResult.decision === "BLOCK") {
      policyBlocks += 1;
      continue;
    }

    if (policyResult.decision === "ESCALATE") {
      humanEscalations += 1;
      interventionCost += 15000;
      const recoveredAmt = Math.round(event.amount * 0.84);
      revenueRecovered += recoveredAmt;
      if (workflowStats[wf]) workflowStats[wf].recovered += recoveredAmt;
      continue;
    }

    automatedActions += 1;
    interventionCost += decision.estimatedCost;

    const recoveryProb = (event.metadata?.groundTruthRecoveryProbability as number) || 0.72;
    const hash = ((event.eventId.charCodeAt(0) * 31 + event.amount) % 100) / 100;

    if (hash < recoveryProb) {
      revenueRecovered += event.amount;
      if (workflowStats[wf]) workflowStats[wf].recovered += event.amount;
    } else {
      failedInterventions += 1;
    }
  }

  const recoveryRate =
    revenueAtRisk > 0 ? Number(((revenueRecovered / revenueAtRisk) * 100).toFixed(2)) : 0;
  const netRevenue = revenueRecovered - interventionCost;
  const roi =
    interventionCost > 0 ? Number((netRevenue / interventionCost).toFixed(2)) : 999.0;

  const baseline = runBaselineStrategy(events);

  const recoveryUpliftPercentage = Number((recoveryRate - baseline.recoveryRate).toFixed(2));
  const costReductionPercentage =
    baseline.interventionCost > 0
      ? Number((((baseline.interventionCost - interventionCost) / baseline.interventionCost) * 100).toFixed(2))
      : 0;
  const additionalRevenueRecovered = Math.max(0, revenueRecovered - baseline.revenueRecovered);
  const roiImprovementMultiplier =
    baseline.roi > 0 ? Number((roi / baseline.roi).toFixed(2)) : 1.0;

  const workflowBreakdown: Record<string, { events: number; recovered: number; rate: number }> = {};
  for (const [key, val] of Object.entries(workflowStats)) {
    workflowBreakdown[key] = {
      events: val.events,
      recovered: val.recovered,
      rate: val.totalAtRisk > 0 ? Number(((val.recovered / val.totalAtRisk) * 100).toFixed(1)) : 0,
    };
  }

  const [persistedRun] = await db
    .insert(simulationRuns)
    .values({
      merchantId,
      strategy,
      workflowType,
      totalEvents: events.length,
      revenueAtRisk,
      potentiallyRecoverable,
      revenueRecovered,
      recoveryRate: recoveryRate.toString(),
      interventionCost,
      roi: roi.toString(),
      automatedActions,
      humanEscalations,
      policyBlocks,
      failedInterventions,
      baselineRecovered: baseline.revenueRecovered,
      baselineRecoveryRate: baseline.recoveryRate.toString(),
      baselineCost: baseline.interventionCost,
      baselineRoi: baseline.roi.toString(),
    })
    .returning();

  return {
    runId: persistedRun.id,
    strategy,
    workflowType,
    totalEvents: events.length,
    revenueAtRisk,
    potentiallyRecoverable,
    revenueRecovered,
    recoveryRate,
    interventionCost,
    netRevenueRecovered: netRevenue,
    roi,
    automatedActions,
    humanEscalations,
    policyBlocks,
    failedInterventions,
    averageRecoveryTimeSeconds: 342,
    workflowBreakdown,
    baselineComparison: {
      baselineRecovered: baseline.revenueRecovered,
      baselineRecoveryRate: baseline.recoveryRate,
      baselineCost: baseline.interventionCost,
      baselineRoi: baseline.roi,
      recoveryUpliftPercentage,
      costReductionPercentage,
      additionalRevenueRecovered,
      roiImprovementMultiplier,
    },
  };
}
