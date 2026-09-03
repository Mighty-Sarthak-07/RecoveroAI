"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, RefreshCw, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { RiskBadge } from "@/src/components/shared/risk-badge";
import { StatusBadge } from "@/src/components/shared/status-badge";
import { PageHeader } from "@/src/components/shared/page-header";

export default function RecoveriesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/recoveries");
      const json = await res.json();
      setCases(json.cases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (c.caseType && c.caseType.toLowerCase().includes(search.toLowerCase())) ||
      (c.rootCause && c.rootCause.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchesRisk = filterRisk === "ALL" || c.riskLevel === filterRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Recovery Cases"
        subtitle="Manage and track revenue recovery cases through the autonomous decision and verification lifecycle"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCases}
              className="p-2 rounded-lg bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, customer, type, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-medium rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="APPROVED">Approved</option>
            <option value="EXECUTING">Executing</option>
            <option value="RECOVERED">Recovered</option>
            <option value="BLOCKED">Blocked</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="text-xs font-medium rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Case Type</th>
                <th className="py-3 px-4">Root Cause</th>
                <th className="py-3 px-4">Amount at Risk</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/recoveries/${c.id}`)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">
                    #{c.id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#111827] block">
                      {c.customerName || "Customer"}
                    </span>
                    <span className="text-[11px] text-[#667085]">{c.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#111827] font-medium capitalize">
                    {c.caseType.replace(/_/g, " ")}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] font-mono text-[11px]">
                    {c.rootCause || "unclassified"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    ₹{((c.amountAtRisk || 0) / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={c.riskLevel} score={c.riskScore} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/recoveries/${c.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#5B3DF5] hover:underline"
                    >
                      Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredCases.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#667085]">
                    No recovery cases match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
