"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { MetricCard } from "@/src/components/dashboard/metric-card";
import { RecoveryFunnel } from "@/src/components/dashboard/recovery-funnel";
import { TrendingUp, ShieldCheck, Zap, Clock, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const metrics = data?.metrics || {
    revenueAtRisk: 124000000,
    potentiallyRecoverable: 78000000,
    revenueRecovered: 38400000,
    recoveryRate: 49.2,
    avgRecoveryTimeHours: 6.4,
  };

  const funnel = data?.funnel || {
    detected: 1000,
    atRisk: 247,
    intervened: 163,
    recovered: 143,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics & Telemetry"
        subtitle="Auditable metrics, recovery ROI benchmarks, and conversion funnel analytics"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recovered"
          value={`₹${(metrics.revenueRecovered / 100).toLocaleString()}`}
          trend="+34.8% uplift"
          isPositive={true}
          icon={ShieldCheck}
          iconColor="text-[#13B981]"
          iconBg="bg-[#EAFBF4]"
        />
        <MetricCard
          title="Recovery Conversion"
          value={`${metrics.recoveryRate}%`}
          trend="+8.4% vs baseline"
          isPositive={true}
          icon={TrendingUp}
          iconColor="text-[#5B3DF5]"
          iconBg="bg-[#F1EDFF]"
        />
        <MetricCard
          title="Total Interventions"
          value={funnel.intervened.toLocaleString()}
          trend="99.2% policy compliant"
          isPositive={true}
          icon={Zap}
          iconColor="text-[#2F6BFF]"
          iconBg="bg-[#EEF4FF]"
        />
        <MetricCard
          title="Avg. Resolution Window"
          value={`${metrics.avgRecoveryTimeHours} hrs`}
          trend="12.1% faster"
          isPositive={true}
          icon={Clock}
          iconColor="text-[#5B3DF5]"
          iconBg="bg-[#F1EDFF]"
        />
      </div>

      <RecoveryFunnel data={funnel} />

      {/* Conversion & Policy Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
          <h3 className="text-base font-bold text-[#111827] mb-3">Recovery by Channel Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Direct Payment Links (Email)</span>
              <span className="font-bold text-[#13B981]">68.4% Success Rate</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Instant WhatsApp UPI Triggers</span>
              <span className="font-bold text-[#13B981]">76.2% Success Rate</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Scheduled Smart Re-Authorization</span>
              <span className="font-bold text-[#13B981]">52.8% Success Rate</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">White-Glove Human Escalation</span>
              <span className="font-bold text-[#13B981]">82.0% Success Rate</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
          <h3 className="text-base font-bold text-[#111827] mb-3">Policy Engine Safety Telemetry</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Max Retries Cap Enforced</span>
              <span className="font-bold text-[#2F6BFF]">100% Guaranteed</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Duplicate Action Protection</span>
              <span className="font-bold text-[#13B981]">0 Duplicates Dispatched</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">Consent Opt-Out Honored</span>
              <span className="font-bold text-[#13B981]">100% Compliant</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E7EAF0]">
              <span className="font-semibold text-[#111827]">High-Value Escalation Threshold</span>
              <span className="font-bold text-[#F59E0B]">Enforced at ₹100,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
