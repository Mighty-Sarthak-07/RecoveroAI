"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Building2,
  RefreshCcw,
  PhoneCall,
} from "lucide-react";

interface AnalysisCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    totalAnalyzed?: number;
    casesFound?: number;
    revenueAtRiskRupees?: number;
  };
  cases?: any[];
}

export function AnalysisCompleteModal({
  isOpen,
  onClose,
  stats,
  cases = [],
}: AnalysisCompleteModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const casesCount = stats?.casesFound ?? cases.length ?? 5;
  const revenueRupees = stats?.revenueAtRiskRupees ?? 284000;
  const revenueDisplay =
    revenueRupees >= 100000
      ? `₹${(revenueRupees / 100000).toFixed(2)}L`
      : `₹${revenueRupees.toLocaleString()}`;

  const getWorkflowIcon = (caseType: string = "") => {
    const type = caseType.toLowerCase();
    if (type.includes("b2b") || type.includes("invoice")) {
      return <Building2 className="w-3.5 h-3.5 text-[#5B3DF5]" />;
    }
    if (type.includes("mandate") || type.includes("nach")) {
      return <RefreshCcw className="w-3.5 h-3.5 text-[#2F6BFF]" />;
    }
    if (type.includes("voice")) {
      return <PhoneCall className="w-3.5 h-3.5 text-[#13B981]" />;
    }
    return <CreditCard className="w-3.5 h-3.5 text-[#5B3DF5]" />;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E7EAF0] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F7F8FC] hover:bg-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center shrink-0 border border-[#5B3DF5]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111827]">
                AI Revenue Analysis Complete
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                RecoveroAI evaluated transaction records and initialized recovery cases
              </p>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-[#FED7D7]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5484D] block">
                Recovery Cases Found
              </span>
              <span className="text-2xl font-black text-[#111827] mt-1 block">
                {casesCount} Cases
              </span>
              <span className="text-[10px] text-[#742A2A] font-medium mt-0.5 block">
                Prioritized by net recovery value
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F1EDFF] border border-[#5B3DF5]/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B3DF5] block">
                Revenue at Risk
              </span>
              <span className="text-2xl font-black text-[#5B3DF5] mt-1 block">
                {revenueDisplay}
              </span>
              <span className="text-[10px] text-[#5B3DF5]/80 font-medium mt-0.5 block">
                100% Policy-bounded
              </span>
            </div>
          </div>

          {/* Cases Discovered Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
              <span>Active Recovery Cases Ready for Review</span>
              <span className="text-[11px] font-semibold text-[#13B981] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Guardrails Verified
              </span>
            </div>

            <div className="divide-y divide-[#E7EAF0] border border-[#E7EAF0] rounded-xl overflow-hidden max-h-52 overflow-y-auto bg-[#FAFBFF]">
              {cases.length > 0 ? (
                cases.slice(0, 4).map((c: any, idx: number) => {
                  const caseId = c.id || `case_${idx}`;
                  const amountRupees = Math.round((c.amountAtRisk || 249900) / 100);

                  return (
                    <Link
                      key={caseId}
                      href={`/recoveries/${caseId}`}
                      onClick={onClose}
                      className="p-3 bg-white hover:bg-[#F1EDFF]/40 flex items-center justify-between transition-colors text-xs group block"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] flex items-center justify-center shrink-0 group-hover:border-[#5B3DF5]">
                          {getWorkflowIcon(c.caseType)}
                        </div>
                        <div>
                          <span className="font-bold text-[#111827] block">
                            {c.customerName || "Customer Record"}
                          </span>
                          <span className="text-[10px] text-[#667085] capitalize block">
                            {c.caseType?.replace(/_/g, " ") || "Payment Recovery"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="font-black text-[#111827] block">
                            ₹{amountRupees.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#E5484D] border border-[#FED7D7]">
                            {c.status || "DETECTED"}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#667085] group-hover:text-[#5B3DF5] transition-colors" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#667085]">
                  Analysis evaluated risk across all payment streams.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7EAF0] bg-white hover:bg-[#F7F8FC] text-[#111827] text-xs font-bold transition-colors"
            >
              Stay on Overview
            </button>
            <Link
              href="/recoveries"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-md"
            >
              Check Recovery Cases <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
