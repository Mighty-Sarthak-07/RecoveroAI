"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, ShieldCheck, AlertCircle, ArrowUpRight, Zap } from "lucide-react";

interface BarDataPoint {
  label: string;
  total: number;
  succeeded: number;
  failed: number;
  recovered: number;
  amountRiskRupees: number;
}

const WEEKLY_DATA: BarDataPoint[] = [
  { label: "Mon", total: 240, succeeded: 195, failed: 45, recovered: 32, amountRiskRupees: 89000 },
  { label: "Tue", total: 310, succeeded: 250, failed: 60, recovered: 44, amountRiskRupees: 142000 },
  { label: "Wed", total: 285, succeeded: 228, failed: 57, recovered: 41, amountRiskRupees: 118000 },
  { label: "Thu", total: 340, succeeded: 275, failed: 65, recovered: 49, amountRiskRupees: 165000 },
  { label: "Fri", total: 390, succeeded: 310, failed: 80, recovered: 58, amountRiskRupees: 210000 },
  { label: "Sat", total: 210, succeeded: 172, failed: 38, recovered: 27, amountRiskRupees: 74000 },
  { label: "Sun", total: 180, succeeded: 150, failed: 30, recovered: 22, amountRiskRupees: 58000 },
];

const WORKFLOW_DATA: BarDataPoint[] = [
  { label: "Card Pay", total: 540, succeeded: 420, failed: 120, recovered: 89, amountRiskRupees: 298000 },
  { label: "B2B Invoice", total: 180, succeeded: 110, failed: 70, recovered: 48, amountRiskRupees: 385000 },
  { label: "NACH Mandate", total: 320, succeeded: 260, failed: 60, recovered: 42, amountRiskRupees: 145000 },
  { label: "Hinglish Voice", total: 160, succeeded: 95, failed: 65, recovered: 45, amountRiskRupees: 184000 },
  { label: "Subscriptions", total: 420, succeeded: 350, failed: 70, recovered: 51, amountRiskRupees: 215000 },
  { label: "Checkout Cart", total: 290, succeeded: 210, failed: 80, recovered: 56, amountRiskRupees: 128000 },
];

export function TransactionBarChart({
  totalCasesCount = 0,
  revenueAtRiskRupees = 0,
}: {
  totalCasesCount?: number;
  revenueAtRiskRupees?: number;
}) {
  const [viewMode, setViewMode] = useState<"weekly" | "workflow">("weekly");
  const [hoveredPoint, setHoveredPoint] = useState<BarDataPoint | null>(null);

  const data = viewMode === "weekly" ? WEEKLY_DATA : WORKFLOW_DATA;
  const maxTotal = Math.max(...data.map((d) => d.total));

  const totalTransactions = data.reduce((sum, d) => sum + d.total, 0);
  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
  const totalRecovered = data.reduce((sum, d) => sum + d.recovered, 0);
  const totalSucceeded = data.reduce((sum, d) => sum + d.succeeded, 0);

  const recoveryRate = ((totalRecovered / totalFailed) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm space-y-6">
      {/* Header with Title and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7EAF0]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#5B3DF5]" />
            <h3 className="text-base font-bold text-[#111827]">
              Total Transactions &amp; Ingestion Volume
            </h3>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time breakdown of settled payments, revenue at risk, and AI autonomous recoveries
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F8FC] rounded-lg border border-[#E7EAF0] text-xs">
          <button
            type="button"
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1 rounded-md font-bold transition-colors ${
              viewMode === "weekly"
                ? "bg-white text-[#5B3DF5] shadow-xs"
                : "text-[#667085] hover:text-[#111827]"
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setViewMode("workflow")}
            className={`px-3 py-1 rounded-md font-bold transition-colors ${
              viewMode === "workflow"
                ? "bg-white text-[#5B3DF5] shadow-xs"
                : "text-[#667085] hover:text-[#111827]"
            }`}
          >
            By Recovery Stream
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#13B981]" />
            <span className="text-[#667085] font-medium">First-Pass Settled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#5B3DF5]" />
            <span className="text-[#667085] font-medium">Recovered by RecoveroAI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#F59E0B]" />
            <span className="text-[#667085] font-medium">Pending / At Risk</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full">
          ✓ {recoveryRate}% Net Recovery Conversion
        </span>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="relative pt-6 pb-2">
        {/* Hover preview tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 right-4 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-[11px] font-medium shadow-md pointer-events-none z-10 flex items-center gap-3 animate-in fade-in">
            <span>
              <strong className="text-white">{hoveredPoint.label}:</strong> {hoveredPoint.total} total
            </span>
            <span className="text-[#13B981]">✓ {hoveredPoint.succeeded} settled</span>
            <span className="text-[#F59E0B]">⚠ {hoveredPoint.failed} at risk</span>
            <span className="text-[#A78BFA]">★ {hoveredPoint.recovered} recovered</span>
          </div>
        )}

        <div className="h-56 flex items-end gap-3 sm:gap-6 border-b border-[#E7EAF0] pb-2">
          {data.map((point) => {
            const heightPercent = Math.max(12, Math.round((point.total / maxTotal) * 100));
            const succeededRatio = (point.succeeded / point.total) * 100;
            const recoveredRatio = (point.recovered / point.total) * 100;
            const remainingRiskRatio = Math.max(
              0,
              100 - succeededRatio - recoveredRatio
            );

            const isHovered = hoveredPoint?.label === point.label;

            return (
              <div
                key={point.label}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Value on top of bar */}
                <span
                  className={`text-[10px] font-bold mb-1.5 transition-colors ${
                    isHovered ? "text-[#5B3DF5]" : "text-[#667085]"
                  }`}
                >
                  {point.total}
                </span>

                {/* Stacked Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[48px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all ${
                    isHovered ? "ring-2 ring-[#5B3DF5] ring-offset-1" : ""
                  }`}
                >
                  {/* Remaining at risk (Top of stack) */}
                  <div
                    style={{ height: `${remainingRiskRatio}%` }}
                    className="w-full bg-[#F59E0B] opacity-90 transition-all hover:opacity-100"
                    title={`At Risk: ${point.failed - point.recovered}`}
                  />
                  {/* Recovered by AI (Middle of stack) */}
                  <div
                    style={{ height: `${recoveredRatio}%` }}
                    className="w-full bg-[#5B3DF5] transition-all hover:bg-[#4D32D8]"
                    title={`Recovered: ${point.recovered}`}
                  />
                  {/* Settled directly (Base of stack) */}
                  <div
                    style={{ height: `${succeededRatio}%` }}
                    className="w-full bg-[#13B981] transition-all hover:bg-[#0EA271]"
                    title={`Settled: ${point.succeeded}`}
                  />
                </div>

                {/* Bottom X-axis label */}
                <span
                  className={`text-[11px] font-bold mt-2 truncate w-full text-center transition-colors ${
                    isHovered ? "text-[#5B3DF5]" : "text-[#667085]"
                  }`}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Footers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E7EAF0]">
          <span className="text-[#667085] block text-[11px] font-medium">Total Ingested</span>
          <span className="text-base font-black text-[#111827] mt-0.5 block">
            {totalTransactions.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#667085]">100% processed</span>
        </div>

        <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E7EAF0]">
          <span className="text-[#667085] block text-[11px] font-medium">First-Pass Settled</span>
          <span className="text-base font-black text-[#13B981] mt-0.5 block">
            {totalSucceeded.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#13B981] font-semibold">
            {((totalSucceeded / totalTransactions) * 100).toFixed(1)}% clean rate
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#E7EAF0]">
          <span className="text-[#667085] block text-[11px] font-medium">Revenue at Risk</span>
          <span className="text-base font-black text-[#F59E0B] mt-0.5 block">
            {totalFailed.toLocaleString()} txns
          </span>
          <span className="text-[10px] text-[#667085]">Detected failures</span>
        </div>

        <div className="p-3 rounded-lg bg-[#F1EDFF] border border-[#5B3DF5]/30">
          <span className="text-[#5B3DF5] block text-[11px] font-bold">RecoveroAI Saved</span>
          <span className="text-base font-black text-[#5B3DF5] mt-0.5 block">
            {totalRecovered.toLocaleString()} cases
          </span>
          <span className="text-[10px] text-[#5B3DF5] font-semibold">
            +{recoveryRate}% recovered
          </span>
        </div>
      </div>
    </div>
  );
}
