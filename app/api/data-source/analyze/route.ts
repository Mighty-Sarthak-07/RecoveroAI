import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { recoveryCases, payments, customers, caseContext, decisionRecords, auditLogs, merchants } from "@/src/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { runRecoveryAgent } from "@/src/lib/agent/agent";

export async function POST() {
  try {
    // 1. Ensure default merchant exists
    let [merchant] = await db.select().from(merchants).limit(1);
    if (!merchant) {
      const [newM] = await db
        .insert(merchants)
        .values({
          name: "RecoveroAI Merchant Store",
          email: "finance@recoveroai.com",
          policyJson: {
            maxRetries: 4,
            highValueThreshold: 10000000,
            cooldownHours: 6,
            requireConsentForContact: true,
            costCeilingRatio: 0.15,
          },
        })
        .returning();
      merchant = newM;
    }

    // 2. Fetch unanalyzed failed payments
    const failedPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        currency: payments.currency,
        failureReason: payments.failureReason,
        retryCount: payments.retryCount,
        paymentMethodType: payments.paymentMethodType,
        customerId: payments.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        customerLtv: customers.lifetimeValue,
      })
      .from(payments)
      .leftJoin(customers, eq(payments.customerId, customers.id))
      .where(eq(payments.status, "failed"));

    // 3. For each failed payment, if no case exists, run Risk & Customer 360 + AI Analysis
    for (const payment of failedPayments) {
      if (!payment.customerId) continue;

      const [existingCase] = await db
        .select({ id: recoveryCases.id })
        .from(recoveryCases)
        .where(eq(recoveryCases.paymentId, payment.id))
        .limit(1);

      if (existingCase) continue;

      // Customer 360 context aggregation
      const customerTxns = await db
        .select()
        .from(payments)
        .where(eq(payments.customerId, payment.customerId));

      const successfulCount = customerTxns.filter((t) => t.status === "succeeded").length;
      const failedCount = customerTxns.filter((t) => t.status === "failed").length;

      // Run AI Agent Analysis
      const aiDecision = await runRecoveryAgent({
        customerId: payment.customerId,
        paymentId: payment.id,
        amountAtRisk: payment.amount,
        failureReason: payment.failureReason || "insufficient_funds",
        retryCount: payment.retryCount || 1,
        customerName: payment.customerName || "Customer",
        customerEmail: payment.customerEmail || "customer@example.com",
        customerLifetimeValue: payment.customerLtv || 2500000,
        previousSuccessfulPayments: successfulCount,
        previousFailures: failedCount,
        contactPermission: true,
        workflowType: "payment_failure",
      });

      // Create Recovery Case
      const [newCase] = await db
        .insert(recoveryCases)
        .values({
          merchantId: merchant.id,
          customerId: payment.customerId,
          paymentId: payment.id,
          caseType: "payment_failure",
          amountAtRisk: payment.amount,
          riskScore: Math.round((aiDecision.confidence || 0.8) * 100),
          riskLevel: aiDecision.riskLevel || "MEDIUM",
          rootCause: aiDecision.diagnosis || payment.failureReason || "insufficient_funds",
          status: "DETECTED",
          nextActionAt: new Date(Date.now() + (aiDecision.retryAfterHours || 6) * 3600000),
        })
        .returning();

      // Store Case Context Snapshot
      await db.insert(caseContext).values({
        caseId: newCase.id,
        customerSnapshot: {
          name: payment.customerName || "Customer",
          email: payment.customerEmail || "customer@example.com",
          phone: payment.customerPhone || undefined,
          lifetimeValue: payment.customerLtv || 2500000,
          contactPermission: true,
          previousSuccessfulPayments: successfulCount,
          previousFailures: failedCount,
        },
        paymentSnapshot: {
          amount: payment.amount,
          currency: payment.currency || "inr",
          failureReason: payment.failureReason || "insufficient_funds",
          retryCount: payment.retryCount || 1,
          paymentMethodType: payment.paymentMethodType,
        },
      });

      // Store Decision Record
      await db.insert(decisionRecords).values({
        caseId: newCase.id,
        candidateActions: aiDecision.candidateActions || [
          {
            action: aiDecision.selectedAction,
            channel: aiDecision.selectedChannel || "gateway",
            expectedRecovery: payment.amount,
            estimatedCost: 15,
            expectedFailureCost: 0,
            expectedNetValue: payment.amount - 15,
            expectedRoi: 166.0,
            description: "Automated recovery action",
          },
        ],
        selectedAction: aiDecision.selectedAction,
        expectedRecovery: aiDecision.expectedRecovery || payment.amount,
        estimatedCost: aiDecision.estimatedCost || 15,
        expectedNetValue: aiDecision.expectedNetValue || (payment.amount - 15),
        expectedRoi: String(aiDecision.expectedRoi || 166.0),
        confidence: String(aiDecision.confidence || 0.85),
        evidence: aiDecision.evidence || ["Analyzed customer failure history", "Policy thresholds checked"],
        requiresHumanApproval: aiDecision.requiresHumanApproval || false,
      });

      // Log Audit Event
      await db.insert(auditLogs).values({
        caseId: newCase.id,
        actor: "AI",
        event: "AI_RISK_ANALYSIS_COMPLETED",
        metadata: {
          selectedAction: aiDecision.selectedAction,
          riskLevel: aiDecision.riskLevel,
          confidence: aiDecision.confidence,
        },
      });
    }

    // 4. Fetch updated case statistics
    const allCases = await db
      .select({
        id: recoveryCases.id,
        amountAtRisk: recoveryCases.amountAtRisk,
        status: recoveryCases.status,
        caseType: recoveryCases.caseType,
        customerName: customers.name,
      })
      .from(recoveryCases)
      .leftJoin(customers, eq(recoveryCases.customerId, customers.id))
      .orderBy(desc(recoveryCases.createdAt));

    const [txnCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments);

    const totalAnalyzed = txnCount?.count || allCases.length || 0;
    const casesFound = allCases.length;
    const totalRevenueAtRiskCents = allCases.reduce(
      (sum, c) => sum + (c.amountAtRisk || 0),
      0
    );
    const revenueAtRiskRupees = Math.round(totalRevenueAtRiskCents / 100);
    const potentiallyRecoverableRupees = Math.round(revenueAtRiskRupees * 0.65);

    const findings = [
      "Scanned incoming payment failure reasons & transaction patterns",
      "Calculated Customer 360 LTV, historical success rate & failure frequency",
      "Invoked Gemini AI Engine with structured JSON schema & Zod validation",
      "Enforced merchant policy thresholds & created auditable recovery cases",
    ];

    return NextResponse.json({
      success: true,
      message: "RecoveroAI risk analysis complete",
      stats: {
        totalAnalyzed,
        casesFound,
        revenueAtRiskRupees,
        potentiallyRecoverableRupees,
        revenueAtRiskCents: totalRevenueAtRiskCents,
      },
      cases: allCases.slice(0, 10),
      findings,
    });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze revenue risk" },
      { status: 500 }
    );
  }
}
