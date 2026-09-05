import { NextRequest, NextResponse } from "next/server";
import { transitionCaseState } from "@/src/lib/recovery/recovery-engine";
import { logAuditEvent } from "@/src/lib/audit";
import { db } from "@/src/db";
import { recoveryCases } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Manual escalation triggered by merchant operator.";

    const [existingCase] = await db
      .select()
      .from(recoveryCases)
      .where(eq(recoveryCases.id, id))
      .limit(1);

    if (!existingCase) {
      return NextResponse.json(
        { error: `Recovery case ${id} not found.` },
        { status: 404 }
      );
    }

    await transitionCaseState(id, "ESCALATED", reason);

    await logAuditEvent({
      caseId: id,
      actor: "HUMAN_OPERATOR",
      event: "HUMAN_ESCALATION_TRIGGERED",
      metadata: { reason, previousState: existingCase.status },
    });

    return NextResponse.json({
      success: true,
      message: "Case successfully escalated for manual review.",
    });
  } catch (error: any) {
    console.error("Escalation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to escalate case" },
      { status: 400 }
    );
  }
}
