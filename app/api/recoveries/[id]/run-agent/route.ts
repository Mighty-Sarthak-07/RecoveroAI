import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  caseContext,
  customers,
  payments,
  recoveryCases,
  subscriptions,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { runRecoveryAgent } from "@/src/lib/agent/agent";
import { authorizeAndExecuteDecision } from "@/src/lib/recovery/decision-executor";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const autoExecute = body.autoExecute ?? true;

    // 1. Fetch case & context
    const [recCase] = await db
      .select()
      .from(recoveryCases)
      .where(eq(recoveryCases.id, id))
      .limit(1);

    if (!recCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, recCase.customerId))
      .limit(1);

    let payment = null;
    if (recCase.paymentId) {
      const [p] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, recCase.paymentId))
        .limit(1);
      payment = p;
    }

    const [context] = await db
      .select()
      .from(caseContext)
      .where(eq(caseContext.caseId, id))
      .limit(1);

    // 2. Transition state to DIAGNOSING -> DECIDING
    await db
      .update(recoveryCases)
      .set({ status: "DIAGNOSING", updatedAt: new Date() })
      .where(eq(recoveryCases.id, id));

    // 3. Run AI Decision Agent (Gemini API with fallback)
    const decision = await runRecoveryAgent({
      amountAtRisk: recCase.amountAtRisk,
      failureReason: recCase.rootCause || payment?.failureReason,
      retryCount: payment?.retryCount || context?.invoiceSnapshot?.previousRemindersCount || context?.mandateSnapshot?.retryCount || 0,
      customerName: customer?.name,
      customerLifetimeValue: customer?.lifetimeValue,
      contactPermission: customer?.contactPermission ?? true,
      previousSuccessfulPayments: context?.customerSnapshot?.previousSuccessfulPayments || 14,
      previousFailures: context?.customerSnapshot?.previousFailures || 1,
      hasActiveSubscription: !!recCase.subscriptionId,
      workflowType: recCase.caseType,
      daysOverdue: context?.invoiceSnapshot?.daysOverdue,
      detectedIntent: context?.voiceSnapshot?.detectedIntent || undefined,
    });

    // 4. Authorize via Deterministic Policy Engine & Execute
    const executionSummary = await authorizeAndExecuteDecision({
      caseId: id,
      decision,
      autoExecuteIfAllowed: autoExecute,
    });

    return NextResponse.json({
      success: true,
      decision,
      executionSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run agent" }, { status: 500 });
  }
}
