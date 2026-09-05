"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { Building2, Search, RefreshCw, Mail, MessageSquare, ArrowUpRight, ShieldCheck, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function B2BReceivablesPage() {
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetch("/api/recoveries")
      .then((res) => res.json())
      .then((data) => {
        if (data.cases) {
          const b2bCases = data.cases.filter(
            (c: any) => c.caseType === "b2b_receivable"
          );
          if (b2bCases.length > 0) {
            setInvoicesList(
              b2bCases.map((c: any) => ({
                id: c.id,
                invoiceNumber: `INV-2026-${c.id.substring(0, 4).toUpperCase()}`,
                customer: c.customerName || "B2B Client",
                amount: c.amountAtRisk,
                daysOverdue: 12,
                status: c.status === "RECOVERED" ? "paid" : "overdue",
                priority: "high",
                accountOwner: "Enterprise Collections",
                lastAction: c.rootCause || "Overdue Invoice Chaser",
                caseId: c.id,
              }))
            );
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const defaultInvoices = [
    {
      id: "inv_8500",
      invoiceNumber: "INV-2026-8500",
      customer: "TechCorp Global India",
      amount: 8500000,
      daysOverdue: 12,
      status: "overdue",
      priority: "high",
      accountOwner: "Enterprise Collections",
      lastAction: "Payment Reminder Sent (Email)",
      caseId: "ef4b4c53-45a4-4fff-8fa8-45bd7f343c52",
    },
  ];

  const displayedInvoices = invoicesList.length > 0 ? invoicesList : defaultInvoices;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="B2B Receivables Chaser"
        subtitle="Autonomous overdue invoice detection, context-aware reminders, and key-account escalation"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] border border-[#5B3DF5]/30 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> B2B Engine
          </span>
        }
        actions={
          <button
            onClick={() => alert("B2B Invoice generation triggered!")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + New B2B Invoice
          </button>
        }
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Outstanding Receivables
          </span>
          <span className="text-2xl font-bold text-[#111827] mt-1 block">₹28.20L</span>
          <span className="text-xs text-[#E5484D] mt-1 font-medium block">14 Invoices Overdue</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Recovered This Month
          </span>
          <span className="text-2xl font-bold text-[#13B981] mt-1 block">₹14.85L</span>
          <span className="text-xs text-[#13B981] mt-1 font-medium block">✓ 82.4% Recovery Rate</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Avg. Days Sales Outstanding
          </span>
          <span className="text-2xl font-bold text-[#2F6BFF] mt-1 block">18.4 Days</span>
          <span className="text-xs text-[#2F6BFF] mt-1 font-medium block">↓ 6.2 days faster</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Active Promises on Invoices
          </span>
          <span className="text-2xl font-bold text-[#F59E0B] mt-1 block">6 Commitments</span>
          <span className="text-xs text-[#667085] mt-1 block">₹4.90L Due This Week</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices by number or customer..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            >
              <option value="ALL">All Invoices</option>
              <option value="overdue">Overdue</option>
              <option value="critically_overdue">Critically Overdue</option>
              <option value="approaching_due">Approaching Due</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Aging</th>
                <th className="py-3 px-4">Account Owner</th>
                <th className="py-3 px-4">Autonomous Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {displayedInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-[#FAFBFF] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{inv.customer}</td>
                  <td className="py-3.5 px-4 font-black text-[#111827]">
                    ₹{(inv.amount / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.daysOverdue > 0 ? (
                      <span
                        className={`font-semibold ${
                          inv.daysOverdue >= 20 ? "text-[#E5484D]" : "text-[#F59E0B]"
                        }`}
                      >
                        {inv.daysOverdue} days overdue
                      </span>
                    ) : (
                      <span className="text-[#13B981] font-semibold">Current</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] font-medium">{inv.accountOwner}</td>
                  <td className="py-3.5 px-4">
                    {inv.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Paid & Settled
                      </span>
                    ) : inv.status === "critically_overdue" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E5484D] bg-[#FEECEC] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                        <AlertCircle className="w-3.5 h-3.5" /> Escalated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B3DF5] bg-[#F1EDFF] px-2.5 py-0.5 rounded-full border border-[#5B3DF5]/30">
                        <Mail className="w-3.5 h-3.5" /> In Chasing Cadence
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        alert(`Triggering autonomous reminder for ${inv.invoiceNumber}...`)
                      }
                      className="text-xs font-bold text-[#5B3DF5] hover:underline"
                    >
                      Remind ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
