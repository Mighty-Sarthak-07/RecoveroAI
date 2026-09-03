"use client";

import React, { useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { RefreshCcw, CheckCircle2, Clock, AlertTriangle, Play, ShieldAlert } from "lucide-react";

export default function MandatesPage() {
  const [mandatesList, setMandatesList] = useState([
    {
      id: "md_1042",
      mandateReference: "MD-2026-1042",
      customer: "Rahul Sharma",
      amount: 249900,
      frequency: "Monthly",
      status: "retrying",
      attempts: [
        { attempt: 1, status: "failed", reason: "insufficient_funds", time: "6 hrs ago" },
        { attempt: 2, status: "scheduled", reason: null, time: "in 2 hrs" },
        { attempt: 3, status: "pending", reason: null, time: "in 26 hrs" },
      ],
      nextDebit: "in 2 hours",
      caseId: "case_md_1042",
    },
    {
      id: "md_8910",
      mandateReference: "MD-2026-8910",
      customer: "Ananya Iyer",
      amount: 499900,
      frequency: "Monthly",
      status: "recovered",
      attempts: [
        { attempt: 1, status: "failed", reason: "debit_failed_issuer", time: "2 days ago" },
        { attempt: 2, status: "succeeded", reason: "settled", time: "1 day ago" },
      ],
      nextDebit: "Completed",
      caseId: "case_md_8910",
    },
    {
      id: "md_5500",
      mandateReference: "MD-2026-5500",
      customer: "Rohan Mehta",
      amount: 1499900,
      frequency: "Quarterly",
      status: "exhausted",
      attempts: [
        { attempt: 1, status: "failed", reason: "limit_exceeded", time: "3 days ago" },
        { attempt: 2, status: "failed", reason: "limit_exceeded", time: "2 days ago" },
        { attempt: 3, status: "failed", reason: "limit_exceeded", time: "1 day ago" },
      ],
      nextDebit: "Escalated to Human",
      caseId: "case_md_5500",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Mandate Retry Sequencer"
        subtitle="Intelligent cooling-period scheduling and multi-attempt recovery for e-Mandates, NACH, and UPI AutoPay"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#2F6BFF] border border-[#2F6BFF]/30 flex items-center gap-1">
            <RefreshCcw className="w-3.5 h-3.5" /> Mandate Engine
          </span>
        }
      />

      {/* Hero Mandate Sequence Card Example */}
      <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7EAF0] mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#5B3DF5] bg-[#F1EDFF] px-2.5 py-1 rounded-md">
              FEATURED MANDATE #MD-1042
            </span>
            <h2 className="text-xl font-bold text-[#111827] mt-2">
              Rahul Sharma • ₹2,499 Monthly AutoPay
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Sequence Rule: 3 attempts max with dynamic 6h / 24h bank cooling windows
            </p>
          </div>
          <button
            onClick={() => alert("Mandate attempt #2 manually triggered!")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Trigger Next Attempt
          </button>
        </div>

        {/* Retry Sequencer Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FEECEC]/50 border border-[#E5484D]/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#111827]">Attempt 1</span>
              <span className="text-[11px] font-bold text-[#E5484D]">FAILED</span>
            </div>
            <span className="text-xs text-[#667085] block">Insufficient funds</span>
            <span className="text-[10px] text-[#667085] mt-2 block">Executed: 6 hrs ago</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F1EDFF] border border-[#5B3DF5]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#5B3DF5]">Attempt 2</span>
              <span className="text-[11px] font-bold text-[#5B3DF5] animate-pulse">SCHEDULED</span>
            </div>
            <span className="text-xs text-[#111827] font-semibold block">In 2 hours (Cooling)</span>
            <span className="text-[10px] text-[#5B3DF5] mt-2 block">Auto-reauthorization</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] opacity-60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#667085]">Attempt 3</span>
              <span className="text-[11px] font-bold text-[#667085]">PENDING</span>
            </div>
            <span className="text-xs text-[#667085] block">With WhatsApp notice</span>
            <span className="text-[10px] text-[#667085] mt-2 block">Scheduled: In 26 hours</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] opacity-60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#667085]">Human Escalation</span>
              <span className="text-[11px] font-bold text-[#667085]">NOT REQUIRED</span>
            </div>
            <span className="text-xs text-[#667085] block">Only if 3 attempts fail</span>
            <span className="text-[10px] text-[#667085] mt-2 block">Policy guardrail active</span>
          </div>
        </div>
      </div>

      {/* Mandates Table */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Mandate Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Current Sequence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {mandatesList.map((m) => (
                <tr key={m.id} className="hover:bg-[#FAFBFF]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">
                    {m.mandateReference}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">{m.customer}</td>
                  <td className="py-3.5 px-4 font-black text-[#111827]">
                    ₹{(m.amount / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085]">{m.frequency}</td>
                  <td className="py-3.5 px-4 font-medium text-[#111827]">
                    Attempt {m.attempts.length} / 3 • {m.nextDebit}
                  </td>
                  <td className="py-3.5 px-4">
                    {m.status === "recovered" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                      </span>
                    ) : m.status === "exhausted" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E5484D] bg-[#FEECEC] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Retries Exhausted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6BFF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full border border-[#2F6BFF]/30">
                        <Clock className="w-3.5 h-3.5" /> Sequencing Retries
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Inspecting Mandate Sequence ${m.mandateReference}...`)}
                      className="text-xs font-bold text-[#5B3DF5] hover:underline"
                    >
                      Sequence ↗
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
