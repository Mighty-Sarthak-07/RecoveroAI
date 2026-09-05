"use client";

import React, { useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  RefreshCw,
  Clock,
  UserCheck,
  DollarSign,
  FileText,
  Ban,
  Sliders,
  Check,
} from "lucide-react";
import { validatePolicy } from "@/src/lib/policy/policy-engine";
import { MerchantPolicy } from "@/src/types/recovery";

const DEFAULT_MERCHANT_POLICY: MerchantPolicy = {
  maxRetries: 4,
  highValueThreshold: 10000000, // ₹100,000 in cents
  cooldownHours: 6,
  requireConsentForContact: true,
  costCeilingRatio: 0.15,
  voiceAllowedHoursStart: 10,
  voiceAllowedHoursEnd: 19,
  maxInvoiceReminders: 3,
  b2bHighValueThreshold: 5000000,
};

export default function GuardrailsPage() {
  // Simulator state
  const [action, setAction] = useState<string>("INSTANT_PAYMENT_LINK");
  const [channel, setChannel] = useState<string>("whatsapp");
  const [amountRupees, setAmountRupees] = useState<number>(2499);
  const [retryCount, setRetryCount] = useState<number>(1);
  const [contactPermission, setContactPermission] = useState<boolean>(true);
  const [customerDeclined, setCustomerDeclined] = useState<boolean>(false);
  const [proposedDiscountPct, setProposedDiscountPct] = useState<number>(0);
  const [riskScore, setRiskScore] = useState<number>(45);
  const [messageText, setMessageText] = useState<string>(
    "Namaste Rahul, aapka payment link active hai. Please renew your plan."
  );

  function runGuardrailCheck() {
    return validatePolicy({
      action,
      channel,
      amount: amountRupees * 100,
      retryCount,
      paymentStatus: "failed",
      contactPermission,
      caseId: "demo_case_guardrail",
      customerId: "cust_demo_101",
      merchantPolicy: DEFAULT_MERCHANT_POLICY,
      customerDeclined,
      proposedDiscountPct,
      messageText,
      riskScore,
      executedActionsHistory: [],
    });
  }

  // Active evaluation result
  const [evalResult, setEvalResult] = useState<any>(() => runGuardrailCheck());

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = runGuardrailCheck();
    setEvalResult(result);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Deterministic Policy Guardrail Engine"
        subtitle="10 strict business & compliance guardrails evaluated natively in TypeScript prior to execution"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981] border border-[#13B981]/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 10/10 TypeScript Guardrails Active
          </span>
        }
      />

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Guardrail Evaluations
          </span>
          <span className="text-2xl font-bold text-[#111827] mt-1 block">1,482 Checks</span>
          <span className="text-xs text-[#5B3DF5] mt-1 font-medium block">100% Deterministic TypeScript</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Policy Approved Rate
          </span>
          <span className="text-2xl font-bold text-[#13B981] mt-1 block">92.4%</span>
          <span className="text-xs text-[#13B981] mt-1 font-medium block">✓ 1,370 Actions Dispatched</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Human Escalation Flags
          </span>
          <span className="text-2xl font-bold text-[#F59E0B] mt-1 block">5.2%</span>
          <span className="text-xs text-[#F59E0B] mt-1 font-medium block">77 High-Value / Risk Escalations</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Kill-Switch Blocks
          </span>
          <span className="text-2xl font-bold text-[#E5484D] mt-1 block">2.4%</span>
          <span className="text-xs text-[#E5484D] mt-1 font-medium block">35 Harassment / Opt-Out Blocks</span>
        </div>
      </div>

      {/* 2-Column Main Section: Simulator Form vs Live 10 Guardrail Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive TypeScript Simulator Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E7EAF0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7EAF0]">
            <Sliders className="w-4 h-4 text-[#5B3DF5]" />
            <h3 className="text-sm font-bold text-[#111827]">
              TypeScript Guardrail Test Playground
            </h3>
          </div>

          <form onSubmit={handleSimulate} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-[#111827] block mb-1">Recommended Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
              >
                <option value="INSTANT_PAYMENT_LINK">INSTANT_PAYMENT_LINK</option>
                <option value="HINGLISH_VOICE_CALL">HINGLISH_VOICE_CALL</option>
                <option value="IMMEDIATE_RETRY">IMMEDIATE_RETRY</option>
                <option value="INVOICE_REMINDER">INVOICE_REMINDER</option>
                <option value="ESCALATE_TO_HUMAN">ESCALATE_TO_HUMAN</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="voice">Voice Call</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="gateway">Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Retry Count</label>
                <input
                  type="number"
                  value={retryCount}
                  onChange={(e) => setRetryCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Risk Score (0 - 100)</label>
                <input
                  type="number"
                  value={riskScore}
                  onChange={(e) => setRiskScore(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactPermission}
                  onChange={(e) => setContactPermission(e.target.checked)}
                  className="rounded text-[#5B3DF5]"
                />
                <span className="font-bold text-[#111827]">Contact Consent</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={customerDeclined}
                  onChange={(e) => setCustomerDeclined(e.target.checked)}
                  className="rounded text-[#E5484D]"
                />
                <span className="font-bold text-[#E5484D]">Explicit Decline</span>
              </label>
            </div>

            <div>
              <label className="font-bold text-[#111827] block mb-1">Proposed AI Discount (%)</label>
              <input
                type="number"
                value={proposedDiscountPct}
                onChange={(e) => setProposedDiscountPct(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-semibold focus:outline-none focus:border-[#5B3DF5]"
              />
            </div>

            <div>
              <label className="font-bold text-[#111827] block mb-1">Message Text Wording</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] font-medium focus:outline-none focus:border-[#5B3DF5]"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Evaluate 10 TypeScript Guardrails
            </button>
          </form>
        </div>

        {/* Right Column: Live 10 TypeScript Guardrails Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E7EAF0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <span className="text-[10px] font-black text-[#5B3DF5] uppercase tracking-wider block">
                Live Guardrail Evaluation Result
              </span>
              <h3 className="text-base font-extrabold text-[#111827] mt-0.5">
                10 Mandatory TypeScript Compliance Rules
              </h3>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black border ${
                evalResult.decision === "ALLOW"
                  ? "bg-[#EAFBF4] text-[#13B981] border-[#13B981]/30"
                  : evalResult.decision === "ESCALATE"
                  ? "bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/30"
                  : "bg-[#FEECEC] text-[#E5484D] border-[#E5484D]/30"
              }`}
            >
              {evalResult.decision === "ALLOW"
                ? "✓ ALLOWED TO EXECUTE"
                : evalResult.decision === "ESCALATE"
                ? "⚠️ ESCALATED TO HUMAN"
                : "⛔ ACTION BLOCKED"}
            </span>
          </div>

          {/* Checks List */}
          <div className="space-y-2.5">
            {evalResult.checks.map((check: any, idx: number) => {
              const isAllow = check.status === "ALLOW";
              const isEscalate = check.status === "ESCALATE";
              const isBlock = check.status === "BLOCK";

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 text-xs transition-all ${
                    isBlock
                      ? "bg-[#FEECEC]/60 border-[#E5484D]/30"
                      : isEscalate
                      ? "bg-[#FFF6E8]/60 border-[#F59E0B]/30"
                      : "bg-[#FAFBFF] border-[#E7EAF0]"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isAllow && <CheckCircle2 className="w-4 h-4 text-[#13B981]" />}
                    {isEscalate && <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
                    {isBlock && <ShieldAlert className="w-4 h-4 text-[#E5484D]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#111827]">
                        {check.rule.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-black px-2 py-0.5 rounded ${
                          isAllow
                            ? "bg-[#EAFBF4] text-[#13B981]"
                            : isEscalate
                            ? "bg-[#FFF6E8] text-[#F59E0B]"
                            : "bg-[#FEECEC] text-[#E5484D]"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] mt-0.5 leading-normal">
                      {check.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
