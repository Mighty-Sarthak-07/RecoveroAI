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

    const eventId = `evt_demo_checkout_${Date.now()}`;
    const result = await processEvent({
      eventId,
      eventType: "checkout.abandoned",
      source: "synthetic",
      merchantId: merchant.id,
      customerId: `cust_demo_${Date.now().toString().slice(-4)}`,
      amount: 129900, // ₹1,299
      currency: "inr",
      failureReason: "cart_abandoned_at_checkout",
      retryCount: 0,
      customerSnapshot: {
        name: "Priya Singh",
        email: "priya.singh@example.com",
        phone: "+919812345678",
        lifetimeValue: 1299000,
        contactPermission: true,
        previousSuccessfulPayments: 8,
        previousFailures: 0,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger checkout abandonment" }, { status: 500 });
  }
}
