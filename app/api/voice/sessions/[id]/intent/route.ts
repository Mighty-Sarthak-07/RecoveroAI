import { NextRequest, NextResponse } from "next/server";
import { defaultVoiceProvider } from "@/src/lib/providers/voice-provider";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const transcriptText = body.text || "Kal karunga";
    const intent = await defaultVoiceProvider.detectIntent(transcriptText);

    return NextResponse.json({
      sessionId: id,
      transcript: transcriptText,
      detectedIntent: intent,
      nextAction: intent === "TRY_LATER" ? "CREATE_PROMISE_TO_PAY" : "SEND_INSTANT_PAYMENT_LINK",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to detect voice intent" }, { status: 500 });
  }
}
