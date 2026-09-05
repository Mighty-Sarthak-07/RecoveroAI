"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Zap,
  Lock,
  CreditCard,
  RefreshCcw,
  RefreshCw,
  ShoppingBag,
  Building2,
  PhoneCall,
  CalendarCheck,
  UserCheck,
  CheckCircle2,
  Calculator,
  Play,
  ShieldAlert,
  Mic,
  Volume2,
  Database,
} from "lucide-react";

// Scroll reveal motion variant helpers
const fadeInUpVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function LandingPage() {
  // Interactive Revenue Leak Calculator State
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(5000000); // ₹50 Lakhs default
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"all" | "b2c" | "b2b">("all");
  const [voiceTestUtterance, setVoiceTestUtterance] = useState<string>("Bhai link bhej do abhi kar deta hu");
  const [voiceDetectedIntent, setVoiceDetectedIntent] = useState<{ intent: string; action: string; color: string }>({
    intent: "PAY_NOW",
    action: "Instant WhatsApp UPI payment link dispatched",
    color: "text-[#13B981] bg-[#EAFBF4]",
  });

  // Calculate Leakage & Projected Recovery
  const estimatedAtRiskMonthly = Math.round(monthlyRevenue * 0.065); // 6.5% failure rate
  const estimatedRecoveredMonthly = Math.round(estimatedAtRiskMonthly * 0.58); // 58% recovery rate
  const annualRecovered = estimatedRecoveredMonthly * 12;

  const handleVoiceSample = (utterance: string, intent: string, action: string, color: string) => {
    setVoiceTestUtterance(utterance);
    setVoiceDetectedIntent({ intent, action, color });
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans selection:bg-[#F1EDFF] selection:text-[#5B3DF5] overflow-x-hidden">
      {/* 1. TOP NAVBAR */}
      <header className="h-20 border-b border-[#E7EAF0] px-4 sm:px-8 lg:px-16 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 transition-all">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#5B3DF5] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#111827]">
              Recovero<span className="text-[#5B3DF5]">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#667085]">
            <a href="#how-it-works" className="hover:text-[#111827] transition-colors">
              Product Overview
            </a>
            <a href="#capabilities" className="hover:text-[#111827] transition-colors">
              7 Workflows
            </a>
            <a href="#calculator" className="hover:text-[#111827] transition-colors">
              ROI Calculator
            </a>
            <a href="#voice-agent" className="hover:text-[#111827] transition-colors">
              Hinglish Voice AI
            </a>
            <a href="#safety" className="hover:text-[#111827] transition-colors">
              Policy Safety
            </a>
            <Link href="/simulation" className="hover:text-[#111827] transition-colors">
              Simulator
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/onboarding"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] hover:bg-[#5B3DF5] hover:text-white text-xs font-bold transition-all border border-[#5B3DF5]/20"
          >
            <Database className="w-3.5 h-3.5" /> Connect Data Source
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION WITH SCROLL REVEAL */}
      <section className="pt-12 sm:pt-16 pb-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text Reveal */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-xs font-bold border border-[#5B3DF5]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#5B3DF5] animate-spin" />
              Autonomous Revenue Recovery Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-[#111827]">
              Revenue you lose is revenue you win back with{" "}
              <span className="text-[#5B3DF5] relative">
                RecoveroAI
                <span className="absolute left-0 bottom-0.5 w-full h-2 bg-[#F1EDFF] -z-10 rounded" />
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
              AI agents that detect revenue leaks across payment failures, overdue B2B invoices, e-mandates, and promises — diagnose root causes with <strong>Google Gemini AI</strong>, evaluate <strong>10 strict merchant guardrails</strong>, and execute multi-channel resolution automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore Command Center <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/simulation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F8FC] text-[#111827] text-sm font-bold border border-[#E7EAF0] transition-colors"
              >
                <Play className="w-4 h-4 text-[#5B3DF5]" /> Run 7-Workflow Simulation
              </Link>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAFBF4] text-[#13B981] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#111827] leading-tight">
                  +34.8% Recovery Uplift
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#111827] leading-tight">
                  Zero Manual Chasing
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#111827] leading-tight">
                  10 Guardrail Safety
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual Card Reveal */}
          <motion.div
            className="lg:col-span-6"
            initial="hidden"
            animate="visible"
            variants={scaleInVariant}
          >
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-xl p-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13B981] animate-ping" />
                  <span className="font-extrabold text-[#111827]">Autonomous Recovery Engine</span>
                </div>
                <span className="font-mono text-[#667085] text-[11px] bg-[#FAFBFF] px-2 py-0.5 rounded border border-[#E7EAF0]">
                  7 Streams Online
                </span>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-3 rounded-xl bg-[#FFF5F5] border border-[#FED7D7]">
                  <span className="text-[10px] uppercase font-bold text-[#E5484D] block">At Risk</span>
                  <span className="text-lg font-black text-[#111827] mt-0.5 block">₹28.20L</span>
                </div>
                <div className="p-3 rounded-xl bg-[#EEF4FF] border border-[#2F6BFF]/20">
                  <span className="text-[10px] uppercase font-bold text-[#2F6BFF] block">Recoverable</span>
                  <span className="text-lg font-black text-[#2F6BFF] mt-0.5 block">₹18.40L</span>
                </div>
                <div className="p-3 rounded-xl bg-[#EAFBF4] border border-[#13B981]/30">
                  <span className="text-[10px] uppercase font-bold text-[#13B981] block">Recovered</span>
                  <span className="text-lg font-black text-[#13B981] mt-0.5 block">₹14.85L</span>
                </div>
              </div>

              {/* Animated Live Case Card */}
              <div className="p-4 rounded-xl bg-[#F1EDFF]/60 border border-[#5B3DF5]/30 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#5B3DF5] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> B2B INVOICE #INV-8500
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981] border border-[#13B981]/30">
                    ✓ ₹85,000 RECOVERED
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111827] block">TechCorp Global India</span>
                    <span className="text-[#667085] text-[11px]">12 days overdue → Autonomous payment reminder</span>
                  </div>
                  <span className="font-mono font-black text-[#5B3DF5]">ROI: 720x</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] text-xs flex items-center justify-between">
                <span className="text-[#667085] font-medium">Policy Guardrail Verification</span>
                <span className="font-bold text-[#13B981] flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#13B981]" /> 10/10 Guardrails Passed
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. PROOF & STATS STRIP REVEAL */}
      <motion.section
        className="py-10 border-y border-[#E7EAF0] bg-[#FAFBFF]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-6">
            Empowering revenue recovery for modern commerce, SaaS subscriptions &amp; B2B enterprises
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs hover:-translate-y-1 transition-transform">
              <span className="text-3xl font-black text-[#5B3DF5] block">34.8%</span>
              <span className="text-xs font-bold text-[#667085] mt-0.5 block">
                Average Recovery Uplift
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs hover:-translate-y-1 transition-transform">
              <span className="text-3xl font-black text-[#111827] block">₹250Cr+</span>
              <span className="text-xs font-bold text-[#667085] mt-0.5 block">
                Revenue Recovered
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs hover:-translate-y-1 transition-transform">
              <span className="text-3xl font-black text-[#2F6BFF] block">1.2M+</span>
              <span className="text-xs font-bold text-[#667085] mt-0.5 block">
                Transactions Analyzed
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7EAF0] shadow-2xs hover:-translate-y-1 transition-transform">
              <span className="text-3xl font-black text-[#13B981] block">100%</span>
              <span className="text-xs font-bold text-[#667085] mt-0.5 block">
                Policy Safety Compliance
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. INTERACTIVE REVENUE LEAK & ROI CALCULATOR REVEAL */}
      <motion.section
        id="calculator"
        className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="bg-[#F1EDFF]/50 border border-[#5B3DF5]/30 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B3DF5] text-white text-xs font-bold">
                <Calculator className="w-3.5 h-3.5" /> Interactive ROI Calculator
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">
                Calculate how much revenue is slipping away
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                On average, 5% to 8% of digital transaction volume leaks through failed renewals, expired cards, un-chased invoices, and broken payment promises.
              </p>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#111827]">
                  Your Monthly Gross Transaction Volume:
                  <span className="text-base font-black text-[#5B3DF5] block mt-0.5">
                    ₹{(monthlyRevenue / 100000).toFixed(1)} Lakhs / month
                  </span>
                </label>

                <input
                  type="range"
                  min={500000}
                  max={50000000}
                  step={500000}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-[#5B3DF5] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-bold text-[#667085]">
                  <span>₹5 Lakhs</span>
                  <span>₹25 Lakhs</span>
                  <span>₹1 Crore</span>
                  <span>₹5 Crores</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E7EAF0] shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5484D]">
                  Estimated Monthly Revenue Leak
                </span>
                <div className="text-2xl font-black text-[#111827]">
                  ₹{(estimatedAtRiskMonthly / 100000).toFixed(2)} Lakhs
                </div>
                <p className="text-[11px] text-[#667085]">
                  Based on standard 6.5% transaction decline &amp; invoice aging rate.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#EAFBF4] border border-[#13B981]/30 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#13B981]">
                  Annual Recoverable Revenue
                </span>
                <div className="text-2xl font-black text-[#13B981]">
                  ₹{(annualRecovered / 100000).toFixed(2)} Lakhs / yr
                </div>
                <p className="text-[11px] text-[#667085]">
                  Won back automatically by RecoveroAI multi-channel agents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. SEVEN UNIFIED RECOVERY CAPABILITIES REVEAL */}
      <motion.section
        id="capabilities"
        className="py-16 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
            Unified Decision Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            7 Autonomous Recovery Workflows
          </h2>
          <p className="text-xs sm:text-sm text-[#667085]">
            Operating under one common state machine, Gemini AI diagnostics, and policy gatekeeper.
          </p>

          {/* Workflow Filter Tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveWorkflowTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeWorkflowTab === "all"
                  ? "bg-[#5B3DF5] text-white shadow-xs"
                  : "bg-[#FAFBFF] text-[#667085] hover:text-[#111827] border border-[#E7EAF0]"
              }`}
            >
              All Workflows (7)
            </button>
            <button
              onClick={() => setActiveWorkflowTab("b2c")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeWorkflowTab === "b2c"
                  ? "bg-[#5B3DF5] text-white shadow-xs"
                  : "bg-[#FAFBFF] text-[#667085] hover:text-[#111827] border border-[#E7EAF0]"
              }`}
            >
              B2C / Payments &amp; Cards
            </button>
            <button
              onClick={() => setActiveWorkflowTab("b2b")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeWorkflowTab === "b2b"
                  ? "bg-[#5B3DF5] text-white shadow-xs"
                  : "bg-[#FAFBFF] text-[#667085] hover:text-[#111827] border border-[#E7EAF0]"
              }`}
            >
              B2B / Invoices &amp; Mandates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Payment Failure */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2c") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">1. Payment Failure Recovery</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> Card/UPI decline or 3DS timeout.<br />
                <strong>AI Action:</strong> Smart scheduled retry &amp; 1-click update link.<br />
                <strong>Outcome:</strong> Verified gateway re-authorization settlement.
              </p>
            </motion.div>
          )}

          {/* 2. Checkout Drop-off */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2c") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">2. Checkout Drop-off Chaser</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> High-intent checkout abandoned at payment step.<br />
                <strong>AI Action:</strong> Instant personalized WhatsApp payment link.<br />
                <strong>Outcome:</strong> Completed checkout conversion.
              </p>
            </motion.div>
          )}

          {/* 3. Subscription Churn */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2c") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF6E8] text-[#F59E0B] flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">3. Involuntary Subscription Churn</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> Expired credit card or recurring charge error.<br />
                <strong>AI Action:</strong> Timed email reminder before grace window ends.<br />
                <strong>Outcome:</strong> Recurring plan preserved.
              </p>
            </motion.div>
          )}

          {/* 4. B2B Receivables Chaser */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2b") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">4. B2B Receivables Chaser</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> Corporate invoice aging 15–60+ days.<br />
                <strong>AI Action:</strong> Context-aware reminder &amp; account owner routing.<br />
                <strong>Outcome:</strong> Timely invoice settlement.
              </p>
            </motion.div>
          )}

          {/* 5. Mandate Retry Sequencer */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2b") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">5. Mandate Retry Sequencer</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> NACH / e-Mandate / UPI AutoPay debit failure.<br />
                <strong>AI Action:</strong> Liquidity-aware retry on salary cycle.<br />
                <strong>Outcome:</strong> Successful mandate re-presentment.
              </p>
            </motion.div>
          )}

          {/* 6. Hinglish Voice Recovery */}
          {(activeWorkflowTab === "all" || activeWorkflowTab === "b2c") && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-xs space-y-3 hover:border-[#5B3DF5] hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">6. Hinglish Voice Agent</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                <strong>Trigger:</strong> High-touch unpaid case requiring verbal contact.<br />
                <strong>AI Action:</strong> Empathetic Hinglish call with STT &amp; TTS.<br />
                <strong>Outcome:</strong> Verbal commitment captured.
              </p>
            </motion.div>
          )}

          {/* 7. Promise-to-Pay Tracker */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#EAFBF4] p-5 rounded-2xl border border-[#13B981]/30 space-y-2.5 md:col-span-2 lg:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#13B981] flex items-center justify-center shadow-xs">
                  <CalendarCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">7. Promise-to-Pay Tracker</h3>
                  <span className="text-[11px] font-semibold text-[#13B981]">Unified Commitment Ledger</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#13B981] border border-[#13B981]/30">
                84.2% Fulfillment
              </span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Automated reminder dispatches on customer-promised dates via WhatsApp/Voice, with 24h grace period before human escalation.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. HINGLISH VOICE RECOVERY INTERACTIVE PREVIEW REVEAL */}
      <motion.section
        id="voice-agent"
        className="py-16 bg-[#FAFBFF] border-y border-[#E7EAF0]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5] flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Phase 4 Conversational Voice Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">
                Empathetic Hinglish Voice Recovery
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                When digital notifications go unanswered, RecoveroAI initiates an autonomous Hinglish voice session. Speech is transcribed in real-time, parsed by Google Gemini, and executed under strict calling hour guardrails (10 AM - 7 PM IST).
              </p>

              <div className="space-y-2 pt-1 text-xs">
                <span className="font-bold text-[#111827] block">Test Customer Utterances:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleVoiceSample(
                        "Bhai link bhej do abhi kar deta hu",
                        "PAY_NOW",
                        "Instant WhatsApp UPI payment link dispatched",
                        "text-[#13B981] bg-[#EAFBF4]"
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E7EAF0] hover:border-[#5B3DF5] hover:text-[#5B3DF5] transition-all shadow-2xs"
                  >
                    "Bhai link bhej do abhi kar deta hu"
                  </button>

                  <button
                    onClick={() =>
                      handleVoiceSample(
                        "Bhai kal shaam 5 baje tak UPI se kar dunga",
                        "TRY_LATER",
                        "Promise-to-Pay created for tomorrow 5:00 PM",
                        "text-[#2F6BFF] bg-[#EEF4FF]"
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E7EAF0] hover:border-[#5B3DF5] hover:text-[#5B3DF5] transition-all shadow-2xs"
                  >
                    "Bhai kal shaam 5 baje tak kar dunga"
                  </button>

                  <button
                    onClick={() =>
                      handleVoiceSample(
                        "Mujhe paise nahi dena, phone mat karo",
                        "DECLINE",
                        "Outreach stopped & added to customer stop-list",
                        "text-[#E5484D] bg-[#FFF5F5]"
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E7EAF0] hover:border-[#5B3DF5] hover:text-[#5B3DF5] transition-all shadow-2xs"
                  >
                    "Mujhe paise nahi dena, phone mat karo"
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E7EAF0] shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7EAF0] text-xs">
                <span className="font-bold text-[#111827] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#5B3DF5]" /> Hinglish Speech Transcript
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${voiceDetectedIntent.color}`}>
                  Intent: {voiceDetectedIntent.intent}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F1EDFF] text-[#111827] font-medium">
                  <strong>Voice Agent:</strong> Namaste Vikas ji! Main Recovero AI se bol raha hu. Overdue invoice (₹14,500) ke regarding call kiya hai.
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF4FF] text-[#111827] font-medium text-right ml-6">
                  <strong>You (Customer):</strong> "{voiceTestUtterance}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#667085] uppercase block">
                  Gemini Intent Outcome Action
                </span>
                <p className="font-extrabold text-[#111827]">{voiceDetectedIntent.action}</p>
              </div>

              <Link
                href="/voice"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5B3DF5] hover:underline pt-1"
              >
                Try Speech-to-Text Mic in Voice Command Center <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 7. POLICY SAFETY & 10 GUARDRAILS REVEAL */}
      <motion.section
        id="safety"
        className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#13B981]" /> Deterministic Merchant Guardrails
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              AI recommends. Your policies decide.
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              We never let non-deterministic LLMs directly execute database updates or charges.
              Every candidate action must satisfy 10 hard policy rules before execution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
                <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0" />
                <span className="font-semibold text-[#111827]">Customer Consent Verified</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
                <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0" />
                <span className="font-semibold text-[#111827]">Calling Hours (10 AM - 7 PM IST)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
                <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0" />
                <span className="font-semibold text-[#111827]">Contact Frequency Cap</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
                <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0" />
                <span className="font-semibold text-[#111827]">High-Value Escalate &gt; ₹1L</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#FFF5F5] p-6 rounded-2xl border border-[#FED7D7] shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#E5484D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Safety Kill Switch Triggered
                </span>
                <span className="text-xs font-bold bg-white text-[#E5484D] px-2.5 py-0.5 rounded-full border border-[#FED7D7]">
                  ACTION BLOCKED
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7EAF0] text-xs space-y-2">
                <div className="flex justify-between font-mono font-bold">
                  <span className="text-[#111827]">Vikram Malhotra</span>
                  <span className="text-[#E5484D]">₹200,000 AT RISK</span>
                </div>
                <p className="text-[#667085]">
                  AI Suggested: <span className="font-semibold text-[#111827]">IMMEDIATE_RETRY</span>
                </p>
                <div className="p-2.5 rounded bg-[#FFF5F5] text-[#E5484D] font-semibold text-[11px] border border-[#FED7D7]">
                  ✗ Blocked: High-Value Threshold Exceeded (&gt; ₹100,000) &amp; Max Retries Exceeded (4)
                </div>
              </div>

              <p className="text-xs text-[#667085]">
                The workflow safely freezes and escalates to a human operator. Money is never moved without explicit policy clearance.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 8. FINAL CALL TO ACTION REVEAL */}
      <motion.section
        className="py-20 px-4 sm:px-8 lg:px-16 bg-[#5B3DF5] text-white text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUpVariant}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
            Autonomous Revenue Recovery
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Stop watching revenue disappear. Win it back.
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Experience the full multi-channel autonomous recovery engine with live telemetry, deterministic policy safety, and verified settlement.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-[#FAFBFF] text-[#5B3DF5] text-sm font-extrabold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Open Recovery Command Center <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-sm font-bold border border-white/30 transition-all"
            >
              <Database className="w-4 h-4" /> Connect Data Source
            </Link>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="py-8 px-6 lg:px-16 border-t border-[#E7EAF0] text-center text-xs text-[#667085]">
        <p>© 2026 RecoveroAI. Autonomous Revenue Recovery Decision &amp; Execution Engine.</p>
      </footer>
    </div>
  );
}
