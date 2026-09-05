import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { merchants, customers } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { processEvent } from "@/src/lib/events/event-processor";
import { NormalizedEvent } from "@/src/types/recovery";

interface ParsedRow {
  transaction_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  amount?: string;
  currency?: string;
  status?: string;
  failure_reason?: string;
  payment_method?: string;
  workflow_type?: string;
  customer_ltv?: string;
  days_overdue?: string;
  [key: string]: string | undefined;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  const results: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Match fields with optional comma inside quotes
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ""));

    const row: ParsedRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    results.push(row);
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    let csvText = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csvText || "";
    }

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ error: "Empty CSV content provided" }, { status: 400 });
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid transaction rows found in CSV" }, { status: 400 });
    }

    // Ensure a default merchant exists
    let [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.email, "finance@recoveroai.com"))
      .limit(1);

    if (!merchant) {
      const [newMerchant] = await db
        .insert(merchants)
        .values({
          name: "RecoveroAI Merchant Store",
          email: "finance@recoveroai.com",
          policyJson: {
            maxRetries: 4,
            highValueThreshold: 10000000,
            cooldownHours: 6,
            requireConsentForContact: true,
            costCeilingRatio: 0.15,
          },
        })
        .returning();
      merchant = newMerchant;
    }

    let importedCount = 0;
    let casesCreatedCount = 0;
    let totalRevenueAtRisk = 0;
    const processedEventsSummary: Array<{
      id: string;
      customer: string;
      amount: number;
      workflow: string;
      status: string;
      caseId?: string;
    }> = [];

    const now = Date.now();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const txnId = row.transaction_id || row.id || `CSV-TXN-${now}-${index + 1}`;
      const name = row.customer_name || row.name || `Customer ${index + 1}`;
      const email = row.customer_email || row.email || `customer${index + 1}@example.com`;
      const phone = row.customer_phone || row.phone || "+919800000000";
      const rawAmount = parseFloat(row.amount || "0");
      // If amount looks like rupees (e.g. 2499), convert to cents; if already in cents (>1000000), keep as-is
      const amountInCents = Math.round(rawAmount * 100);
      const currency = (row.currency || "INR").toLowerCase();
      const failureReason = row.failure_reason || "payment_declined";
      const rawStatus = (row.status || "failed").toLowerCase();
      const workflowType = (row.workflow_type || "payment_failure").toLowerCase();
      const ltvInRupees = parseFloat(row.customer_ltv || "25000");
      const ltvInCents = Math.round(ltvInRupees * 100);
      const daysOverdue = row.days_overdue ? parseInt(row.days_overdue, 10) : 14;

      // Map workflowType to NormalizedEvent eventType
      let eventType: NormalizedEvent["eventType"] = "payment.failed";
      let source: NormalizedEvent["source"] = "synthetic";

      if (workflowType === "b2b_receivable" || rawStatus === "overdue" || txnId.startsWith("INV-")) {
        eventType = "invoice.overdue";
        source = "b2b";
      } else if (workflowType === "mandate_retry" || txnId.startsWith("MND-")) {
        eventType = "mandate.failed";
        source = "mandate";
      } else if (workflowType === "checkout_abandonment" || rawStatus === "abandoned") {
        eventType = "checkout.abandoned";
        source = "synthetic";
      } else if (workflowType === "subscription_failure") {
        eventType = "subscription.failed";
        source = "razorpay";
      } else if (workflowType === "voice_recovery") {
        eventType = "voice.intent_detected";
        source = "voice";
      }

      // Check or create customer
      let [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (!customer) {
        const [newCustomer] = await db
          .insert(customers)
          .values({
            merchantId: merchant.id,
            externalId: `cus_csv_${now}_${index}`,
            name,
            email,
            phone,
            lifetimeValue: ltvInCents,
            contactPermission: true,
            riskScore: 30,
            status: "active",
          })
          .returning();
        customer = newCustomer;
      }

      const normalizedEvent: NormalizedEvent = {
        eventId: `evt_${txnId}_${now}`,
        eventType,
        source,
        merchantId: merchant.id,
        customerId: customer.id,
        amount: amountInCents,
        currency,
        failureReason,
        retryCount: 1,
        daysOverdue: eventType === "invoice.overdue" ? daysOverdue : undefined,
        customerSnapshot: {
          name,
          email,
          phone,
          lifetimeValue: ltvInCents,
          contactPermission: true,
          previousSuccessfulPayments: 12,
          previousFailures: 1,
        },
        metadata: {
          importedVia: "CSV_UPLOAD",
          originalTxnId: txnId,
          invoiceNumber: eventType === "invoice.overdue" ? txnId : undefined,
          mandateReference: eventType === "mandate.failed" ? txnId : undefined,
        },
        timestamp: new Date().toISOString(),
      };

      const result = await processEvent(normalizedEvent);
      importedCount++;

      if (result.atRisk) {
        casesCreatedCount++;
        totalRevenueAtRisk += amountInCents;
      }

      processedEventsSummary.push({
        id: txnId,
        customer: name,
        amount: rawAmount,
        workflow: workflowType,
        status: rawStatus,
        caseId: result.recoveryCaseId,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${importedCount} transactions from CSV.`,
      summary: {
        totalRows: rows.length,
        importedCount,
        casesCreatedCount,
        totalRevenueAtRiskCents: totalRevenueAtRisk,
        totalRevenueAtRiskRupees: Math.round(totalRevenueAtRisk / 100),
      },
      records: processedEventsSummary,
    });
  } catch (error: any) {
    console.error("CSV Upload Processing Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CSV transaction data" },
      { status: 500 }
    );
  }
}
