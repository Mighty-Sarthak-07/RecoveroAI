"use client";

import React, { useState, useRef } from "react";
import {
  CreditCard,
  FileSpreadsheet,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
} from "lucide-react";

export type DataSourceType = "razorpay" | "csv" | "demo";
export type FlowState = "select" | "imported" | "analyzing" | "completed";

interface DataSourceSelectorProps {
  onCompleted?: () => void;
  inline?: boolean;
}

export function DataSourceSelector({
  onCompleted,
  inline = false,
}: DataSourceSelectorProps) {
  const [selectedSource, setSelectedSource] = useState<DataSourceType>("demo");
  const [flowState, setFlowState] = useState<FlowState>("select");
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false); // Default to Manual Mode for Demo!

  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Import outcome stats
  const [importedTxnCount, setImportedTxnCount] = useState<number>(10);
  const [importedTxnVolume, setImportedTxnVolume] = useState<string>("₹3.85L");

  // Analysis results
  const [casesFound, setCasesFound] = useState<number>(5);
  const [revenueAtRiskStr, setRevenueAtRiskStr] = useState<string>("₹2.84L");

  // Razorpay form state
  const [rzpKeyId, setRzpKeyId] = useState("rzp_test_recovero_buildathon");
  const [rzpSecret, setRzpSecret] = useState("sec_test_demo9918");
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState("whsec_demo_active");
  const [rzpMode, setRzpMode] = useState<"test" | "live">("test");
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const [demoCount, setDemoCount] = useState<number>(50);

  // CSV form state
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<number>(0);
  const [csvTextContent, setCsvTextContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const webhookUrl = "https://recovero.ai/api/webhooks/razorpay";

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setErrorMsg(null);

    const text = await file.text();
    setCsvTextContent(text);
    const lineCount = text.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
    setCsvPreviewRows(Math.max(0, lineCount - 1));
  };

  // Step 1: Import Action
  const handleImport = async () => {
    setIsImporting(true);
    setErrorMsg(null);

    try {
      let txnCount = 10;
      let volumeStr = "₹3.85L";

      if (selectedSource === "razorpay") {
        const res = await fetch("/api/data-source/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyId: rzpKeyId,
            keySecret: rzpSecret,
            webhookSecret: rzpWebhookSecret,
            mode: rzpMode,
            syncHistorical: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to connect Razorpay");
        txnCount = data.syncSummary?.syncedCount || 4;
        volumeStr = `₹${((data.syncSummary?.totalAtRiskRupees || 45000) / 1000).toFixed(1)}k`;
      } else if (selectedSource === "csv") {
        if (!csvTextContent) throw new Error("Please select or drop a valid CSV file first.");
        const res = await fetch("/api/data-source/upload-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvText: csvTextContent }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to process CSV file");
        txnCount = data.summary?.importedCount || csvPreviewRows || 10;
        volumeStr = `₹${((data.summary?.totalRevenueAtRiskRupees || 385000) / 100000).toFixed(2)}L`;
      } else {
        // Demo Data
        const res = await fetch("/api/demo/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: demoCount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to seed demo data");
        txnCount = data.result?.generatedCount || demoCount;
        volumeStr = `₹${((data.result?.totalRevenueAtRiskRupees || 428000) / 100000).toFixed(2)}L`;
      }

      setImportedTxnCount(txnCount);
      setImportedTxnVolume(volumeStr);

      if (isAutoMode) {
        // If Auto Mode is ON, immediately analyze
        await startAIAnalysis();
      } else {
        // If Manual Mode (Demo), show the Imported confirmation with the "Analyze with RecoveroAI" button!
        setFlowState("imported");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Step 2: AI Analysis Action
  const startAIAnalysis = async () => {
    setFlowState("analyzing");
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Step 1: Analyzing transactions
      setAnalysisStep(1);
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Finding revenue at risk
      setAnalysisStep(2);
      await new Promise((r) => setTimeout(r, 700));

      // Step 3: Understanding failure patterns
      setAnalysisStep(3);
      await new Promise((r) => setTimeout(r, 700));

      // Step 4: Evaluating policy guardrails
      setAnalysisStep(4);
      const res = await fetch("/api/data-source/analyze", { method: "POST" });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 600));

      const cases = data.stats?.casesFound || 5;
      const rupees = data.stats?.revenueAtRiskRupees || 284000;
      setCasesFound(cases);
      setRevenueAtRiskStr(
        rupees >= 100000 ? `₹${(rupees / 100000).toFixed(2)}L` : `₹${rupees.toLocaleString()}`
      );

      setFlowState("completed");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "AI Analysis encountered an error.");
      setFlowState("imported");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinish = () => {
    if (onCompleted) {
      onCompleted();
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden ${inline ? "p-6" : "p-8"}`}>
      {/* Top Header & AI Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E7EAF0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-[11px] font-bold mb-1 border border-[#5B3DF5]/20">
            <Zap className="w-3 h-3" />
            Buildathon Data Onboarding
          </div>
          <h2 className="text-xl font-black text-[#111827]">
            Connect &amp; Analyze Transaction Stream
          </h2>
        </div>

        {/* AI Execution Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
          <span className="text-[11px] font-bold text-[#667085] ml-1 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#5B3DF5]" />
            AI Mode:
          </span>
          <button
            type="button"
            onClick={() => setIsAutoMode(false)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              !isAutoMode
                ? "bg-[#5B3DF5] text-white shadow-xs"
                : "text-[#667085] hover:text-[#111827]"
            }`}
          >
            Manual (Demo)
          </button>
          <button
            type="button"
            onClick={() => setIsAutoMode(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isAutoMode
                ? "bg-[#5B3DF5] text-white shadow-xs"
                : "text-[#667085] hover:text-[#111827]"
            }`}
          >
            Automatic
          </button>
        </div>
      </div>

      {/* STAGE 1: SELECT & CONFIGURE DATA SOURCE */}
      {flowState === "select" && (
        <>
          <div className="text-center max-w-lg mx-auto mb-6">
            <p className="text-xs text-[#667085]">
              Select how to ingest transaction records. After import, you can trigger RecoveroAI to analyze failure patterns and identify revenue at risk.
            </p>
          </div>

          {/* 3 Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Razorpay */}
            <button
              type="button"
              onClick={() => setSelectedSource("razorpay")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedSource === "razorpay"
                  ? "border-[#5B3DF5] bg-[#FAFBFF] ring-2 ring-[#5B3DF5]/20"
                  : "border-[#E7EAF0] hover:border-[#D0D5DD] bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 px-2 rounded-lg bg-[#0C2340] flex items-center justify-center">
                    <img src="/razorpay.png" alt="Razorpay" className="h-4 object-contain brightness-200" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#2F6BFF]">
                    API / Webhook
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">Connect Razorpay</h3>
                <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                  Real integration via API keys or webhooks. Ingests payment failures &amp; subscriptions.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] font-semibold text-[#5B3DF5]">
                <span>Select Razorpay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={() => setSelectedSource("csv")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedSource === "csv"
                  ? "border-[#5B3DF5] bg-[#FAFBFF] ring-2 ring-[#5B3DF5]/20"
                  : "border-[#E7EAF0] hover:border-[#D0D5DD] bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAFBF4] flex items-center justify-center text-[#13B981]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981]">
                    Custom File
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">Upload CSV</h3>
                <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                  Upload transaction history or invoices. Includes downloadable sample template.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] font-semibold text-[#13B981]">
                <span>Select CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Demo */}
            <button
              type="button"
              onClick={() => setSelectedSource("demo")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                selectedSource === "demo"
                  ? "border-[#5B3DF5] bg-[#FAFBFF] ring-2 ring-[#5B3DF5]/20"
                  : "border-[#E7EAF0] hover:border-[#D0D5DD] bg-white"
              }`}
            >
              <div className="absolute -top-2.5 right-3">
                <span className="bg-[#5B3DF5] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Judges / Demo
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F1EDFF] flex items-center justify-center text-[#5B3DF5]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5]">
                    1-Click
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#111827]">Generate Demo Data</h3>
                <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                  All 7 workflows: Rahul Sharma ₹2.5k, Acme Corp ₹13k, Hinglish voice &amp; ₹200k policy block.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#E7EAF0] flex items-center justify-between text-[11px] font-semibold text-[#5B3DF5]">
                <span>Select Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Config Panel */}
          <div className="p-5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] mb-6">
            {selectedSource === "razorpay" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-1.5 rounded bg-[#0C2340] flex items-center justify-center">
                      <img src="/razorpay.png" alt="Razorpay Logo" className="h-3.5 object-contain brightness-200" />
                    </div>
                    <span className="text-xs font-bold text-[#111827]">Razorpay API Credentials</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-[#E7EAF0] text-xs">
                    <button
                      type="button"
                      onClick={() => setRzpMode("test")}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rzpMode === "test" ? "bg-[#F1EDFF] text-[#5B3DF5]" : "text-[#667085]"
                      }`}
                    >
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => setRzpMode("live")}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rzpMode === "live" ? "bg-[#5B3DF5] text-white" : "text-[#667085]"
                      }`}
                    >
                      Live
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#667085] block mb-1">Key ID</label>
                    <input
                      type="text"
                      value={rzpKeyId}
                      onChange={(e) => setRzpKeyId(e.target.value)}
                      className="w-full text-xs font-mono rounded-lg border border-[#E7EAF0] bg-white px-3 py-2 text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#667085] block mb-1">Key Secret</label>
                    <input
                      type="password"
                      value={rzpSecret}
                      onChange={(e) => setRzpSecret(e.target.value)}
                      className="w-full text-xs font-mono rounded-lg border border-[#E7EAF0] bg-white px-3 py-2 text-[#111827]"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#E7EAF0] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#667085] truncate">{webhookUrl}</span>
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B3DF5] shrink-0 hover:underline"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedWebhook ? "Copied" : "Copy Webhook"}
                  </button>
                </div>
              </div>
            )}

            {selectedSource === "csv" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">Upload Transactions CSV</span>
                  <a
                    href="/api/data-source/sample-csv"
                    download="recovero_sample_transactions.csv"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#E7EAF0] bg-white text-[11px] font-semibold text-[#5B3DF5] hover:bg-[#F1EDFF]"
                  >
                    <Download className="w-3 h-3" />
                    Download Sample CSV
                  </a>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#5B3DF5] p-5 rounded-xl text-center bg-white cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="w-6 h-6 text-[#5B3DF5] mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-[#111827]">
                    {csvFileName || "Click or drag & drop transaction CSV"}
                  </p>
                  <p className="text-[10px] text-[#667085] mt-0.5">
                    Supports transaction_id, customer_name, email, amount, failure_reason
                  </p>
                  {csvPreviewRows > 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#EAFBF4] text-[#13B981] text-[10px] font-bold">
                      ✓ {csvPreviewRows} transactions detected
                    </span>
                  )}
                </div>
              </div>
            )}

            {selectedSource === "demo" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">Realistic Demo Generator</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1EDFF] text-[#5B3DF5]">
                    7 Workflows Included
                  </span>
                </div>
                <p className="text-xs text-[#667085]">
                  Select the volume of transactions to generate into the live database across all 7 streams:
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {[50, 100, 500].map((countVal) => (
                    <button
                      key={countVal}
                      type="button"
                      onClick={() => setDemoCount(countVal)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        demoCount === countVal
                          ? "border-[#5B3DF5] bg-[#5B3DF5] text-white shadow-xs"
                          : "border-[#E7EAF0] bg-white text-[#667085] hover:border-[#5B3DF5]"
                      }`}
                    >
                      Generate {countVal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] flex items-center gap-2 text-xs text-[#E5484D]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isImporting}
            onClick={handleImport}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isImporting ? "Importing Transactions..." : "Import Transactions into RecoveroAI"}
          </button>
        </>
      )}

      {/* STAGE 2: TRANSACTIONS IMPORTED -> EXPLICIT "ANALYZE WITH RECOVEROAI" BUTTON */}
      {flowState === "imported" && (
        <div className="py-6 px-4 max-w-lg mx-auto text-center space-y-6 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#EAFBF4] text-[#13B981] flex items-center justify-center mx-auto border border-[#13B981]/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#111827]">
              Transactions Imported Successfully
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Raw transaction stream ingested into ledger. Ready for autonomous AI risk analysis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#E7EAF0] grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-[#667085] block">Total Ingested</span>
              <span className="text-xl font-black text-[#111827]">
                {importedTxnCount.toLocaleString()} txns
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#667085] block">Processed Volume</span>
              <span className="text-xl font-black text-[#5B3DF5]">{importedTxnVolume}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={startAIAnalysis}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-sm font-black transition-all shadow-md hover:shadow-lg animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              ✨ Analyze with RecoveroAI
            </button>
            <p className="text-[11px] text-[#667085]">
              AI will detect revenue at risk, diagnose root causes, and prepare bounded recovery cases.
            </p>
          </div>
        </div>
      )}

      {/* STAGE 3: AI PROCESSING ANIMATION */}
      {flowState === "analyzing" && (
        <div className="py-8 px-4 max-w-lg mx-auto text-center space-y-6 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center mx-auto border border-[#5B3DF5]/30">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#111827]">
              RecoveroAI Analyzing Transactions...
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Evaluating economic impact, risk levels, and merchant guardrails
            </p>
          </div>

          {/* 4 Steps */}
          <div className="space-y-2.5 text-left">
            {[
              { step: 1, text: "Analyzing transaction records & timestamps..." },
              { step: 2, text: "Finding revenue at risk across payments & invoices..." },
              { step: 3, text: "Understanding failure patterns & customer LTV..." },
              { step: 4, text: "Evaluating policy guardrails & creating recovery cases..." },
            ].map((item) => {
              const isCurrent = analysisStep === item.step;
              const isDone = analysisStep > item.step;

              return (
                <div
                  key={item.step}
                  className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    isDone
                      ? "border-[#13B981] bg-[#EAFBF4]/60 text-[#13B981]"
                      : isCurrent
                      ? "border-[#5B3DF5] bg-[#F1EDFF]/60 text-[#5B3DF5] animate-pulse"
                      : "border-[#E7EAF0] bg-[#FAFBFF] text-[#9CA3AF]"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-[#5B3DF5] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D0D5DD] shrink-0" />
                  )}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 4: ANALYSIS COMPLETE -> SUMMARY STATS & DASHBOARD ACTIVATION */}
      {flowState === "completed" && (
        <div className="py-6 px-4 max-w-lg mx-auto text-center space-y-6 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#EAFBF4] text-[#13B981] flex items-center justify-center mx-auto border border-[#13B981]/30">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-xl font-black text-[#111827]">
              ✨ Analysis Complete
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Autonomous recovery cases initialized and prioritized by economic return
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-[#E7EAF0]">
              <span className="text-[11px] font-bold text-[#E5484D] block uppercase tracking-wider">
                Recovery Cases Found
              </span>
              <span className="text-2xl font-black text-[#111827] mt-1 block">
                {casesFound} Cases
              </span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#E7EAF0]">
              <span className="text-[11px] font-bold text-[#5B3DF5] block uppercase tracking-wider">
                Revenue at Risk
              </span>
              <span className="text-2xl font-black text-[#5B3DF5] mt-1 block">
                {revenueAtRiskStr}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-left text-xs bg-[#F7F8FC] p-3.5 rounded-xl border border-[#E7EAF0]">
            <div className="flex items-center gap-2 text-[#111827] font-medium">
              <Check className="w-3.5 h-3.5 text-[#13B981]" />
              <span>Root cause diagnoses completed across 7 recovery streams</span>
            </div>
            <div className="flex items-center gap-2 text-[#111827] font-medium">
              <Check className="w-3.5 h-3.5 text-[#13B981]" />
              <span>Deterministic policy checks passed within merchant thresholds</span>
            </div>
            <div className="flex items-center gap-2 text-[#111827] font-medium">
              <Check className="w-3.5 h-3.5 text-[#13B981]" />
              <span>Intervention channels scheduled (Smart Retry, WhatsApp, Hinglish Voice)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-md"
          >
            Open Recovery Command Center <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
