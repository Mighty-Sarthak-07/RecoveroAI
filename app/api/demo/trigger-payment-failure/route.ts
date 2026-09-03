import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { merchants } from "@/src/db/schema";
import { processEvent } from "@/src/lib/events/event-processor";

export async function POST() {
  try {
    let [merchant] = await db.select().from(merchants).limit(1);
    if (!merchant) {
      const [newMerchant] = await db
        .insert(merchants)
        .values({ name: "Demo Merchant Store", email: "demo@recoveroai.com" })
        .returning();
      merchant = newMerchant;
    }

    const eventId = `evt_demo_fail_${Date.now()}`;
    const result = await processEvent({
      eventId,
      eventType: "payment.failed",
      source: "synthetic",
      merchantId: merchant.id,
      customerId: `cust_demo_${Date.now().toString().slice(-4)}`,
      amount: 249900, // ₹2,499
      currency: "inr",
      failureReason: "insufficient_funds",
      retryCount: 1,
      customerSnapshot: {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+919876543210",
        lifetimeValue: 3498600,
        contactPermission: true,
        previousSuccessfulPayments: 14,
        previousFailures: 1,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger payment failure" }, { status: 500 });
  }
}
