import { NextRequest, NextResponse } from "next/server";
import { defaultPaymentProvider } from "@/src/lib/providers/payment-provider";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debit = await defaultPaymentProvider.retryDebit(id, 249900);
    return NextResponse.json({ success: true, message: `Mandate retry attempt dispatched`, debit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger mandate retry" }, { status: 500 });
  }
}
