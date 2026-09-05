"use client";

import React, { useState } from "react";
import {
  GitBranch,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  PhoneCall,
  CreditCard,
  Building2,
  Clock,
  ArrowRight,
  RefreshCw,
  Cpu,
  CornerDownRight,
  FileText,
} from "lucide-react";
import { generateRecoveryWorkflowPDF } from "@/src/lib/pdf/generate-recovery-pdf";

interface WorkflowNodeTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: any;
}

export function WorkflowNodeTreeModal({
  isOpen,
  onClose,
  caseData,
}: WorkflowNodeTreeModalProps) {
  const [activeTab, setActiveTab] = useState<"graph" | "tree" | "matrix">("graph");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const caseType = caseData?.caseType || "payment_failure";
  const customerName = caseData?.customerName || caseData?.customerSnapshot?.name || "Rahul Sharma";
  const amountRupees = Math.round((caseData?.amountAtRisk || 249900) / 100);
  const status = caseData?.status || "RECOVERED";
  const rootCause = caseData?.rootCause || "insufficient_funds";

  const handleRegenerateGraph = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleGeneratePDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateRecoveryWorkflowPDF({
        caseId: caseData?.id,
        customerName,
        amountAtRiskRupees: amountRupees,
        rootCause,
        workflowType: caseType,
        status,
      });
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:w-full">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFBFF]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-[11px] font-extrabold mb-1 border border-[#5B3DF5]/30">
              <GitBranch className="w-3.5 h-3.5" /> Autonomous Workflow Graph Engine
            </div>
            <h2 className="text-xl font-extrabold text-[#111827]">
              Recovery Execution Node Tree &amp; Decision Graph
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Live DAG (Directed Acyclic Graph) showing multi-branch recovery decision nodes &amp; policy evaluation
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap print:hidden">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#F7F8FC] rounded-xl border border-[#E7EAF0] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("graph")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "graph"
                    ? "bg-[#5B3DF5] text-white shadow-2xs"
                    : "text-[#667085] hover:text-[#111827]"
                }`}
              >
                Nodes &amp; Graph
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tree")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "tree"
                    ? "bg-[#5B3DF5] text-white shadow-2xs"
                    : "text-[#667085] hover:text-[#111827]"
                }`}
              >
                Decision Tree
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "matrix"
                    ? "bg-[#5B3DF5] text-white shadow-2xs"
                    : "text-[#667085] hover:text-[#111827]"
                }`}
              >
                ROI Matrix
              </button>
            </div>

            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-[#13B981] hover:bg-[#0F9F6E] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
            </button>

            <button
              type="button"
              onClick={handleRegenerateGraph}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#5B3DF5] bg-white hover:bg-[#F1EDFF] border border-[#5B3DF5]/30 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              Re-generate Nodes
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#FAFBFF]/50">
          {/* TAB 1: VISUAL NODE GRAPH */}
          {activeTab === "graph" && (
            <div className="space-y-6">
              {/* Top Workflow Summary Bar */}
              <div className="p-4 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Active Case</span>
                    <span className="font-extrabold text-[#111827] block text-sm">
                      {customerName} • ₹{amountRupees.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Root Cause</span>
                    <span className="font-mono font-bold text-[#5B3DF5] block">{rootCause}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Workflow</span>
                    <span className="font-bold text-[#111827] block capitalize">
                      {caseType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#667085]">Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30 block">
                      <CheckCircle2 className="w-3 h-3" /> {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* NODE GRAPH CANVAS */}
              <div className="relative p-6 rounded-2xl bg-white border border-[#E7EAF0] shadow-sm overflow-x-auto">
                <div className="min-w-[850px] space-y-8">
                  {/* LAYER 1: TRIGGER & CONTEXT NODES */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Node 1: Ingestion Event */}
                    <div className="relative p-4 rounded-xl bg-[#FAFBFF] border-2 border-[#5B3DF5] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white bg-[#5B3DF5] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Node 01 • Trigger Event
                        </span>
                        <Zap className="w-4 h-4 text-[#5B3DF5]" />
                      </div>
                      <h4 className="text-xs font-black text-[#111827]">
                        Revenue Risk Ingested
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-1">
                        Event: <span className="font-mono font-bold text-[#111827]">payment.failed</span>
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#E7EAF0] text-[10px] font-semibold text-[#667085] flex items-center justify-between">
                        <span>Amount: ₹{amountRupees.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                          <img src="/razorpay.png" alt="Razorpay" className="h-3.5 object-contain" /> Razorpay
                        </span>
                      </div>
                    </div>

                    {/* Node 2: Customer 360 Context */}
                    <div className="relative p-4 rounded-xl bg-[#FAFBFF] border-2 border-[#2F6BFF] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white bg-[#2F6BFF] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Node 02 • Customer 360
                        </span>
                        <Building2 className="w-4 h-4 text-[#2F6BFF]" />
                      </div>
                      <h4 className="text-xs font-black text-[#111827]">
                        Context Aggregated
                      </h4>
                      <p className="text-[11px] text-[#667085] mt-1">
                        Customer: <span className="font-bold text-[#111827]">{customerName}</span>
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#E7EAF0] text-[10px] font-semibold text-[#667085]">
                        LTV: ₹34,986 • Prior Successes: 14 • Contact Consent: YES
                      </div>
                    </div>
                  </div>

                  {/* CONNECTING ARROWS */}
                  <div className="flex justify-center items-center my-2 text-[#5B3DF5]">
                    <div className="h-6 w-0.5 bg-[#5B3DF5]/40" />
                  </div>

                  {/* LAYER 2: AI DIAGNOSIS & POLICY GUARDRAIL NODES */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Node 3: AI Diagnosis */}
                    <div className="relative p-4 rounded-xl bg-[#F1EDFF] border-2 border-[#5B3DF5] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white bg-[#5B3DF5] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Node 03 • Gemini AI Agent
                        </span>
                        <Sparkles className="w-4 h-4 text-[#5B3DF5]" />
                      </div>
                      <h4 className="text-xs font-black text-[#111827]">
                        AI Cause &amp; Intent Diagnosis
                      </h4>
                      <p className="text-[11px] text-[#5B3DF5] font-semibold mt-1">
                        Root Cause: {rootCause} (Confidence: 88%)
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#5B3DF5]/20 text-[10px] font-semibold text-[#667085] flex items-center gap-1.5">
                        <span>Rec Action:</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#111827]">
                          <img src="/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                          PAYMENT_LINK / VOICE
                        </span>
                      </div>
                    </div>

                    {/* Node 4: Merchant Policy Guardrail */}
                    <div className="relative p-4 rounded-xl bg-[#EAFBF4] border-2 border-[#13B981] shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white bg-[#13B981] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Node 04 • Policy Guardrail
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#13B981]" />
                      </div>
                      <h4 className="text-xs font-black text-[#111827]">
                        Merchant Policy Evaluation
                      </h4>
                      <p className="text-[11px] text-[#13B981] font-bold mt-1">
                        Result: ALLOW / APPROVED (100% Guardrail Protected)
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#13B981]/20 text-[10px] font-semibold text-[#667085]">
                        Max Retries: 4 • Cooldown: 6 hrs • Quiet Hours: Passed
                      </div>
                    </div>
                  </div>

                  {/* CONNECTING ARROWS */}
                  <div className="flex justify-center items-center my-2 text-[#5B3DF5]">
                    <div className="h-6 w-0.5 bg-[#5B3DF5]/40" />
                  </div>

                  {/* LAYER 3: MULTI-BRANCH EXECUTION STRATEGY NODES */}
                  <div className="border border-dashed border-[#5B3DF5]/40 rounded-xl p-4 bg-[#FAFBFF]">
                    <span className="text-[11px] font-black text-[#5B3DF5] uppercase tracking-wider block mb-3">
                      Branch Decision Matrix (Primary &amp; Fallback Paths)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Branch A */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#13B981] shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#13B981] bg-[#EAFBF4] px-2 py-0.5 rounded-full border border-[#13B981]/30 flex items-center gap-1">
                            <img src="/whatsapp.png" alt="WhatsApp" className="w-3 h-3 object-contain" /> Primary Branch A (Active)
                          </span>
                          <CreditCard className="w-3.5 h-3.5 text-[#13B981]" />
                        </div>
                        <h5 className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5">
                          <img src="/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                          Instant Payment Link Recovery
                        </h5>
                        <p className="text-[10px] text-[#667085] mt-0.5">
                          Generated secure link via WhatsApp &amp; Hosted Checkout Portal.
                        </p>
                        <div className="mt-2 text-[10px] font-bold text-[#13B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Status: Verified &amp; Recovered (₹{amountRupees.toLocaleString()})
                        </div>
                      </div>

                      {/* Fallback Branch B */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs opacity-75">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#5B3DF5] bg-[#F1EDFF] px-2 py-0.5 rounded-full border border-[#5B3DF5]/30 flex items-center gap-1">
                            <img src="/phone.png" alt="Voice" className="w-3 h-3 object-contain" /> Fallback Branch B (Standby)
                          </span>
                          <PhoneCall className="w-3.5 h-3.5 text-[#5B3DF5]" />
                        </div>
                        <h5 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                          <img src="/phone.png" alt="Voice" className="w-4 h-4 object-contain shrink-0" />
                          Hinglish Voice Recovery Call
                        </h5>
                        <p className="text-[10px] text-[#667085] mt-0.5">
                          Empathetic AI Voice call + Intent Detection (TRY_LATER → Promise).
                        </p>
                        <div className="mt-2 text-[10px] font-semibold text-[#667085] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#5B3DF5]" /> Scheduled if primary unfulfilled in 24h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LAYER 4: FINAL OUTCOME NODE */}
                  <div className="p-4 rounded-xl bg-[#EAFBF4] border-2 border-[#13B981] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#13B981] text-white flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#13B981]">
                          Terminal Node • Verified Outcome
                        </span>
                        <h4 className="text-sm font-black text-[#111827]">
                          Closed-Loop Recovery Complete
                        </h4>
                        <p className="text-xs text-[#667085]">
                          Financial settlement verified via gateway webhook &amp; audit ledger updated.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#13B981]">
                        ₹{amountRupees.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-[#13B981] block">
                        ✓ 100% Money Recovered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DECISION TREE VIEW */}
          {activeTab === "tree" && (
            <div className="p-6 rounded-2xl bg-white border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#111827]">
                Hierarchical Recovery Decision Tree Structure
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0]">
                  <span className="font-bold text-[#5B3DF5]">ROOT [Payment Failure Detected]</span>
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-[#5B3DF5]">
                    <div className="flex items-start gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#5B3DF5] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#111827]">├── Risk Level Evaluation</span>
                        <p className="text-[11px] text-[#667085] font-sans">
                          Condition: RiskScore = 85 (MEDIUM/HIGH) → Proceed to Policy Check
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pl-4 border-l-2 border-[#2F6BFF]">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#2F6BFF] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#111827]">├── Merchant Policy Guardrail</span>
                        <p className="text-[11px] text-[#667085] font-sans">
                          Condition: RetryCount &lt; 4 &amp; ContactPermission = True → APPROVED
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pl-8 border-l-2 border-[#13B981]">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#13B981] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#13B981]">└── Interventions Dispatched</span>
                        <p className="text-[11px] text-[#667085] font-sans">
                          Action: Instant Payment Link + Hinglish Voice Fallback → RECOVERED
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROI MATRIX */}
          {activeTab === "matrix" && (
            <div className="p-6 rounded-2xl bg-white border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#111827]">
                Action Candidate ROI &amp; Expected Net Value Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E7EAF0] bg-[#FAFBFF] text-[#667085]">
                      <th className="py-2.5 px-3">Candidate Action</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Exp. Recovery</th>
                      <th className="py-2.5 px-3">Est. Cost</th>
                      <th className="py-2.5 px-3">Net Value</th>
                      <th className="py-2.5 px-3">ROI Ratio</th>
                      <th className="py-2.5 px-3 text-right">Selection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EAF0]">
                    <tr className="bg-[#EAFBF4]/50 font-bold">
                      <td className="py-3 px-3 text-[#111827]">Instant Payment Link</td>
                      <td className="py-3 px-3 uppercase text-[#5B3DF5]">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <img src="/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                          whatsapp
                        </span>
                      </td>
                      <td className="py-3 px-3">₹{amountRupees.toLocaleString()}</td>
                      <td className="py-3 px-3">₹15</td>
                      <td className="py-3 px-3 text-[#13B981]">₹{(amountRupees - 15).toLocaleString()}</td>
                      <td className="py-3 px-3">166.0x</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#13B981] text-white text-[10px]">SELECTED</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#111827]">Hinglish Voice Recovery</td>
                      <td className="py-3 px-3 uppercase text-[#5B3DF5]">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <img src="/phone.png" alt="Phone" className="w-3.5 h-3.5 object-contain" />
                          voice
                        </span>
                      </td>
                      <td className="py-3 px-3">₹{amountRupees.toLocaleString()}</td>
                      <td className="py-3 px-3">₹45</td>
                      <td className="py-3 px-3 text-[#111827]">₹{(amountRupees - 45).toLocaleString()}</td>
                      <td className="py-3 px-3">55.0x</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-[10px]">STANDBY</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-[#111827]">Human Specialist Escalation</td>
                      <td className="py-3 px-3 uppercase text-[#5B3DF5]">manual</td>
                      <td className="py-3 px-3">₹{amountRupees.toLocaleString()}</td>
                      <td className="py-3 px-3">₹250</td>
                      <td className="py-3 px-3 text-[#111827]">₹{(amountRupees - 250).toLocaleString()}</td>
                      <td className="py-3 px-3">10.0x</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAFBFF] text-[#667085] text-[10px]">FALLBACK</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E7EAF0] flex items-center justify-between">
          <span className="text-xs text-[#667085]">
            RecoveroAI Autonomous Decision Graph • 100% Auditable Execution
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-xl transition-all shadow-xs"
          >
            Close Graph Window
          </button>
        </div>
      </div>
    </div>
  );
}
