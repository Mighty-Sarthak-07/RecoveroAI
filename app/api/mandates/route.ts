import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { mandates } from "@/src/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allMandates = await db.select().from(mandates).orderBy(desc(mandates.createdAt)).limit(50);
    return NextResponse.json({ mandates: allMandates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch mandates" }, { status: 500 });
  }
}
