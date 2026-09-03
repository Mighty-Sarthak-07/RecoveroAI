"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { Users, UserCheck, ShieldCheck } from "lucide-react";
import { RiskBadge } from "@/src/components/shared/risk-badge";

export default function CustomersPage() {
  const customers = [
    {
      id: "cus_rahul_1042",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      ltv: 3498600,
      riskScore: 35,
      riskLevel: "MEDIUM",
      contactConsent: true,
      recoveryState: "Resolved",
    },
    {
      id: "cus_priya_1041",
      name: "Priya Singh",
      email: "priya.singh@example.com",
      ltv: 1299000,
      riskScore: 25,
      riskLevel: "LOW",
      contactConsent: true,
      recoveryState: "In Outreach",
    },
    {
      id: "cus_acme_1040",
      name: "Acme Corp Ltd",
      email: "finance@acmecorp.in",
      ltv: 15598800,
      riskScore: 75,
      riskLevel: "HIGH",
      contactConsent: true,
      recoveryState: "Escalated",
    },
    {
      id: "cus_vikram_1099",
      name: "Vikram Malhotra",
      email: "vikram.m@enterprise.com",
      ltv: 150000000,
      riskScore: 85,
      riskLevel: "CRITICAL",
      contactConsent: true,
      recoveryState: "Policy Blocked",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customers"
        subtitle="Customer revenue profiles, lifetime value metrics, and recovery risk scoring"
      />

      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Lifetime Value (LTV)</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4">Outreach Consent</th>
                <th className="py-3 px-4">Recovery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {customers.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFF]">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#111827] block">{c.name}</span>
                    <span className="text-[11px] text-[#667085]">{c.email}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#5B3DF5] font-semibold">{c.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    ₹{(c.ltv / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={c.riskLevel} score={c.riskScore} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#13B981]">
                      <UserCheck className="w-3.5 h-3.5" /> Authorized
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#111827]">{c.recoveryState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
