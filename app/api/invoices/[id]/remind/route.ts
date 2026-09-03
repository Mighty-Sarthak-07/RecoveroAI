import { NextRequest, NextResponse } from "next/server";
import { defaultCommunicationProvider } from "@/src/lib/providers/communication-provider";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const channel = body.channel || "email";

    const result = await defaultCommunicationProvider.sendMessage({
      to: body.to || "finance@enterprise.com",
      channel,
      template: "invoice_reminder_v1",
      variables: { invoiceId: id },
    });

    return NextResponse.json({ success: true, message: `Invoice reminder dispatched via ${channel}`, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send invoice reminder" }, { status: 500 });
  }
}
