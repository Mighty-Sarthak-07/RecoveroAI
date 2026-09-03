import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { promisesToPay } from "@/src/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allPromises = await db.select().from(promisesToPay).orderBy(desc(promisesToPay.createdAt)).limit(50);
    return NextResponse.json({ promises: allPromises });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch promises" }, { status: 500 });
  }
}
