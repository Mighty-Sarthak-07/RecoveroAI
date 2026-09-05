import { NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  actionLogs,
  auditLogs,
  caseContext,
  customers,
  decisionRecords,
  invoices,
  invoiceCommunications,
  mandates,
  mandateAttempts,
  merchants,
  outcomeLogs,
  payments,
  policyCheckLogs,
  promisesToPay,
  rawEvents,
  recoveryCases,
  simulationRuns,
  subscriptions,
  voiceSessions,
} from "@/src/db/schema";

export async function POST() {
  try {
    // Delete in reverse dependency order to ensure clean cascading wipe
    await db.delete(auditLogs);
    await db.delete(outcomeLogs);
    await db.delete(actionLogs);
    await db.delete(policyCheckLogs);
    await db.delete(decisionRecords);
    await db.delete(caseContext);
    await db.delete(voiceSessions);
    await db.delete(promisesToPay);
    await db.delete(recoveryCases);
    await db.delete(mandateAttempts);
    await db.delete(mandates);
    await db.delete(invoiceCommunications);
    await db.delete(invoices);
    await db.delete(payments);
    await db.delete(subscriptions);
    await db.delete(customers);
    await db.delete(rawEvents);
    await db.delete(simulationRuns);
    await db.delete(merchants);

    return NextResponse.json({
      success: true,
      message: "All RecoveroAI database records have been deleted successfully. The environment is now fresh.",
    });
  } catch (error: any) {
    console.error("Failed to reset database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset database records" },
      { status: 500 }
    );
  }
}
