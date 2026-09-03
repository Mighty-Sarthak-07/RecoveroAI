import React from "react";
import { RiskLevel } from "@/src/types/recovery";

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
}

export function RiskBadge({ level, score }: RiskBadgeProps) {
  const normalized = (level || "MEDIUM").toUpperCase();

  let bg = "bg-[#EEF4FF] text-[#2F6BFF] border-[#2F6BFF]/20";
  if (normalized === "CRITICAL") {
    bg = "bg-[#FEECEC] text-[#E5484D] border-[#E5484D]/25";
  } else if (normalized === "HIGH") {
    bg = "bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/25";
  } else if (normalized === "LOW") {
    bg = "bg-[#EAFBF4] text-[#13B981] border-[#13B981]/25";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalized === "CRITICAL"
            ? "bg-[#E5484D]"
            : normalized === "HIGH"
            ? "bg-[#F59E0B]"
            : normalized === "LOW"
            ? "bg-[#13B981]"
            : "bg-[#2F6BFF]"
        }`}
      />
      {normalized}
      {score !== undefined && <span className="opacity-75">({score})</span>}
    </span>
  );
}
