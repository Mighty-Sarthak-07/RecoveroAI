import { NextRequest, NextResponse } from "next/server";
import { verifyRecoveryOutcome } from "@/src/lib/recovery/outcome-verifier";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await verifyRecoveryOutcome({
      caseId: id,
      forceSuccess: body.forceSuccess ?? true,
      verificationSource: body.verificationSource || "gateway_verification_service",
      notes: body.notes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify recovery" }, { status: 500 });
  }
}
