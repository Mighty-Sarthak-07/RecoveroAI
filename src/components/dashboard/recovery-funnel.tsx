import React from "react";
import { Radar, AlertCircle, Zap, CheckCircle2 } from "lucide-react";

interface FunnelData {
  detected: number;
  atRisk: number;
  intervened: number;
  recovered: number;
}

export function RecoveryFunnel({ data }: { data: FunnelData }) {
  const atRiskDropOff =
    data.detected > 0
      ? (((data.detected - data.atRisk) / data.detected) * 100).toFixed(1)
      : "0";

  const intervenedDropOff =
    data.atRisk > 0
      ? (((data.atRisk - data.intervened) / data.atRisk) * 100).toFixed(1)
      : "0";

  const recoveryRate =
    data.atRisk > 0 ? (((data.recovered) / data.atRisk) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#111827]">Recovery Funnel</h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Stage-by-stage revenue loss detection and bounded execution pipeline
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F7F8FC] text-[#667085] border border-[#E7EAF0]">
          All Channels
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* 1. Detected */}
        <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E7EAF0] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center mb-2">
            <Radar className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-[#667085]">Detected</span>
          <span className="text-2xl font-bold text-[#111827] mt-1">{data.detected.toLocaleString()}</span>
          <span className="text-[11px] text-[#667085] mt-2">Incoming Events</span>
        </div>

        {/* 2. At Risk */}
        <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E7EAF0] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#FFF6E8] text-[#F59E0B] flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-[#667085]">At Risk</span>
          <span className="text-2xl font-bold text-[#111827] mt-1">{data.atRisk.toLocaleString()}</span>
          <span className="text-[11px] font-medium text-[#F59E0B] mt-2">
            ↓ {atRiskDropOff}% Filtered
          </span>
        </div>

        {/* 3. Intervened */}
        <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E7EAF0] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-[#667085]">Intervened</span>
          <span className="text-2xl font-bold text-[#111827] mt-1">{data.intervened.toLocaleString()}</span>
          <span className="text-[11px] font-medium text-[#2F6BFF] mt-2">
            ↓ {intervenedDropOff}% Policy/Exclusions
          </span>
        </div>

        {/* 4. Recovered */}
        <div className="bg-[#EAFBF4]/50 p-4 rounded-xl border border-[#13B981]/30 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#EAFBF4] text-[#13B981] flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-[#13B981]">Recovered</span>
          <span className="text-2xl font-bold text-[#13B981] mt-1">{data.recovered.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-[#13B981] mt-2">
            ✓ {recoveryRate}% Conversion Rate
          </span>
        </div>
      </div>
    </div>
  );
}
