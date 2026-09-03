import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { promisesToPay } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [promise] = await db
      .update(promisesToPay)
      .set({
        status: "FULFILLED",
        updatedAt: new Date(),
      })
      .where(eq(promisesToPay.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Promise payment verified and marked FULFILLED!",
      promise,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify promise" }, { status: 500 });
  }
}
