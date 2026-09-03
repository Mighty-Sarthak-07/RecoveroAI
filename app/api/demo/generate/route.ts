import { NextResponse } from "next/server";
import { seedDemoData } from "@/scripts/seed";

export async function POST() {
  try {
    const result = await seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data generated successfully", result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate demo data" }, { status: 500 });
  }
}
