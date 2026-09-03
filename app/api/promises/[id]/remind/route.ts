import { NextRequest, NextResponse } from "next/server";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await defaultCommunicationProvider.sendMessage({
      to: body.phone || "+919876543210",
      channel: "whatsapp",
      template: "promise_due_reminder_v1",
      variables: { promiseId: id },
    });

    return NextResponse.json({ success: true, message: "Promise reminder dispatched via WhatsApp", result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send promise reminder" }, { status: 500 });
  }
}
