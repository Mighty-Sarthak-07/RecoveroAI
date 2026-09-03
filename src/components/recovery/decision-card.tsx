import React from "react";
import { Sparkles, ArrowRight, Check, AlertCircle } from "lucide-react";
import { CandidateAction } from "@/src/types/recovery";

interface DecisionCardProps {
  diagnosis?: string;
  selectedAction?: string;
  confidence?: string | number;
  candidateActions?: CandidateAction[];
  expectedRecovery?: number;
  estimatedCost?: number;
  expectedNetValue?: number;
  expectedRoi?: string | number;
  requiresHumanApproval?: boolean;
}

export function DecisionCard({
  diagnosis = "temporary_payment_failure",
  selectedAction = "DELAYED_RETRY",
  confidence = 0.91,
  candidateActions = [],
  expectedRecovery = 0,
  estimatedCost = 0,
  expectedNetValue = 0,
  expectedRoi = "999.00",
  requiresHumanApproval = false,
}: DecisionCardProps) {
  const formatINR = (cents: number) => `₹${(cents / 100).toLocaleString()}`;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E7EAF0] mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">AI Recovery Recommendation</h3>
            <p className="text-xs text-[#667085]">
              Diagnosis: <span className="font-semibold text-[#5B3DF5]">{diagnosis.replace(/_/g, " ")}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#2F6BFF] border border-[#2F6BFF]/20">
            {(Number(confidence) * 100).toFixed(0)}% Confidence
          </span>
          {requiresHumanApproval && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF6E8] text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Human Review Flagged
            </span>
          )}
        </div>
      </div>

      {/* Selected Action Highlight */}
      <div className="p-4 rounded-xl bg-[#F1EDFF]/50 border border-[#5B3DF5]/30 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
            Selected Intervention
          </span>
          <span className="text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2 py-0.5 rounded-full border border-[#13B981]/25">
            Optimal Net ROI
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-[#111827]">
            {selectedAction.replace(/_/g, " ")}
          </span>
          <span className="text-sm font-semibold text-[#5B3DF5]">
            ROI: {typeof expectedRoi === "number" ? expectedRoi : Number(expectedRoi).toFixed(0)}x
          </span>
        </div>

        {/* Economics summary */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#5B3DF5]/20 text-xs">
          <div>
            <span className="text-[#667085] block">Expected Recovery</span>
            <span className="font-bold text-[#111827] mt-0.5 block">{formatINR(expectedRecovery)}</span>
          </div>
          <div>
            <span className="text-[#667085] block">Action Cost</span>
            <span className="font-bold text-[#667085] mt-0.5 block">{formatINR(estimatedCost)}</span>
          </div>
          <div>
            <span className="text-[#667085] block">Expected Net Value</span>
            <span className="font-bold text-[#13B981] mt-0.5 block">{formatINR(expectedNetValue)}</span>
          </div>
        </div>
      </div>

      {/* Candidate Actions List */}
      <div>
        <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-2.5">
          Evaluated Candidates ({candidateActions.length})
        </h4>
        <div className="space-y-2">
          {candidateActions.map((cand, idx) => {
            const isSelected = cand.action === selectedAction;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-white border-[#5B3DF5] shadow-xs"
                    : "bg-[#FAFBFF] border-[#E7EAF0] opacity-80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-[#5B3DF5] text-white" : "bg-[#E7EAF0] text-[#667085]"
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-[#111827] block">
                      {cand.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-[#667085]">
                      Channel: {cand.channel} • Cost: {formatINR(cand.estimatedCost)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#111827] block">
                    {formatINR(cand.expectedNetValue)}
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    ROI: {cand.expectedRoi >= 999 ? "∞" : `${cand.expectedRoi}x`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
