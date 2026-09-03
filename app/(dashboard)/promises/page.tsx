"use client";

import React, { useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { CalendarCheck, Search, CheckCircle2, Clock, AlertTriangle, XCircle, Plus, ArrowUpRight } from "lucide-react";

export default function PromisesPage() {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const staticPromises = [
    {
      id: "ptp_1042",
      customer: "Rahul Sharma",
      amount: 249900, // ₹2,499
      promisedDate: "Tomorrow, 10:00 AM",
      status: "DUE_SOON",
      channel: "Voice (Hinglish)",
      invoiceRef: "RV-1042",
      lastContact: "Today 10:32 AM",
      nextAction: "Auto-reminder in 18 hrs",
    },
    {
      id: "ptp_8500",
      customer: "TechCorp Global India",
      amount: 8500000, // ₹85,000
      promisedDate: "Today, 5:00 PM",
      status: "DUE_TODAY",
      channel: "WhatsApp",
      invoiceRef: "INV-2026-8500",
      lastContact: "Yesterday 4:00 PM",
      nextAction: "RTGS verification queued",
    },
    {
      id: "ptp_3400",
      customer: "Apex Retail Solutions",
      amount: 5200000, // ₹52,000
      promisedDate: "Aug 30, 2026",
      status: "FULFILLED",
      channel: "Email",
      invoiceRef: "INV-2026-3400",
      lastContact: "Aug 30, 2:15 PM",
      nextAction: "Verified & Closed",
    },
    {
      id: "ptp_1099",
      customer: "Vikram Malhotra",
      amount: 20000000, // ₹200,000
      promisedDate: "Aug 28, 2026",
      status: "BROKEN",
      channel: "Agent",
      invoiceRef: "INV-2026-1099",
      lastContact: "3 days ago",
      nextAction: "Escalated to Legal",
    },
  ];

  const filtered = staticPromises.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Promise-to-Pay Tracker"
        subtitle="Track, remind, verify, and escalate verbal and digital customer payment commitments"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981] border border-[#13B981]/30 flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5" /> Commitment Tracker
          </span>
        }
        actions={
          <button
            onClick={() => alert("Promise commitment recording modal opened!")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + Record Promise
          </button>
        }
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Active Commitments
          </span>
          <span className="text-2xl font-bold text-[#111827] mt-1 block">18 Promises</span>
          <span className="text-xs text-[#2F6BFF] mt-1 font-medium block">₹12.40L Committed Value</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Fulfilled Promises
          </span>
          <span className="text-2xl font-bold text-[#13B981] mt-1 block">84.2%</span>
          <span className="text-xs text-[#13B981] mt-1 font-medium block">✓ Verified Settlement</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Due Today
          </span>
          <span className="text-2xl font-bold text-[#F59E0B] mt-1 block">4 Promises</span>
          <span className="text-xs text-[#F59E0B] mt-1 font-medium block">Auto-reminders dispatched</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Broken Commitments
          </span>
          <span className="text-2xl font-bold text-[#E5484D] mt-1 block">2 Broken</span>
          <span className="text-xs text-[#E5484D] mt-1 font-medium block">Auto-escalation active</span>
        </div>
      </div>

      {/* Promises Table */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search promises by customer or ref..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "DUE_TODAY", "DUE_SOON", "FULFILLED", "BROKEN"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === status
                    ? "bg-[#5B3DF5] text-white border-[#5B3DF5]"
                    : "bg-[#FAFBFF] text-[#667085] border-[#E7EAF0] hover:bg-white"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Promised Amount</th>
                <th className="py-3 px-4">Promised Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAFBFF]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{p.customer}</td>
                  <td className="py-3.5 px-4 font-black text-[#111827]">
                    ₹{(p.amount / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#111827]">{p.promisedDate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">{p.invoiceRef}</td>
                  <td className="py-3.5 px-4 text-[#667085]">{p.channel}</td>
                  <td className="py-3.5 px-4">
                    {p.status === "FULFILLED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                      </span>
                    ) : p.status === "DUE_TODAY" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B] bg-[#FFF6E8] px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                        <Clock className="w-3.5 h-3.5" /> Due Today
                      </span>
                    ) : p.status === "BROKEN" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E5484D] bg-[#FEECEC] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                        <XCircle className="w-3.5 h-3.5" /> Broken
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6BFF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full border border-[#2F6BFF]/30">
                        <Clock className="w-3.5 h-3.5" /> Due Soon
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] font-medium">{p.nextAction}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Checking settlement status for ${p.customer}...`)}
                      className="text-xs font-bold text-[#5B3DF5] hover:underline"
                    >
                      Verify ↗
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
