import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { voiceSessions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const eventType = payload.event || payload.message?.type || "call.ended";
    const sessionId = payload.sessionId || payload.message?.call?.id;

    if (sessionId) {
      const [session] = await db
        .select()
        .from(voiceSessions)
        .where(eq(voiceSessions.id, sessionId))
        .limit(1);

      if (session) {
        await db
          .update(voiceSessions)
          .set({
            status: eventType.includes("ended") || eventType.includes("completed") ? "completed" : "connected",
            outcome: {
              ...(session.outcome as object),
              lastWebhookEvent: eventType,
              webhookReceivedAt: new Date().toISOString(),
            },
          })
          .where(eq(voiceSessions.id, sessionId));
      }
    }

    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
