"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Building2,
  RefreshCcw,
  PhoneCall,
  CalendarCheck,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { MetricCard } from "@/src/components/dashboard/metric-card";
import { RecoveryFunnel } from "@/src/components/dashboard/recovery-funnel";
import { ActivityFeed } from "@/src/components/dashboard/activity-feed";
import { RiskBadge } from "@/src/components/shared/risk-badge";
import { StatusBadge } from "@/src/components/shared/status-badge";
import { EmptyState } from "@/src/components/shared/empty-state";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch("/api/demo/generate", { method: "POST" });
      await fetchAnalytics();
    } catch (e) {
      alert("Error seeding: " + e);
    } finally {
      setSeeding(false);
    }
  };

  const formatLakhs = (cents: number) => {
    const rupees = cents / 100;
    if (rupees >= 100000) {
      return `₹${(rupees / 100000).toFixed(2)}L`;
    }
    return `₹${rupees.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-[#5B3DF5] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#667085]">Loading Recovery Command Center...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    revenueAtRisk: 0,
    potentiallyRecoverable: 0,
    revenueRecovered: 0,
    recoveryRate: 0,
    avgRecoveryTimeHours: 6.4,
  };

  const funnel = data?.funnel || {
    detected: 0,
    atRisk: 0,
    intervened: 0,
    recovered: 0,
  };

  const topCases = data?.topCases || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Overview</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time overview of all 7 autonomous revenue recovery workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-white px-3 py-1.5 text-[#111827] focus:outline-none focus:border-[#5B3DF5]">
            <option>This Month</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="w-8 h-8 rounded-lg bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {topCases.length === 0 ? (
        <EmptyState
          title="No Recovery Operations Active"
          description="Your recovery engine is ready. Generate realistic demo cases to test closed-loop recovery workflows, policy validation, and financial verification."
          onAction={handleSeed}
          isLoading={seeding}
        />
      ) : (
        <>
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Revenue at Risk"
              value={formatLakhs(metrics.revenueAtRisk)}
              trend="+18.6% vs last month"
              isPositive={false}
              icon={TrendingUp}
              iconColor="text-[#5B3DF5]"
              iconBg="bg-[#F1EDFF]"
            />
            <MetricCard
              title="Potentially Recoverable"
              value={formatLakhs(metrics.potentiallyRecoverable)}
              trend="+21.2% vs last month"
              isPositive={true}
              icon={Zap}
              iconColor="text-[#2F6BFF]"
              iconBg="bg-[#EEF4FF]"
            />
            <MetricCard
              title="Revenue Recovered"
              value={formatLakhs(metrics.revenueRecovered)}
              trend="+34.8% vs last month"
              isPositive={true}
              icon={ShieldCheck}
              iconColor="text-[#13B981]"
              iconBg="bg-[#EAFBF4]"
            />
            <MetricCard
              title="Recovery Rate"
              value={`${metrics.recoveryRate}%`}
              trend="+8.4% vs last month"
              isPositive={true}
              icon={TrendingUp}
              iconColor="text-[#5B3DF5]"
              iconBg="bg-[#F1EDFF]"
            />
            <MetricCard
              title="Avg. Recovery Time"
              value={`${metrics.avgRecoveryTimeHours} hrs`}
              trend="12.1% faster"
              isPositive={true}
              icon={Clock}
              iconColor="text-[#2F6BFF]"
              iconBg="bg-[#EEF4FF]"
            />
          </div>

          {/* Active Workflows Strip */}
          <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Active Recovery Workflows (7 Streams)
              </h3>
              <span className="text-xs font-bold text-[#13B981]">100% Policy Protected</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <Link
                href="/recoveries"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#5B3DF5] mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="font-bold">Payment</span>
                </div>
                <span className="text-lg font-black text-[#111827]">18</span>
                <span className="text-[10px] text-[#667085] block">Active cases</span>
              </Link>

              <Link
                href="/b2b"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#5B3DF5] mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="font-bold">B2B Invoice</span>
                </div>
                <span className="text-lg font-black text-[#111827]">12</span>
                <span className="text-[10px] text-[#667085] block">Overdue chaser</span>
              </Link>

              <Link
                href="/mandates"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#2F6BFF] mb-1">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span className="font-bold">Mandates</span>
                </div>
                <span className="text-lg font-black text-[#111827]">5</span>
                <span className="text-[10px] text-[#667085] block">Sequencing</span>
              </Link>

              <Link
                href="/voice"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#5B3DF5] mb-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="font-bold">Voice</span>
                </div>
                <span className="text-lg font-black text-[#111827]">4</span>
                <span className="text-[10px] text-[#667085] block">Hinglish agent</span>
              </Link>

              <Link
                href="/promises"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#13B981] mb-1">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span className="font-bold">Promises</span>
                </div>
                <span className="text-lg font-black text-[#111827]">8</span>
                <span className="text-[10px] text-[#667085] block">Commitments</span>
              </Link>

              <Link
                href="/recoveries"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#2F6BFF] mb-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="font-bold">Checkout</span>
                </div>
                <span className="text-lg font-black text-[#111827]">9</span>
                <span className="text-[10px] text-[#667085] block">Abandonment</span>
              </Link>

              <Link
                href="/subscriptions"
                className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] hover:border-[#5B3DF5] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[#F59E0B] mb-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="font-bold">Subscription</span>
                </div>
                <span className="text-lg font-black text-[#111827]">7</span>
                <span className="text-[10px] text-[#667085] block">Involuntary churn</span>
              </Link>
            </div>
          </div>

          {/* Recovery Funnel */}
          <RecoveryFunnel data={funnel} />

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Recovery Cases (2 Cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Top Recovery Cases</h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Active revenue loss cases prioritized by economic impact
                  </p>
                </div>
                <Link
                  href="/recoveries"
                  className="text-xs font-bold text-[#5B3DF5] hover:underline flex items-center gap-1"
                >
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold">
                      <th className="py-2.5 px-3">Case ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Workflow Type</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EAF0]">
                    {topCases.map((c: any) => (
                      <tr
                        key={c.id}
                        className="hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                        onClick={() => (window.location.href = `/recoveries/${c.id}`)}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#5B3DF5]">
                          #{c.id.substring(0, 8)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#111827]">
                          {c.customerName || "Customer"}
                        </td>
                        <td className="py-3 px-3 text-[#111827] font-semibold capitalize">
                          {c.caseType.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#111827]">
                          ₹{((c.amountAtRisk || 0) / 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={c.riskLevel} score={c.riskScore} />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Recent Activity & Channels */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#111827]">Recent Activity</h3>
                  <Link
                    href="/audit"
                    className="text-xs font-bold text-[#5B3DF5] hover:underline"
                  >
                    View audit
                  </Link>
                </div>
                <ActivityFeed activities={recentActivity} />
              </div>

              {/* Recovery by Channel */}
              <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
                <h3 className="text-base font-bold text-[#111827] mb-4">Recovery by Channel</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5B3DF5]" />
                      <span className="text-[#111827] font-medium">Email Outreach (B2B & B2C)</span>
                    </div>
                    <span className="font-bold text-[#111827]">38%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#13B981]" />
                      <span className="text-[#111827] font-medium">WhatsApp Interactive Links</span>
                    </div>
                    <span className="font-bold text-[#111827]">26%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]" />
                      <span className="text-[#111827] font-medium">Mandate & Smart Retry</span>
                    </div>
                    <span className="font-bold text-[#111827]">20%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5B3DF5]" />
                      <span className="text-[#111827] font-medium">Hinglish Voice Agents</span>
                    </div>
                    <span className="font-bold text-[#111827]">12%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#667085]" />
                      <span className="text-[#111827] font-medium">Human Specialist Escalation</span>
                    </div>
                    <span className="font-bold text-[#111827]">4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
