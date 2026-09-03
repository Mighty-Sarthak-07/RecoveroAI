import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { rawEvents } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { processEvent } from "@/src/lib/events/event-processor";
import { NormalizedEvent } from "@/src/types/recovery";

export async function GET() {
  try {
    const events = await db
      .select()
      .from(rawEvents)
      .orderBy(desc(rawEvents.receivedAt))
      .limit(50);
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NormalizedEvent;
    if (!body.eventId || !body.eventType || !body.merchantId) {
      return NextResponse.json(
        { error: "Missing required event fields (eventId, eventType, merchantId)" },
        { status: 400 }
      );
    }
    const result = await processEvent(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process event" }, { status: 500 });
  }
}
