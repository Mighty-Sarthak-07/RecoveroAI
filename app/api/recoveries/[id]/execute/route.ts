import { NextRequest, NextResponse } from "next/server";
import { executeRecoveryAction } from "@/src/lib/recovery/action-orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await executeRecoveryAction({
      caseId: id,
      actionType: body.actionType || "IMMEDIATE_RETRY",
      channel: body.channel || "gateway",
      payload: body.payload,
      retryAfterHours: body.retryAfterHours,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute action" }, { status: 500 });
  }
}
