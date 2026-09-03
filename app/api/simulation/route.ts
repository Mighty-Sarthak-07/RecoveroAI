import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { simulationRuns } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { generateSyntheticEvents } from "@/scripts/generate-dataset";
import { runRecoverySimulation } from "@/src/lib/simulation/simulation-engine";

export async function GET() {
  try {
    const runs = await db
      .select()
      .from(simulationRuns)
      .orderBy(desc(simulationRuns.createdAt))
      .limit(20);
    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch simulations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count = Number(body.count || 1000);
    const strategy = body.strategy || "COMPARISON";

    // Generate batch of synthetic events
    const events = generateSyntheticEvents(count);

    // Run batch simulation
    const result = await runRecoverySimulation({
      events,
      strategy,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run simulation" }, { status: 500 });
  }
}
