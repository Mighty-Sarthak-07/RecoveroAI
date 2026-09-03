import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";

interface PolicyCheckItem {
  id?: string;
  ruleName: string;
  result: "ALLOW" | "BLOCK" | "ESCALATE";
  reason: string;
  checkedAt?: string;
}

interface PolicyCheckListProps {
  checks: PolicyCheckItem[];
  isBlocked?: boolean;
}

export function PolicyCheckList({ checks, isBlocked = false }: PolicyCheckListProps) {
  const hasBlock = checks.some((c) => c.result === "BLOCK") || isBlocked;
  const hasEscalate = checks.some((c) => c.result === "ESCALATE");

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E7EAF0] mb-5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              hasBlock
                ? "bg-[#FEECEC] text-[#E5484D]"
                : hasEscalate
                ? "bg-[#FFF6E8] text-[#F59E0B]"
                : "bg-[#EAFBF4] text-[#13B981]"
            }`}
          >
            {hasBlock ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Deterministic Policy Validation</h3>
            <p className="text-xs text-[#667085]">
              Strict merchant guardrails enforced prior to execution authorization
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            hasBlock
              ? "bg-[#FEECEC] text-[#E5484D] border-[#E5484D]/30"
              : hasEscalate
              ? "bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/30"
              : "bg-[#EAFBF4] text-[#13B981] border-[#13B981]/30"
          }`}
        >
          {hasBlock ? "ACTION BLOCKED" : hasEscalate ? "ESCALATED TO HUMAN" : "POLICY APPROVED"}
        </span>
      </div>

      {/* Prominent Kill Switch / Block Notice */}
      {hasBlock && (
        <div className="mb-5 p-4 rounded-xl bg-[#FEECEC] border border-[#E5484D]/30 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#E5484D]">
              Kill Switch Activated: Execution Frozen
            </h4>
            <p className="text-xs text-[#111827] mt-0.5">
              The AI recommended an intervention, but deterministic merchant policies prevented
              execution due to rule violations. Money-moving actions will not proceed without
              manual override.
            </p>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {checks.map((check, idx) => {
          const isAllowed = check.result === "ALLOW";
          const isEscalate = check.result === "ESCALATE";
          const isBlockedResult = check.result === "BLOCK";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-all ${
                isBlockedResult
                  ? "bg-[#FEECEC]/50 border-[#E5484D]/30"
                  : isEscalate
                  ? "bg-[#FFF6E8]/50 border-[#F59E0B]/30"
                  : "bg-[#FAFBFF] border-[#E7EAF0]"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isAllowed && <CheckCircle2 className="w-4 h-4 text-[#13B981]" />}
                {isEscalate && <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
                {isBlockedResult && <ShieldAlert className="w-4 h-4 text-[#E5484D]" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111827]">
                    {check.ruleName.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isAllowed
                        ? "text-[#13B981]"
                        : isEscalate
                        ? "text-[#F59E0B]"
                        : "text-[#E5484D]"
                    }`}
                  >
                    {check.result}
                  </span>
                </div>
                <p className="text-[#667085] mt-1">{check.reason}</p>
              </div>
            </div>
          );
        })}
        {checks.length === 0 && (
          <p className="text-xs text-[#667085] py-4 text-center">
            Awaiting policy engine evaluation...
          </p>
        )}
      </div>
    </div>
  );
}
