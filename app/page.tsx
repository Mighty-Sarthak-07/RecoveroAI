import React from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans selection:bg-[#F1EDFF] selection:text-[#5B3DF5]">
      {/* 1. TOP NAVBAR */}
      <header className="h-20 border-b border-[#E7EAF0] px-6 lg:px-16 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B3DF5] flex items-center justify-center text-white font-black text-xl shadow-xs">
              R
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#111827]">
              Recovero<span className="text-[#5B3DF5]">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#667085]">
            <Link href="#how-it-works" className="hover:text-[#111827] transition-colors">
              Product
            </Link>
            <Link href="#capabilities" className="hover:text-[#111827] transition-colors">
              7 Workflows
            </Link>
            <Link href="#safety" className="hover:text-[#111827] transition-colors">
              Safety &amp; Policy
            </Link>
            <Link href="/simulation" className="hover:text-[#111827] transition-colors">
              Simulation
            </Link>
            <Link href="/dashboard" className="hover:text-[#111827] transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#111827] hover:text-[#5B3DF5] px-3 py-2 transition-colors hidden sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-sm font-bold transition-all shadow-sm"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 px-6 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-xs font-bold border border-[#5B3DF5]/20">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Revenue Recovery Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-[#111827]">
              Revenue you lose is revenue you earn back with{" "}
              <span className="text-[#5B3DF5]">RecoveroAI</span>
            </h1>

            <p className="text-base text-[#667085] leading-relaxed max-w-xl">
              AI agents that detect revenue at risk across payments, overdue invoices, mandates, and promises — diagnose root causes, decide optimal interventions, and execute within merchant-defined policy guardrails.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                Explore Recovery Command Center <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/simulation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F8FC] text-[#111827] text-sm font-bold border border-[#E7EAF0] transition-colors"
              >
                Run 7-Workflow Simulation
              </Link>
            </div>

            {/* Benefit indicators */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E7EAF0]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EAFBF4] text-[#13B981] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#111827] leading-tight">
                  Increase recovery rate
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#111827] leading-tight">
                  Reduce manual effort
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#111827] leading-tight">
                  Policy controlled
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-xl p-5 relative overflow-hidden bg-radial from-[#FAFBFF] to-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13B981] animate-pulse" />
                  <span className="font-bold text-[#111827]">Live Recovery Command Center</span>
                </div>
                <span className="font-mono text-[#667085] text-[11px]">7 Workflows Online</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E7EAF0]">
                  <span className="text-[10px] uppercase font-bold text-[#667085] block">At Risk</span>
                  <span className="text-lg font-black text-[#111827] mt-0.5 block">₹28.20L</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#E7EAF0]">
                  <span className="text-[10px] uppercase font-bold text-[#667085] block">Recoverable</span>
                  <span className="text-lg font-black text-[#2F6BFF] mt-0.5 block">₹18.40L</span>
                </div>
                <div className="p-3 rounded-xl bg-[#EAFBF4] border border-[#13B981]/30">
                  <span className="text-[10px] uppercase font-bold text-[#13B981] block">Recovered</span>
                  <span className="text-lg font-black text-[#13B981] mt-0.5 block">₹14.85L</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F1EDFF]/50 border border-[#5B3DF5]/30 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#5B3DF5]">B2B INVOICE #INV-8500</span>
                  <span className="text-[11px] font-bold text-[#13B981] bg-white px-2 py-0.5 rounded-full border border-[#13B981]/30">
                    ✓ ₹85,000 RECOVERED
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111827] block">TechCorp Global India</span>
                    <span className="text-[#667085] text-[11px]">12 days overdue → Autonomous payment reminder</span>
                  </div>
                  <span className="font-mono font-bold text-[#5B3DF5]">ROI: 720x</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] text-xs flex items-center justify-between">
                <span className="text-[#667085]">Deterministic Policy Checks</span>
                <span className="font-bold text-[#13B981] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 7/7 Rules Passed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROOF & TRUSTED BRANDS */}
      <section className="py-12 border-y border-[#E7EAF0] bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-[#667085] mb-6">
            Trusted by forward-thinking revenue teams across high-growth commerce &amp; B2B SaaS
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center pt-4">
            <div>
              <span className="text-3xl font-black text-[#5B3DF5] block">34.8%</span>
              <span className="text-xs font-semibold text-[#667085] mt-1 block">
                Average recovery uplift
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#111827] block">₹250Cr+</span>
              <span className="text-xs font-semibold text-[#667085] mt-1 block">
                Revenue recovered
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#2F6BFF] block">1.2M+</span>
              <span className="text-xs font-semibold text-[#667085] mt-1 block">
                Customers protected
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#13B981] block">99.99%</span>
              <span className="text-xs font-semibold text-[#667085] mt-1 block">
                Policy compliance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEVEN UNIFIED RECOVERY CAPABILITIES */}
      <section id="capabilities" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
            Unified Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Recover revenue across every critical failure point
          </h2>
          <p className="text-sm text-[#667085]">
            Seven specialized workflows operating through one common deterministic recovery engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Payment Recovery */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">1. Payment Recovery</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Insufficient funds, 3DS decline, or gateway drop-off.<br />
              <strong>AI Action:</strong> Smart scheduled retry &amp; 1-click update link.<br />
              <strong>Outcome:</strong> Verified gateway re-authorization settlement.
            </p>
          </div>

          {/* 2. Checkout Recovery */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">2. Checkout Recovery</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> High-intent cart abandoned during payment step.<br />
              <strong>AI Action:</strong> Instant personalized WhatsApp link.<br />
              <strong>Outcome:</strong> Completed checkout conversion.
            </p>
          </div>

          {/* 3. Subscription Recovery */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#FFF6E8] text-[#F59E0B] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">3. Subscription Recovery</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Involuntary churn from card expiration.<br />
              <strong>AI Action:</strong> Timed email reminder before grace window ends.<br />
              <strong>Outcome:</strong> Recurring plan preserved.
            </p>
          </div>

          {/* 4. B2B Receivables Chaser */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">4. B2B Receivables Chaser</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Overdue invoice aging beyond 15–30 days.<br />
              <strong>AI Action:</strong> Context-aware reminder &amp; account owner routing.<br />
              <strong>Outcome:</strong> Timely invoice payment settlement.
            </p>
          </div>

          {/* 5. Mandate Retry Sequencer */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#2F6BFF] flex items-center justify-center">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">5. Mandate Retry Sequencer</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Recurring AutoPay / NACH mandate debit failure.<br />
              <strong>AI Action:</strong> 3-attempt sequence with 6h/24h bank cooling.<br />
              <strong>Outcome:</strong> Successful recurring debit re-presentment.
            </p>
          </div>

          {/* 6. Hinglish Voice Recovery */}
          <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-[#E7EAF0] space-y-3 hover:border-[#5B3DF5]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">6. Hinglish Voice Recovery</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Customer unanswered on text notifications.<br />
              <strong>AI Action:</strong> Empathetic Hinglish call to detect intent.<br />
              <strong>Outcome:</strong> Verbal commitment routed into Promise Tracker.
            </p>
          </div>

          {/* 7. Promise-to-Pay Tracker */}
          <div className="bg-[#EAFBF4] p-6 rounded-2xl border border-[#13B981]/30 space-y-3 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#13B981] flex items-center justify-center shadow-xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">7. Promise-to-Pay Tracker</h3>
                <span className="text-xs font-semibold text-[#13B981]">Unified Commitment Ledger</span>
              </div>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              <strong>Problem:</strong> Unfulfilled verbal or digital payment promises causing revenue leakage.<br />
              <strong>AI Action:</strong> Scheduled morning reminders on promised due date &amp; automated broken promise escalation.<br />
              <strong>Outcome:</strong> 84.2% verified fulfillment rate.
            </p>
          </div>
        </div>
      </section>

      {/* 5. POLICY SAFETY & KILL SWITCH */}
      <section id="safety" className="py-20 bg-[#F7F8FC] border-y border-[#E7EAF0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
                Deterministic Safety
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                AI recommends. Your policies decide.
              </h2>
              <p className="text-sm text-[#667085] leading-relaxed">
                We never let non-deterministic models directly touch payments or execute arbitrary SQL.
                Every candidate action must pass through 7 strict deterministic merchant guardrails.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E7EAF0]">
                  <ShieldCheck className="w-4 h-4 text-[#13B981] shrink-0" />
                  <span className="font-semibold text-[#111827]">
                    Rule 1: Hard retry limits prevent card network penalty fees
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E7EAF0]">
                  <Lock className="w-4 h-4 text-[#5B3DF5] shrink-0" />
                  <span className="font-semibold text-[#111827]">
                    Rule 2: High-value transactions automatically require human authorization
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E7EAF0]">
                  <UserCheck className="w-4 h-4 text-[#2F6BFF] shrink-0" />
                  <span className="font-semibold text-[#111827]">
                    Rule 4: Customer communication consent strictly honored
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#FEECEC]/50 p-6 rounded-2xl border border-[#E5484D]/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#E5484D] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Policy Kill Switch in Action
                  </span>
                  <span className="text-xs font-bold bg-white text-[#E5484D] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                    ACTION BLOCKED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E7EAF0] text-xs space-y-2">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-[#111827]">Vikram Malhotra</span>
                    <span className="text-[#E5484D]">₹200,000 AT RISK</span>
                  </div>
                  <p className="text-[#667085]">
                    AI suggested: <span className="font-semibold text-[#111827]">IMMEDIATE_RETRY</span>
                  </p>
                  <div className="p-2.5 rounded bg-[#FEECEC] text-[#E5484D] font-semibold text-[11px]">
                    ✗ Blocked: High-Value Threshold Exceeded (&gt; ₹100,000) &amp; Max Retries Exceeded (4)
                  </div>
                </div>

                <p className="text-xs text-[#667085]">
                  The workflow safely freezes. Money is never moved without explicit operator review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="py-20 px-6 lg:px-16 bg-[#F1EDFF] border-t border-[#5B3DF5]/20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Stop watching revenue disappear. <span className="text-[#5B3DF5]">Recover it.</span>
          </h2>
          <p className="text-sm text-[#667085] max-w-xl mx-auto">
            Experience the autonomous revenue recovery engine with live telemetry, deterministic policy safety, and verified settlement.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-base font-bold transition-all shadow-md hover:shadow-lg"
            >
              Open Recovery Command Center <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 lg:px-16 border-t border-[#E7EAF0] text-center text-xs text-[#667085]">
        <p>© 2026 RecoveroAI. Autonomous Revenue Recovery Decision and Execution Engine.</p>
      </footer>
    </div>
  );
}
