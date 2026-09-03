import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { customers, payments, recoveryCases } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const cases = await db
      .select({
        id: recoveryCases.id,
        caseType: recoveryCases.caseType,
        amountAtRisk: recoveryCases.amountAtRisk,
        riskScore: recoveryCases.riskScore,
        riskLevel: recoveryCases.riskLevel,
        rootCause: recoveryCases.rootCause,
        status: recoveryCases.status,
        nextActionAt: recoveryCases.nextActionAt,
        createdAt: recoveryCases.createdAt,
        updatedAt: recoveryCases.updatedAt,
        customerName: customers.name,
        customerEmail: customers.email,
        paymentStatus: payments.status,
        paymentRetryCount: payments.retryCount,
      })
      .from(recoveryCases)
      .leftJoin(customers, eq(recoveryCases.customerId, customers.id))
      .leftJoin(payments, eq(recoveryCases.paymentId, payments.id))
      .orderBy(desc(recoveryCases.createdAt));

    return NextResponse.json({ cases });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch recovery cases" }, { status: 500 });
  }
}
