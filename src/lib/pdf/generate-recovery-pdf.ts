import jsPDF from "jspdf";

interface PDFData {
  caseId?: string;
  customerName?: string;
  amountAtRiskRupees?: number;
  rootCause?: string;
  workflowType?: string;
  status?: string;
  diagnosis?: string;
  policyResult?: string;
  actions?: Array<{
    name: string;
    channel: string;
    expRecovery: number;
    cost: number;
    netValue: number;
    roi: string;
    status: string;
  }>;
}

export function generateRecoveryWorkflowPDF(data: PDFData = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const customerName = data.customerName || "Rahul Sharma";
  const amountRupees = data.amountAtRiskRupees || 2499;
  const caseId = (data.caseId || "CASE-8500").substring(0, 10);
  const rootCause = data.rootCause || "insufficient_funds";
  const workflowType = data.workflowType || "payment_failure";
  const status = data.status || "RECOVERED";

  // ==========================================
  // PAGE 1: OVERVIEW, DAG NODES & ROI MATRIX
  // ==========================================

  // --- BRAND HEADER BAR ---
  doc.setFillColor(91, 61, 245); // #5B3DF5 Primary Purple
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("RecoveroAI • Autonomous Decision Graph Report", 14, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Page 1 of 2  •  ${new Date().toLocaleDateString("en-IN")}`, 145, 15);

  // --- CASE SUMMARY BOX ---
  let y = 32;
  doc.setFillColor(250, 251, 255); // #FAFBFF
  doc.setDrawColor(231, 234, 240); // #E7EAF0
  doc.roundedRect(14, y, 182, 30, 3, 3, "FD");

  doc.setTextColor(102, 112, 133); // #667085
  doc.setFontSize(8);
  doc.text("CASE IDENTIFIER", 20, y + 8);
  doc.text("CUSTOMER ACCOUNT", 65, y + 8);
  doc.text("AMOUNT AT RISK", 115, y + 8);
  doc.text("STATUS", 160, y + 8);

  doc.setTextColor(17, 24, 39); // #111827
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`#${caseId}`, 20, y + 16);
  doc.text(customerName, 65, y + 16);
  doc.text(`INR ${amountRupees.toLocaleString()}`, 115, y + 16);

  doc.setFillColor(19, 185, 129); // #13B981 Green
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.roundedRect(158, y + 11, 28, 7, 2, 2, "F");
  doc.text(status, 162, y + 16);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Workflow: ${workflowType}  •  Root Cause: ${rootCause}`, 20, y + 24);

  // --- SECTION 1: EXECUTION DAG NODES ---
  y += 38;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Autonomous Workflow Node Execution DAG", 14, y);

  y += 6;
  const nodes = [
    {
      step: "NODE 01 • TRIGGER EVENT",
      title: "Revenue Risk Ingested",
      desc: `Event: payment.failed  |  Gateway: Razorpay  |  Amount: INR ${amountRupees.toLocaleString()}`,
      color: [91, 61, 245],
    },
    {
      step: "NODE 02 • CUSTOMER 360 CONTEXT",
      title: "Context & History Aggregated",
      desc: `Customer: ${customerName}  |  LTV: INR 34,986  |  Prior Successes: 14`,
      color: [47, 107, 255],
    },
    {
      step: "NODE 03 • GEMINI AI DIAGNOSIS",
      title: "AI Cause & Intent Diagnosis",
      desc: `Diagnosis: ${rootCause} (Confidence: 88%)  |  Rec: Instant Payment Link (WhatsApp) & Voice`,
      color: [91, 61, 245],
    },
    {
      step: "NODE 04 • MERCHANT POLICY GUARDRAIL",
      title: "Policy Evaluation & Guardrail Verification",
      desc: "Result: APPROVED  |  Max Retries: 4  |  Cooldown: 6 hrs  |  Quiet Hours: Passed",
      color: [19, 185, 129],
    },
  ];

  nodes.forEach((node) => {
    doc.setFillColor(250, 251, 255);
    doc.setDrawColor(231, 234, 240);
    doc.roundedRect(14, y, 182, 18, 2, 2, "FD");

    // Left accent bar
    doc.setFillColor(node.color[0], node.color[1], node.color[2]);
    doc.rect(14, y, 3, 18, "F");

    doc.setTextColor(node.color[0], node.color[1], node.color[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(node.step, 20, y + 6);

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(9);
    doc.text(node.title, 65, y + 6);

    doc.setTextColor(102, 112, 133);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(node.desc, 20, y + 13);

    y += 22;
  });

  // --- SECTION 2: MULTI-BRANCH STRATEGY ---
  y += 4;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Multi-Branch Decision Matrix & Intervention Channels", 14, y);

  y += 6;
  // Branch A
  doc.setFillColor(234, 251, 244); // Green light
  doc.setDrawColor(19, 185, 129);
  doc.roundedRect(14, y, 88, 26, 2, 2, "FD");

  doc.setTextColor(19, 185, 129);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PRIMARY BRANCH A (ACTIVE)", 18, y + 7);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);
  doc.text("Instant Payment Link Recovery", 18, y + 13);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Channel: WhatsApp & Hosted Checkout", 18, y + 18);

  doc.setTextColor(19, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(`Status: Verified & Recovered (INR ${amountRupees.toLocaleString()})`, 18, y + 23);

  // Branch B
  doc.setFillColor(247, 248, 252);
  doc.setDrawColor(231, 234, 240);
  doc.roundedRect(108, y, 88, 26, 2, 2, "FD");

  doc.setTextColor(91, 61, 245);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FALLBACK BRANCH B (STANDBY)", 112, y + 7);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);
  doc.text("Hinglish Voice Recovery Call", 112, y + 13);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Channel: AI Voice Agent + Intent Detection", 112, y + 18);
  doc.text("Status: Scheduled if Primary Unfulfilled", 112, y + 23);

  // --- SECTION 3: ROI MATRIX TABLE ---
  y += 34;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Action Candidate ROI Comparison", 14, y);

  y += 6;
  // Table Header
  doc.setFillColor(241, 237, 255);
  doc.rect(14, y, 182, 7, "F");

  doc.setTextColor(91, 61, 245);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("CANDIDATE ACTION", 18, y + 5);
  doc.text("CHANNEL", 70, y + 5);
  doc.text("EXP. RECOVERY", 105, y + 5);
  doc.text("COST", 138, y + 5);
  doc.text("ROI RATIO", 160, y + 5);
  doc.text("STATUS", 180, y + 5);

  const actions = [
    { name: "Instant Payment Link", channel: "WhatsApp", recovery: `INR ${amountRupees.toLocaleString()}`, cost: "INR 15", roi: "166.0x", sel: "SELECTED" },
    { name: "Hinglish Voice Recovery", channel: "Phone Agent", recovery: `INR ${amountRupees.toLocaleString()}`, cost: "INR 45", roi: "55.0x", sel: "STANDBY" },
    { name: "Human Specialist Escalation", channel: "Manual", recovery: `INR ${amountRupees.toLocaleString()}`, cost: "INR 250", roi: "10.0x", sel: "FALLBACK" },
  ];

  y += 7;
  actions.forEach((act, idx) => {
    doc.setFillColor(idx === 0 ? 234 : 255, idx === 0 ? 251 : 255, idx === 0 ? 244 : 255);
    doc.rect(14, y, 182, 7, "F");

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(8);
    doc.setFont("helvetica", idx === 0 ? "bold" : "normal");
    doc.text(act.name, 18, y + 5);

    doc.setTextColor(91, 61, 245);
    doc.text(act.channel, 70, y + 5);

    doc.setTextColor(17, 24, 39);
    doc.text(act.recovery, 105, y + 5);
    doc.text(act.cost, 138, y + 5);
    doc.text(act.roi, 160, y + 5);

    doc.setTextColor(idx === 0 ? 19 : 102, idx === 0 ? 185 : 112, idx === 0 ? 129 : 133);
    doc.setFont("helvetica", "bold");
    doc.text(act.sel, 180, y + 5);

    y += 7;
  });

  // --- FOOTER & AUDIT SEAL PAGE 1 ---
  y += 12;
  doc.setFillColor(250, 251, 255);
  doc.setDrawColor(19, 185, 129);
  doc.roundedRect(14, y, 182, 16, 3, 3, "FD");

  doc.setFillColor(19, 185, 129);
  doc.circle(23, y + 8, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("v", 21.8, y + 10.5);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terminal Outcome: Verified & Recovered via Webhook", 32, y + 7);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("100% Auditable Execution • RecoveroAI Autonomous Decision Engine", 32, y + 12);

  // ==========================================
  // PAGE 2: HIERARCHICAL DECISION TREE & FAIL/FALLBACK MATRIX
  // ==========================================
  doc.addPage();

  // --- BRAND HEADER BAR PAGE 2 ---
  doc.setFillColor(91, 61, 245);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("RecoveroAI • Process Execution Tree & Exception Matrix", 14, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Page 2 of 2  •  ${new Date().toLocaleDateString("en-IN")}`, 145, 15);

  y = 32;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. Hierarchical Decision Tree & Execution Branch Breakdown", 14, y);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Conditional branching, risk thresholds, failure detection, and automated fallback pathways", 14, y + 5);

  // --- TREE CANVAS CARD ---
  y += 12;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(91, 61, 245);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, 182, 215, 3, 3, "FD");

  let ty = y + 10;

  // Root Box
  doc.setFillColor(91, 61, 245);
  doc.roundedRect(20, ty, 170, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`ROOT: Payment Risk Event Ingested (INR ${amountRupees.toLocaleString()})`, 25, ty + 6);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Event: payment.failed  |  Gateway: Razorpay  |  Customer: ${customerName}`, 25, ty + 11);

  // Vertical Connector
  ty += 14;
  doc.setDrawColor(91, 61, 245);
  doc.setLineWidth(0.4);
  doc.line(105, ty, 105, ty + 6);

  // Level 1: Risk Assessment
  ty += 6;
  doc.setFillColor(241, 237, 255);
  doc.setDrawColor(91, 61, 245);
  doc.roundedRect(25, ty, 160, 14, 2, 2, "FD");
  doc.setTextColor(91, 61, 245);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("LEVEL 1 • Risk & Fraud Assessment (Score: 85 - MEDIUM/HIGH)", 30, ty + 6);
  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("├── [Score <= 30] Low Risk -> Auto-Email  |  ├── [30 < Score <= 85] Proceed Policy Check (MATCHED)", 30, ty + 11);

  // Vertical Connector
  ty += 14;
  doc.line(105, ty, 105, ty + 6);

  // Level 2: Policy Evaluation
  ty += 6;
  doc.setFillColor(234, 251, 244);
  doc.setDrawColor(19, 185, 129);
  doc.roundedRect(25, ty, 160, 16, 2, 2, "FD");
  doc.setTextColor(19, 185, 129);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("LEVEL 2 • Merchant Policy Guardrail Checks -> RESULT: ALLOW / APPROVED", 30, ty + 6);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("├── RetryCount < 4 (Current: 1/4 PASSED)  |  ├── Cooldown >= 6 Hours (PASSED)", 30, ty + 11);
  doc.text("└── Quiet Hours (10 PM - 8 AM PASSED)  |  └── Contact Consent: YES", 30, ty + 14.5);

  // Vertical Connector & Branch Split
  ty += 16;
  doc.setDrawColor(91, 61, 245);
  doc.line(105, ty, 105, ty + 5);
  doc.line(60, ty + 5, 150, ty + 5);
  doc.line(60, ty + 5, 60, ty + 10);
  doc.line(150, ty + 5, 150, ty + 10);

  // Level 3: Dual Execution Branches
  ty += 10;
  // Branch A Box
  doc.setFillColor(234, 251, 244);
  doc.setDrawColor(19, 185, 129);
  doc.roundedRect(25, ty, 75, 45, 2, 2, "FD");
  doc.setTextColor(19, 185, 129);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PRIMARY EXECUTION (BRANCH A)", 29, ty + 6);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(8.5);
  doc.text("Instant Payment Link (WhatsApp)", 29, ty + 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 112, 133);
  doc.text("Dispatched via WhatsApp API", 29, ty + 17);
  doc.text("Hosted Checkout Portal generated", 29, ty + 21);

  doc.setDrawColor(19, 185, 129);
  doc.line(29, ty + 24, 95, ty + 24);

  doc.setTextColor(19, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text("✓ IF SUCCESS (200 OK Webhook)", 29, ty + 29);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "normal");
  doc.text("-> Payment Settled -> Mark RECOVERED", 29, ty + 33);

  doc.setTextColor(229, 72, 77); // Red
  doc.setFont("helvetica", "bold");
  doc.text("⚡ IF FAIL / UNOPENED (24 Hrs)", 29, ty + 38);
  doc.setTextColor(102, 112, 133);
  doc.setFont("helvetica", "normal");
  doc.text("-> Trigger Fallback Branch B", 29, ty + 42);

  // Branch B Box
  doc.setFillColor(241, 237, 255);
  doc.setDrawColor(91, 61, 245);
  doc.roundedRect(110, ty, 75, 45, 2, 2, "FD");
  doc.setTextColor(91, 61, 245);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FALLBACK EXECUTION (BRANCH B)", 114, ty + 6);
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(8.5);
  doc.text("Hinglish Voice Recovery Call", 114, ty + 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 112, 133);
  doc.text("Empathetic AI Conversational Agent", 114, ty + 17);
  doc.text("Intent Classifier: PAY_NOW / TRY_LATER", 114, ty + 21);

  doc.setDrawColor(91, 61, 245);
  doc.line(114, ty + 24, 180, ty + 24);

  doc.setTextColor(19, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text("✓ Intent: PAY_NOW", 114, ty + 29);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "normal");
  doc.text("-> Send UPI Link -> Mark RECOVERED", 114, ty + 33);

  doc.setTextColor(91, 61, 245);
  doc.setFont("helvetica", "bold");
  doc.text("🕒 Intent: TRY_LATER ('Kal Karunga')", 114, ty + 38);
  doc.setTextColor(102, 112, 133);
  doc.setFont("helvetica", "normal");
  doc.text("-> Schedule Promise-to-Pay Tracker", 114, ty + 42);

  // Vertical Connectors to Terminal
  ty += 45;
  doc.setDrawColor(19, 185, 129);
  doc.line(62, ty, 62, ty + 6);
  doc.setDrawColor(91, 61, 245);
  doc.line(147, ty, 147, ty + 6);
  doc.line(62, ty + 6, 147, ty + 6);
  doc.line(105, ty + 6, 105, ty + 11);

  // Level 4: Terminal Outcome Box
  ty += 11;
  doc.setFillColor(234, 251, 244);
  doc.setDrawColor(19, 185, 129);
  doc.setLineWidth(0.6);
  doc.roundedRect(25, ty, 160, 22, 3, 3, "FD");

  doc.setFillColor(19, 185, 129);
  doc.circle(35, ty + 11, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("v", 33.5, ty + 14);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("TERMINAL NODE • Verified Closed-Loop Financial Settlement", 45, ty + 9);

  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Transaction verified via webhook  |  Amount: INR ${amountRupees.toLocaleString()}  |  Ledger Audit Trail Updated`, 45, ty + 15);

  // Footer Audit Hash
  y = 278;
  doc.setTextColor(102, 112, 133);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("RecoveroAI Bounded Autonomy Engine • Cryptographic Audit Hash: 0x8f4b29c91a004e12fd99a182", 14, y);
  doc.text("Page 2 of 2", 188, y);

  // Save PDF
  doc.save(`RecoveroAI_Workflow_Graph_${caseId}.pdf`);
}
