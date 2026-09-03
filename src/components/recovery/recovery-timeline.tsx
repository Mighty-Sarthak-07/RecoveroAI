import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { RecoveryState } from "@/src/types/recovery";

interface RecoveryTimelineProps {
  status: RecoveryState | string;
  amountRecovered?: number;
}

const STAGES: Array<{ id: RecoveryState; label: string }> = [
  { id: "DETECTED", label: "1. Detected" },
  { id: "DIAGNOSING", label: "2. Diagnosed" },
  { id: "DECIDING", label: "3. Decision" },
  { id: "POLICY_REVIEW", label: "4. Policy Checked" },
  { id: "EXECUTING", label: "5. Executed" },
  { id: "VERIFYING", label: "6. Verified" },
  { id: "RECOVERED", label: "7. Recovered" },
];

export function RecoveryTimeline({ status, amountRecovered }: RecoveryTimelineProps) {
  const isRecovered = status === "RECOVERED";
  const isBlocked = status === "BLOCKED";
  const isEscalated = status === "ESCALATED";

  const getStageStatus = (stageId: RecoveryState, index: number) => {
    if (isBlocked && index >= 3) return "blocked";
    if (isEscalated && index >= 3) return "escalated";

    const stateOrder: RecoveryState[] = [
      "DETECTED",
      "DIAGNOSING",
      "DECIDING",
      "POLICY_REVIEW",
      "APPROVED",
      "EXECUTING",
      "VERIFYING",
      "RECOVERED",
    ];

    const currentIndex = stateOrder.indexOf(status as RecoveryState);
    const stageIndex = stateOrder.indexOf(stageId);

    if (currentIndex >= stageIndex) return "completed";
    if (currentIndex === stageIndex - 1) return "current";
    return "upcoming";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">Closed-Loop Recovery Timeline</h3>
          <p className="text-xs text-[#667085]">
            Chronological progression from risk detection to financial verification
          </p>
        </div>
        {isRecovered && amountRecovered && (
          <span className="text-xs font-bold text-[#13B981] bg-[#EAFBF4] px-3 py-1 rounded-full border border-[#13B981]/30">
            ✓ ₹{(amountRecovered / 100).toLocaleString()} Verified & Recovered
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAGES.map((stage, idx) => {
          const stageStatus = getStageStatus(stage.id, idx);
          const isDone = stageStatus === "completed";
          const isCurr = stageStatus === "current";
          const isFail = stageStatus === "blocked" || stageStatus === "escalated";

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                isDone
                  ? "bg-[#EAFBF4]/60 border-[#13B981]/30"
                  : isCurr
                  ? "bg-[#F1EDFF] border-[#5B3DF5]"
                  : isFail
                  ? "bg-[#FFF6E8] border-[#F59E0B]/30 opacity-70"
                  : "bg-[#FAFBFF] border-[#E7EAF0] opacity-50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                  isDone
                    ? "bg-[#13B981] text-white"
                    : isCurr
                    ? "bg-[#5B3DF5] text-white animate-pulse"
                    : isFail
                    ? "bg-[#F59E0B] text-white"
                    : "bg-[#E7EAF0] text-[#667085]"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-bold block ${
                  isDone
                    ? "text-[#13B981]"
                    : isCurr
                    ? "text-[#5B3DF5]"
                    : "text-[#111827]"
                }`}
              >
                {stage.label}
              </span>
              <span className="text-[10px] text-[#667085] mt-0.5 block">
                {isDone ? "Completed" : isCurr ? "In Progress" : isFail ? "Blocked/Escalated" : "Pending"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
