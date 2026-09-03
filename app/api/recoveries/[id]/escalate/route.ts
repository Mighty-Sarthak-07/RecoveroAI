import { NextRequest, NextResponse } from "next/server";
import { transitionCaseState } from "@/src/lib/recovery/recovery-engine";
import { logAuditEvent } from "@/src/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Manual escalation triggered by merchant operator.";

    await transitionCaseState(id, "ESCALATED", reason);

    await logAuditEvent({
      caseId: id,
      actor: "HUMAN_OPERATOR",
      event: "HUMAN_ESCALATION_TRIGGERED",
      metadata: { reason },
    });

    return NextResponse.json({ success: true, message: "Case successfully escalated for manual review." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to escalate case" }, { status: 500 });
  }
}
