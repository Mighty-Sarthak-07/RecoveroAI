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

    const eventId = `evt_demo_sub_${Date.now()}`;
    const result = await processEvent({
      eventId,
      eventType: "subscription.failed",
      source: "synthetic",
      merchantId: merchant.id,
      customerId: `cust_demo_${Date.now().toString().slice(-4)}`,
      subscriptionId: `sub_demo_${Date.now().toString().slice(-4)}`,
      amount: 1299900, // ₹12,999
      currency: "inr",
      failureReason: "card_declined_expired",
      retryCount: 2,
      customerSnapshot: {
        name: "Acme Corp Ltd",
        email: "finance@acmecorp.in",
        phone: "+919822334455",
        lifetimeValue: 15598800,
        contactPermission: true,
        previousSuccessfulPayments: 24,
        previousFailures: 2,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger subscription failure" }, { status: 500 });
  }
}
