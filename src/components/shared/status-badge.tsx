import React from "react";
import { RecoveryState } from "@/src/types/recovery";

interface StatusBadgeProps {
  status: RecoveryState | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || "DETECTED").toUpperCase();

  let styles = "bg-[#F7F8FC] text-[#667085] border-[#E7EAF0]";
  let dotColor = "bg-[#667085]";

  if (normalized === "RECOVERED") {
    styles = "bg-[#EAFBF4] text-[#13B981] border-[#13B981]/30 font-semibold";
    dotColor = "bg-[#13B981]";
  } else if (normalized === "BLOCKED" || normalized === "FAILED") {
    styles = "bg-[#FEECEC] text-[#E5484D] border-[#E5484D]/30";
    dotColor = "bg-[#E5484D]";
  } else if (normalized === "ESCALATED") {
    styles = "bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/30 font-medium";
    dotColor = "bg-[#F59E0B]";
  } else if (normalized === "EXECUTING" || normalized === "VERIFYING") {
    styles = "bg-[#EEF4FF] text-[#2F6BFF] border-[#2F6BFF]/30";
    dotColor = "bg-[#2F6BFF] animate-pulse";
  } else if (normalized === "APPROVED" || normalized === "DIAGNOSING" || normalized === "DECIDING") {
    styles = "bg-[#F1EDFF] text-[#5B3DF5] border-[#5B3DF5]/30";
    dotColor = "bg-[#5B3DF5]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {normalized.replace("_", " ")}
    </span>
  );
}
