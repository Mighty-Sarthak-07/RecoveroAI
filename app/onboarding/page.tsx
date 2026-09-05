"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataSourceSelector } from "@/src/components/onboarding/data-source-selector";
import { ShieldCheck, ArrowRight, UserCheck, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [merchantName, setMerchantName] = useState("Acme Payments & Commerce");
  const [merchantEmail, setMerchantEmail] = useState("finance@recoveroai.com");
  const [step, setStep] = useState<"profile" | "datasource">("datasource");

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col font-sans">
      {/* Onboarding Header */}
      <header className="h-16 bg-white border-b border-[#E7EAF0] px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] flex items-center justify-center text-white font-black text-lg shadow-xs">
            R
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#111827]">
            Recovero<span className="text-[#5B3DF5]">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold text-[#667085]">
          <span className="hidden sm:inline">Buildathon Onboarding</span>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] hover:bg-[#5B3DF5] hover:text-white transition-colors"
          >
            Skip to Dashboard →
          </Link>
        </div>
      </header>

      {/* Main Wizard */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Onboarding Breadcrumbs */}
        <div className="flex items-center justify-center gap-3 mb-8 text-xs font-bold">
          <div
            onClick={() => setStep("profile")}
            className={`flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-full ${
              step === "profile"
                ? "bg-[#5B3DF5] text-white"
                : "bg-white border border-[#E7EAF0] text-[#667085]"
            }`}
          >
            <span>1. Merchant Account</span>
          </div>
          <span className="text-[#667085]">→</span>
          <div
            onClick={() => setStep("datasource")}
            className={`flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-full ${
              step === "datasource"
                ? "bg-[#5B3DF5] text-white"
                : "bg-white border border-[#E7EAF0] text-[#667085]"
            }`}
          >
            <span>2. Connect Data Source</span>
          </div>
          <span className="text-[#667085]">→</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7EAF0] text-[#9CA3AF]">
            <span>3. Autonomous Activation</span>
          </div>
        </div>

        {step === "profile" ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E7EAF0] shadow-sm max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#111827]">
                Welcome to RecoveroAI
              </h2>
              <p className="text-xs text-[#667085] mt-1">
                Configure your merchant root tenant before connecting transactions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#111827] block mb-1">
                  Merchant Organization Name
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] block mb-1">
                  Finance Admin Email
                </label>
                <input
                  type="email"
                  value={merchantEmail}
                  onChange={(e) => setMerchantEmail(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] flex items-start gap-2 text-[11px] text-[#667085]">
                <ShieldCheck className="w-4 h-4 text-[#13B981] shrink-0 mt-0.5" />
                <span>
                  RecoveroAI runs autonomous agents within deterministic merchant guardrails (max retries, high-value thresholds, and quiet hours).
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep("datasource")}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Data Source Connection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <DataSourceSelector
            onCompleted={() => {
              window.location.href = "/dashboard";
            }}
          />
        )}
      </main>
    </div>
  );
}
