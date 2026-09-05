import { NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  actionLogs,
  auditLogs,
  customers,
  outcomeLogs,
  payments,
  policyCheckLogs,
  recoveryCases,
} from "@/src/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // 1. All Recovery Cases
    const cases = await db
      .select({
        id: recoveryCases.id,
        caseType: recoveryCases.caseType,
        amountAtRisk: recoveryCases.amountAtRisk,
        riskScore: recoveryCases.riskScore,
        riskLevel: recoveryCases.riskLevel,
        rootCause: recoveryCases.rootCause,
        status: recoveryCases.status,
        createdAt: recoveryCases.createdAt,
        updatedAt: recoveryCases.updatedAt,
        customerName: customers.name,
      })
      .from(recoveryCases)
      .leftJoin(customers, eq(recoveryCases.customerId, customers.id))
      .orderBy(desc(recoveryCases.createdAt));

    // 2. Verified Outcome Logs
    const verifiedOutcomes = await db
      .select()
      .from(outcomeLogs)
      .where(eq(outcomeLogs.verified, true));

    // 3. Compute Metrics
    const totalDetected = cases.length;
    const revenueAtRisk = cases.reduce((sum, c) => sum + (c.amountAtRisk || 0), 0);
    const recoveredFromOutcomes = verifiedOutcomes.reduce((sum, o) => sum + (o.amountRecovered || 0), 0);
    const recoveredFromCases = cases
      .filter((c) => c.status === "RECOVERED")
      .reduce((sum, c) => sum + (c.amountAtRisk || 0), 0);
    const revenueRecovered = Math.max(recoveredFromOutcomes, recoveredFromCases);
    const potentiallyRecoverable = Math.round(revenueAtRisk * 0.65);
    const recoveryRate = revenueAtRisk > 0 ? Number(((revenueRecovered / revenueAtRisk) * 100).toFixed(1)) : 0;

    // Average recovery time (in hours) strictly calculated from verified outcomes
    const avgRecoveryTimeSec =
      verifiedOutcomes.length > 0
        ? verifiedOutcomes.reduce((sum, o) => sum + (o.recoveryTimeSeconds || 0), 0) /
          verifiedOutcomes.length
        : 0;
    const avgRecoveryTimeHours = Number((avgRecoveryTimeSec / 3600).toFixed(1));

    // Stream Breakdown calculated strictly from DB cases
    const streamCounts = {
      payment: cases.filter((c) => c.caseType === "payment_failure" || !c.caseType).length,
      b2b: cases.filter((c) => c.caseType === "b2b_receivable").length,
      mandates: cases.filter((c) => c.caseType === "mandate_retry").length,
      voice: cases.filter((c) => c.caseType === "voice_recovery").length,
      promises: cases.filter((c) => c.caseType === "promise_to_pay").length,
      checkout: cases.filter((c) => c.caseType === "checkout_abandonment").length,
      subscription: cases.filter((c) => c.caseType === "subscription_failure").length,
    };

    // 4. Recovery Funnel
    const detectedCount = totalDetected;
    const atRiskCount = cases.filter((c) => c.status !== "CLOSED").length;
    const intervenedCount = cases.filter((c) =>
      ["APPROVED", "EXECUTING", "VERIFYING", "RECOVERED"].includes(c.status)
    ).length;
    const recoveredCount = cases.filter((c) => c.status === "RECOVERED").length;

    // 5. Recent Activity from Audit Logs
    const recentActivity = await db
      .select({
        id: auditLogs.id,
        caseId: auditLogs.caseId,
        actor: auditLogs.actor,
        event: auditLogs.event,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    // 6. Channel Breakdown
    const allActions = await db.select().from(actionLogs);
    const channelCounts: Record<string, number> = {
      Email: 0,
      WhatsApp: 0,
      SMS: 0,
      Retry: 0,
      Others: 0,
    };

    for (const a of allActions) {
      if (a.channel === "email") channelCounts.Email += 1;
      else if (a.channel === "whatsapp") channelCounts.WhatsApp += 1;
      else if (a.channel === "sms") channelCounts.SMS += 1;
      else if (a.channel === "gateway") channelCounts.Retry += 1;
      else channelCounts.Others += 1;
    }

    // 7. Policy Check Logs Summary
    const policyLogs = await db
      .select()
      .from(policyCheckLogs)
      .orderBy(desc(policyCheckLogs.checkedAt))
      .limit(10);

    // 8. All Transactions with Date, Time, and Customer info
    const transactions = await db
      .select({
        id: payments.id,
        razorpayPaymentId: payments.razorpayPaymentId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        failureReason: payments.failureReason,
        paymentMethodType: payments.paymentMethodType,
        paymentMethodLast4: payments.paymentMethodLast4,
        createdAt: payments.createdAt,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
      })
      .from(payments)
      .leftJoin(customers, eq(payments.customerId, customers.id))
      .orderBy(desc(payments.createdAt))
      .limit(100);

    return NextResponse.json({
      metrics: {
        revenueAtRisk,
        potentiallyRecoverable,
        revenueRecovered,
        recoveryRate,
        avgRecoveryTimeHours,
      },
      streamCounts,
      funnel: {
        detected: detectedCount,
        atRisk: atRiskCount,
        intervened: intervenedCount,
        recovered: recoveredCount,
      },
      topCases: cases,
      transactions,
      recentActivity,
      channelBreakdown: channelCounts,
      policyLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to compute analytics" }, { status: 500 });
  }
}
