import { NextRequest, NextResponse } from "next/server";
import { generateDemoTransactionsBatch, seedDemoData } from "@/scripts/seed";

export async function POST(req: NextRequest) {
  try {
    let count = 50;
    try {
      const body = await req.json();
      if (body.count) count = Number(body.count);
    } catch {
      // Default to 50
    }

    if (count > 0 && count !== 8) {
      const result = await generateDemoTransactionsBatch(count);
      return NextResponse.json({
        success: true,
        message: `Successfully generated ${result.generatedCount} realistic transactions into database.`,
        result,
      });
    }

    const result = await seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data seeded successfully", result });
  } catch (error: any) {
    console.error("Demo generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate demo data" }, { status: 500 });
  }
}
