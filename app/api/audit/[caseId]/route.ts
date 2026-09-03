import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { auditLogs } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.caseId, caseId))
      .orderBy(desc(auditLogs.timestamp));

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
