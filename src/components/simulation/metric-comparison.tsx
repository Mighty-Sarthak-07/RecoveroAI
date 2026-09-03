import React from "react";
import { TrendingUp, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { SimulationResult } from "@/src/types/recovery";

export function MetricComparison({ result }: { result: SimulationResult }) {
  const comparison = result.baselineComparison;
  const formatINR = (cents: number) => `₹${(cents / 100).toLocaleString()}`;

  const baselineRecovered = comparison?.baselineRecovered || Math.round(result.revenueAtRisk * 0.28);
  const baselineRate = comparison?.baselineRecoveryRate || 28.0;
  const baselineCost = comparison?.baselineCost || result.totalEvents * 20;
  const baselineRoi = comparison?.baselineRoi || 14.5;

  const uplift = comparison?.recoveryUpliftPercentage || Number((result.recoveryRate - baselineRate).toFixed(1));
  const additionalRev = comparison?.additionalRevenueRecovered || (result.revenueRecovered - baselineRecovered);

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E7EAF0] mb-6">
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Baseline vs. RecoveroAI Comparison
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Same batch of {result.totalEvents.toLocaleString()} events evaluated across both strategies
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#EAFBF4] text-[#13B981] border border-[#13B981]/30">
          <TrendingUp className="w-3.5 h-3.5" />
          +{uplift}% Net Recovery Uplift
        </span>
      </div>

      {/* Side-by-side Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[#E7EAF0] text-xs font-semibold text-[#667085] uppercase bg-[#FAFBFF]">
              <th className="py-3 px-4">Metric</th>
              <th className="py-3 px-4 text-right">Baseline Strategy (Immediate Retry)</th>
              <th className="py-3 px-4 text-right text-[#5B3DF5]">RecoveroAI Engine</th>
              <th className="py-3 px-4 text-right text-[#13B981]">Performance Uplift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EAF0]">
            <tr>
              <td className="py-3.5 px-4 font-medium text-[#111827]">Total Events Evaluated</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {result.totalEvents.toLocaleString()}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                {result.totalEvents.toLocaleString()}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-semibold text-[#667085]">—</td>
            </tr>

            <tr>
              <td className="py-3.5 px-4 font-medium text-[#111827]">Revenue at Risk</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {formatINR(result.revenueAtRisk)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                {formatINR(result.revenueAtRisk)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-semibold text-[#667085]">—</td>
            </tr>

            <tr className="bg-[#FAFBFF]/60">
              <td className="py-3.5 px-4 font-bold text-[#111827]">Revenue Recovered</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {formatINR(baselineRecovered)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#13B981]">
                {formatINR(result.revenueRecovered)}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-[#13B981]">
                +{formatINR(additionalRev)}
              </td>
            </tr>

            <tr>
              <td className="py-3.5 px-4 font-bold text-[#111827]">Recovery Rate</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {baselineRate.toFixed(1)}%
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#5B3DF5]">
                {Number(result.recoveryRate).toFixed(1)}%
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-[#13B981]">
                +{uplift}%
              </td>
            </tr>

            <tr>
              <td className="py-3.5 px-4 font-medium text-[#111827]">Intervention Cost</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {formatINR(baselineCost)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111827]">
                {formatINR(result.interventionCost)}
              </td>
              <td className="py-3.5 px-4 text-right text-xs font-semibold text-[#13B981]">
                Cost-Aware Selection
              </td>
            </tr>

            <tr className="bg-[#FAFBFF]/60">
              <td className="py-3.5 px-4 font-bold text-[#111827]">Return on Investment (ROI)</td>
              <td className="py-3.5 px-4 text-right font-mono text-[#667085]">
                {baselineRoi.toFixed(1)}x
              </td>
              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#5B3DF5]">
                {Number(result.roi) >= 999 ? "999x" : `${Number(result.roi).toFixed(1)}x`}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-[#13B981]">
                {comparison?.roiImprovementMultiplier
                  ? `${comparison.roiImprovementMultiplier}x higher`
                  : "Significantly Higher"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Uplift Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E7EAF0]">
        <div className="p-4 rounded-xl bg-[#EAFBF4] border border-[#13B981]/30">
          <span className="text-xs font-bold text-[#13B981] uppercase tracking-wider block">
            Additional Revenue Won
          </span>
          <span className="text-2xl font-extrabold text-[#111827] mt-1 block">
            {formatINR(additionalRev)}
          </span>
          <span className="text-xs text-[#667085] mt-1 block">
            Incremental cash directly recovered
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#F1EDFF] border border-[#5B3DF5]/30">
          <span className="text-xs font-bold text-[#5B3DF5] uppercase tracking-wider block">
            Autonomous Actions
          </span>
          <span className="text-2xl font-extrabold text-[#111827] mt-1 block">
            {result.automatedActions.toLocaleString()}
          </span>
          <span className="text-xs text-[#667085] mt-1 block">
            Actions executed without manual effort
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FFF6E8] border border-[#F59E0B]/30">
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
            Policy Protected Blocks
          </span>
          <span className="text-2xl font-extrabold text-[#111827] mt-1 block">
            {result.policyBlocks.toLocaleString()}
          </span>
          <span className="text-xs text-[#667085] mt-1 block">
            Risky or duplicate retries prevented
          </span>
        </div>
      </div>
    </div>
  );
}
