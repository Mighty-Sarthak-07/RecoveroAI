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
  Database,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { MetricCard } from "@/src/components/dashboard/metric-card";
import { DataSourceModal } from "@/src/components/onboarding/data-source-modal";
import { DeleteConfirmationModal } from "@/src/components/dashboard/delete-confirmation-modal";
import { AnalysisCompleteModal } from "@/src/components/dashboard/analysis-complete-modal";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAnalysisCompleteOpen, setIsAnalysisCompleteOpen] = useState(false);
  const [analysisResultStats, setAnalysisResultStats] = useState<any>(null);
  const [analysisResultCases, setAnalysisResultCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "failed" | "recovered" | "succeeded">("all");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleAnalyzeRevenue = async () => {
    setIsReanalyzing(true);
    try {
      const res = await fetch("/api/data-source/analyze", { method: "POST" });
      const json = await res.json();
      setAnalysisResultStats(json.stats);
      setAnalysisResultCases(json.cases || []);
      await fetchAnalytics();
      setIsAnalysisCompleteOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReanalyzing(false);
    }
  };

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

  const formatLakhs = (cents: number) => {
    const rupees = cents / 100;
    if (rupees >= 100000) {
      return `₹${(rupees / 100000).toFixed(2)}L`;
    }
    return `₹${rupees.toLocaleString()}`;
  };

  const formatDateTime = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "Just now";
    try {
      const d = new Date(dateVal);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateVal);
    }
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
    avgRecoveryTimeHours: 0,
  };

  const topCases = data?.topCases || [];
  const rawTransactions = data?.transactions || [];

  // Compute stream breakdown strictly from backend API or live cases (0 if empty)
  const streamCounts: Record<string, number> = data?.streamCounts || {
    payment: topCases.filter((c: any) => !c.caseType || c.caseType === "payment_failure").length,
    b2b: topCases.filter((c: any) => c.caseType === "b2b_receivable").length,
    mandates: topCases.filter((c: any) => c.caseType === "mandate_retry").length,
    voice: topCases.filter((c: any) => c.caseType === "voice_recovery").length,
    promises: topCases.filter((c: any) => c.caseType === "promise_to_pay").length,
    checkout: topCases.filter((c: any) => c.caseType === "checkout_abandonment").length,
    subscription: topCases.filter((c: any) => c.caseType === "subscription_failure").length,
  };

  const totalActiveStreamsCount = Object.values(streamCounts).reduce((a, b) => a + b, 0);

  // Normalize transaction list from raw payments or fallback from topCases
  const allTransactions =
    rawTransactions.length > 0
      ? rawTransactions
      : topCases.map((c: any) => ({
          id: c.id,
          razorpayPaymentId: `pay_${c.id.substring(0, 10)}`,
          amount: c.amountAtRisk,
          currency: "inr",
          status: c.status === "RECOVERED" ? "succeeded" : "failed",
          failureReason: c.rootCause || "insufficient_funds",
          paymentMethodType: c.caseType?.includes("mandate") ? "nach" : c.caseType?.includes("invoice") ? "b2b_invoice" : "card",
          createdAt: c.createdAt,
          customerName: c.customerName,
          customerEmail: "customer@example.com",
          caseId: c.id,
        }));

  // Filter transactions by search and status
  const filteredTransactions = allTransactions.filter((txn: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (txn.customerName && txn.customerName.toLowerCase().includes(term)) ||
      (txn.customerEmail && txn.customerEmail.toLowerCase().includes(term)) ||
      (txn.razorpayPaymentId && txn.razorpayPaymentId.toLowerCase().includes(term)) ||
      (txn.id && txn.id.toLowerCase().includes(term)) ||
      (txn.failureReason && txn.failureReason.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "succeeded") return txn.status === "succeeded" || txn.status === "RECOVERED";
    if (statusFilter === "failed") return txn.status === "failed";
    if (statusFilter === "recovered") return txn.status === "RECOVERED";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Overview</h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time transaction log, risk detections, and autonomous recovery actions
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAnalyzeRevenue}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isReanalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isReanalyzing ? "Analyzing..." : "Analyze Revenue"}
          </button>
          <button
            onClick={() => setIsSourceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#5B3DF5] bg-[#F1EDFF] hover:bg-[#5B3DF5] hover:text-white border border-[#5B3DF5]/30 rounded-lg transition-colors shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            Connect Data Source
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#E5484D] hover:text-white bg-[#FFF5F5] hover:bg-[#E5484D] border border-[#FED7D7] hover:border-[#E5484D] rounded-lg transition-all shadow-2xs"
            title="Purge all data & reset to blank state"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All Data
          </button>
          <button
            onClick={fetchAnalytics}
            className="w-8 h-8 rounded-lg bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Source Stream Status Banner */}
      {topCases.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-[#F1EDFF] border border-[#5B3DF5]/30 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5B3DF5] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                Connect your transaction stream to activate autonomous recovery
              </h3>
              <p className="text-xs text-[#667085] flex items-center gap-1.5 flex-wrap">
                <span>Support for</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0C2340] text-white text-[10px] font-bold">
                  <img src="/razorpay.png" alt="Razorpay" className="h-2.5 object-contain brightness-200" /> Razorpay
                </span>
                <span>API / Webhooks, CSV transaction history, or 1-click Judge Demo Data.</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allTransactions.length > 0 && (
              <button
                onClick={handleAnalyzeRevenue}
                disabled={isReanalyzing}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-xl transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Analyze with RecoveroAI
              </button>
            )}
            <button
              onClick={() => setIsSourceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#5B3DF5] bg-white hover:bg-[#5B3DF5] hover:text-white border border-[#5B3DF5]/30 rounded-xl transition-all shadow-sm"
            >
              <Database className="w-4 h-4" />
              Connect Data Source
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13B981] animate-pulse" />
            <span className="text-xs font-bold text-[#111827]">
              Live Recovery Stream: <span className="text-[#5B3DF5]">Multi-Workflow Engine Active</span>
            </span>
            <span className="text-[10px] font-semibold text-[#667085] px-2 py-0.5 rounded bg-[#FAFBFF] border border-[#E7EAF0]">
              {allTransactions.length} Transactions Ingested
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeRevenue}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              {isReanalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isReanalyzing ? "AI Analyzing..." : "Analyze with RecoveroAI"}
            </button>
            <button
              onClick={() => setIsSourceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#5B3DF5] bg-[#F1EDFF] hover:bg-[#5B3DF5] hover:text-white rounded-lg transition-colors border border-[#5B3DF5]/30"
            >
              <Database className="w-3.5 h-3.5" />
              Switch / Import More Data
            </button>
          </div>
        </div>
      )}

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
            Active Recovery Workflows (7 Streams — Total: {totalActiveStreamsCount} Cases)
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.payment}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.b2b}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.mandates}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.voice}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.promises}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.checkout}</span>
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
            <span className="text-lg font-black text-[#111827]">{streamCounts.subscription}</span>
            <span className="text-[10px] text-[#667085] block">Involuntary churn</span>
          </Link>
        </div>
      </div>

      {/* ALL TRANSACTIONS TABLE (With Date, Time, Name, Amount, Gateway, Status) */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#111827]">All Transactions</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Live ledger of incoming transactions with timestamps, customer identity, and recovery status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#F7F8FC] rounded-lg border border-[#E7EAF0] text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statusFilter === "all" ? "bg-white text-[#5B3DF5] shadow-2xs" : "text-[#667085]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("failed")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statusFilter === "failed" ? "bg-white text-[#E5484D] shadow-2xs" : "text-[#667085]"
                }`}
              >
                Failed
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("recovered")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  statusFilter === "recovered" ? "bg-white text-[#13B981] shadow-2xs" : "text-[#667085]"
                }`}
              >
                Recovered
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method / Channel</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Recovery Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#667085]">
                    No transactions found matching your criteria.{" "}
                    <button
                      type="button"
                      onClick={() => setIsSourceModalOpen(true)}
                      className="text-[#5B3DF5] font-bold hover:underline"
                    >
                      Connect Data Source
                    </button>{" "}
                    to import records.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item: any, idx: number) => {
                  const isRecovered = item.status === "RECOVERED";
                  const isSucceeded = item.status === "succeeded" || isRecovered;
                  const caseId = item.caseId || item.id;

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                      onClick={() => {
                        if (caseId) window.location.href = `/recoveries/${caseId}`;
                      }}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-[#111827] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#667085]" />
                          <span>{formatDateTime(item.createdAt)}</span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5] whitespace-nowrap">
                        {item.razorpayPaymentId || `txn_${item.id?.substring(0, 8)}`}
                      </td>

                      {/* Customer Name & Contact */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#111827] block">
                          {item.customerName || "Customer"}
                        </span>
                        <span className="text-[10px] text-[#667085] block truncate max-w-[160px]">
                          {item.customerEmail || item.customerPhone || "Direct Customer"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-[#111827] whitespace-nowrap">
                        ₹{((item.amount || 0) / 100).toLocaleString()}
                      </td>

                      {/* Method / Channel */}
                      <td className="py-3.5 px-4 capitalize text-[#667085] whitespace-nowrap">
                        {item.paymentMethodType?.replace(/_/g, " ") || "Card"}
                        {item.paymentMethodLast4 ? ` (••${item.paymentMethodLast4})` : ""}
                      </td>

                      {/* Failure Reason */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#667085]">
                        {item.failureReason || "insufficient_funds"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isRecovered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                          </span>
                        ) : isSucceeded ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Succeeded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E5484D] bg-[#FEECEC] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>

                      {/* Recovery Action Link */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5B3DF5] hover:underline">
                          View Case <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* On-demand Data Source Modal */}
      <DataSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSuccess={fetchAnalytics}
      />

      {/* On-demand Delete Confirmation & Captcha Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchAnalytics}
      />

      {/* AI Analysis Complete Popup to Check Recovery Cases */}
      <AnalysisCompleteModal
        isOpen={isAnalysisCompleteOpen}
        onClose={() => setIsAnalysisCompleteOpen(false)}
        stats={analysisResultStats}
        cases={analysisResultCases.length > 0 ? analysisResultCases : (data?.topCases || [])}
      />
    </div>
  );
}
