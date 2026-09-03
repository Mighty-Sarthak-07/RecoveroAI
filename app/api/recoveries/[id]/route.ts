import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  actionLogs,
  auditLogs,
  caseContext,
  customers,
  decisionRecords,
  outcomeLogs,
  payments,
  policyCheckLogs,
  recoveryCases,
  subscriptions,
} from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [recCase] = await db
      .select()
      .from(recoveryCases)
      .where(eq(recoveryCases.id, id))
      .limit(1);

    if (!recCase) {
      return NextResponse.json({ error: "Recovery case not found" }, { status: 404 });
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

    let subscription = null;
    if (recCase.subscriptionId) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, recCase.subscriptionId))
        .limit(1);
      subscription = sub;
    }

    const [context] = await db
      .select()
      .from(caseContext)
      .where(eq(caseContext.caseId, id))
      .limit(1);

    const decisions = await db
      .select()
      .from(decisionRecords)
      .where(eq(decisionRecords.caseId, id))
      .orderBy(desc(decisionRecords.createdAt));

    const policyChecks = await db
      .select()
      .from(policyCheckLogs)
      .where(eq(policyCheckLogs.caseId, id))
      .orderBy(desc(policyCheckLogs.checkedAt));

    const actions = await db
      .select()
      .from(actionLogs)
      .where(eq(actionLogs.caseId, id))
      .orderBy(desc(actionLogs.executedAt));

    const outcomes = await db
      .select()
      .from(outcomeLogs)
      .where(eq(outcomeLogs.caseId, id))
      .orderBy(desc(outcomeLogs.createdAt));

    const auditTrail = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.caseId, id))
      .orderBy(desc(auditLogs.timestamp));

    return NextResponse.json({
      case: recCase,
      customer,
      payment,
      subscription,
      context,
      latestDecision: decisions[0] || null,
      decisions,
      policyChecks,
      actions,
      outcomes,
      auditTrail,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch case detail" }, { status: 500 });
  }
}
