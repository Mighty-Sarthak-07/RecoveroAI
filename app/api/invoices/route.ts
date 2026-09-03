import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { invoices } from "@/src/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(50);
    return NextResponse.json({ invoices: allInvoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch invoices" }, { status: 500 });
  }
}
