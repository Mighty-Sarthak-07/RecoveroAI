import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { merchants, customers } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { processEvent } from "@/src/lib/events/event-processor";
import { NormalizedEvent } from "@/src/types/recovery";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const eventName = rawBody.event || "payment.failed";
    const payload = rawBody.payload || {};
    const entity = payload.payment?.entity || payload.subscription?.entity || payload.invoice?.entity || {};

    const paymentId = entity.id || `pay_rzp_${Date.now()}`;
    const amountInCents = entity.amount || 249900;
    const currency = (entity.currency || "INR").toLowerCase();
    const email = entity.email || "customer@example.com";
    const name = entity.contact_name || entity.notes?.customer_name || "Razorpay Customer";
    const phone = entity.contact || null;
    const failureReason = entity.error_description || entity.error_reason || "payment_declined";

    // Find default merchant
    let [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.email, "finance@recoveroai.com"))
      .limit(1);

    if (!merchant) {
      const [newMerchant] = await db
        .insert(merchants)
        .values({
          name: "Razorpay Live Store",
          email: "finance@recoveroai.com",
          policyJson: {
            maxRetries: 4,
            highValueThreshold: 10000000,
            cooldownHours: 6,
            requireConsentForContact: true,
            costCeilingRatio: 0.15,
          },
        })
        .returning();
      merchant = newMerchant;
    }

    // Ensure customer
    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer) {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          merchantId: merchant.id,
          externalId: `cus_${paymentId}`,
          name,
          email,
          phone,
          lifetimeValue: 3500000,
          contactPermission: true,
          riskScore: 30,
          status: "active",
        })
        .returning();
      customer = newCustomer;
    }

    // Map Razorpay webhook event to NormalizedEvent
    let normalizedEventType: NormalizedEvent["eventType"] = "payment.failed";
    if (eventName === "subscription.halted" || eventName === "subscription.failed") {
      normalizedEventType = "subscription.failed";
    } else if (eventName === "invoice.expired" || eventName === "invoice.overdue") {
      normalizedEventType = "invoice.overdue";
    }

    const normalizedEvent: NormalizedEvent = {
      eventId: `evt_webhook_${paymentId}_${Date.now()}`,
      eventType: normalizedEventType,
      source: "razorpay",
      merchantId: merchant.id,
      customerId: customer.id,
      amount: amountInCents,
      currency,
      failureReason,
      retryCount: entity.retry_count || 1,
      customerSnapshot: {
        name,
        email,
        phone,
        lifetimeValue: customer.lifetimeValue || 3500000,
        contactPermission: true,
        previousSuccessfulPayments: 10,
        previousFailures: 1,
      },
      metadata: {
        rawWebhookEvent: eventName,
        paymentId,
        gateway: "razorpay",
      },
      timestamp: new Date().toISOString(),
    };

    const processResult = await processEvent(normalizedEvent);

    return NextResponse.json({
      received: true,
      event: eventName,
      processed: processResult.processed,
      recoveryCaseId: processResult.recoveryCaseId,
    });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Razorpay webhook" },
      { status: 500 }
    );
  }
}
