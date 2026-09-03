import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { merchants } from "@/src/db/schema";
import { processEvent } from "@/src/lib/events/event-processor";
import { runRecoveryAgent } from "@/src/lib/agent/agent";
import { authorizeAndExecuteDecision } from "@/src/lib/recovery/decision-executor";

export async function POST() {
  try {
    let [merchant] = await db.select().from(merchants).limit(1);
    if (!merchant) {
      const [newMerchant] = await db
        .insert(merchants)
        .values({
          name: "Demo Merchant Store",
          email: "demo@recoveroai.com",
          policyJson: {
            maxRetries: 4,
            highValueThreshold: 10000000, // ₹100,000 threshold
            cooldownHours: 6,
            requireConsentForContact: true,
            costCeilingRatio: 0.15,
          },
        })
        .returning();
      merchant = newMerchant;
    }

    const eventId = `evt_demo_killswitch_${Date.now()}`;
    const ingestion = await processEvent({
      eventId,
      eventType: "payment.failed",
      source: "synthetic",
      merchantId: merchant.id,
      customerId: `cust_vikram_${Date.now().toString().slice(-4)}`,
      amount: 20000000, // ₹200,000 (exceeds ₹100,000 threshold)
      currency: "inr",
      failureReason: "do_not_honor",
      retryCount: 4, // Exceeds retry limit
      customerSnapshot: {
        name: "Vikram Malhotra",
        email: "vikram.m@enterprise.com",
        phone: "+919877001122",
        lifetimeValue: 150000000,
        contactPermission: true,
        previousSuccessfulPayments: 5,
        previousFailures: 4,
      },
      timestamp: new Date().toISOString(),
    });

    if (ingestion.recoveryCaseId) {
      // Run decision and policy verification which will trigger BLOCK / ESCALATE
      const decision = await runRecoveryAgent({
        amountAtRisk: 20000000,
        failureReason: "do_not_honor",
        retryCount: 4,
        customerName: "Vikram Malhotra",
        customerLifetimeValue: 150000000,
        contactPermission: true,
        previousSuccessfulPayments: 5,
        previousFailures: 4,
      });

      const executionSummary = await authorizeAndExecuteDecision({
        caseId: ingestion.recoveryCaseId,
        decision,
        autoExecuteIfAllowed: true,
      });

      return NextResponse.json({
        success: true,
        caseId: ingestion.recoveryCaseId,
        message: "Kill Switch Triggered: High-value transaction blocked by deterministic policy.",
        executionSummary,
      });
    }

    return NextResponse.json({ success: true, ingestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger policy violation" }, { status: 500 });
  }
}
