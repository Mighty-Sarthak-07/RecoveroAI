import { NextRequest, NextResponse } from "next/server";
import { defaultVoiceProvider } from "@/src/lib/providers/voice-provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const call = await defaultVoiceProvider.initiateCall({
      to: body.phone || "+919876543210",
      language: body.language || "HINGLISH",
      scriptTemplate: "empathetic_recovery_v1",
      context: body.context || {},
    });

    return NextResponse.json({ success: true, call });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start voice session" }, { status: 500 });
  }
}
