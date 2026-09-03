"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SubscriptionsPage() {
  const subscriptions = [
    {
      id: "sub_pro_1042",
      customer: "Rahul Sharma",
      plan: "Pro Annual Plan",
      amount: 249900,
      interval: "Annual",
      status: "active",
      nextBilling: "Sep 24, 2026",
    },
    {
      id: "sub_ent_1040",
      customer: "Acme Corp Ltd",
      plan: "Enterprise Suite",
      amount: 1299900,
      interval: "Monthly",
      status: "past_due",
      nextBilling: "Immediate",
    },
    {
      id: "sub_starter_1039",
      customer: "Neha Verma",
      plan: "Starter Monthly",
      amount: 409900,
      interval: "Monthly",
      status: "in_recovery",
      nextBilling: "Retry Scheduled",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Subscriptions"
        subtitle="Recurring billing plans, churn prevention status, and billing cycle telemetry"
      />

      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Billing State</th>
                <th className="py-3 px-4">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {subscriptions.map((sub, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFF]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">
                    {sub.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#111827]">
                    {sub.customer}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#111827]">
                    {sub.plan}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    ₹{(sub.amount / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085]">{sub.interval}</td>
                  <td className="py-3.5 px-4">
                    {sub.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B] bg-[#FFF6E8] px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> At Risk
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085] font-medium">{sub.nextBilling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
