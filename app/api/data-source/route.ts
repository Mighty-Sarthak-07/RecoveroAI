import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { merchants, customers, payments, recoveryCases, rawEvents } from "@/src/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const [caseCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(recoveryCases);

    const [txnCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments);

    const [customerCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers);

    const [rawEventsCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rawEvents);

    const [merchant] = await db
      .select()
      .from(merchants)
      .limit(1);

    const totalCases = caseCountRes?.count || 0;
    const totalPayments = txnCountRes?.count || 0;
    const totalCustomers = customerCountRes?.count || 0;
    const totalRawEvents = rawEventsCountRes?.count || 0;

    // Determine current source flavor
    let detectedSource = "none";
    if (totalCases > 0) {
      // Check latest events
      const [latestEvent] = await db
        .select()
        .from(rawEvents)
        .limit(1);

      if (latestEvent?.source === "razorpay") {
        detectedSource = "razorpay";
      } else if (latestEvent?.source === "synthetic") {
        detectedSource = "csv";
      } else {
        detectedSource = "demo";
      }
    }

    return NextResponse.json({
      active: totalCases > 0,
      source: detectedSource,
      stats: {
        totalCases,
        totalPayments,
        totalCustomers,
        totalRawEvents,
      },
      merchant: merchant
        ? {
            id: merchant.id,
            name: merchant.name,
            email: merchant.email,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch data source status" },
      { status: 500 }
    );
  }
}
