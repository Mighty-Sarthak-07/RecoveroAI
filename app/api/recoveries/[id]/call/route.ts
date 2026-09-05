import { NextRequest, NextResponse } from "next/server";
import { executeVoiceRecoverySession } from "@/src/lib/voice/voice-agent-orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await executeVoiceRecoverySession({
      caseId: id,
      customerPhone: body.customerPhone,
      customerName: body.customerName,
      transcriptInput: body.transcriptInput,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Voice Recovery API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute Voice Recovery Agent" },
      { status: 500 }
    );
  }
}
