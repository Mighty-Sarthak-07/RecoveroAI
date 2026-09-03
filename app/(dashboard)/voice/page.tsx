"use client";

import React, { useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { PhoneCall, Bot, User, Play, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VoiceRecoveryPage() {
  const [activeTab, setActiveTab] = useState<"TRY_LATER" | "PAY_NOW">("TRY_LATER");
  const [simulating, setSimulating] = useState(false);

  const transcripts = {
    TRY_LATER: [
      { speaker: "agent", text: "Namaste Rahul ji, main RecoveroAI se bol raha hoon. Aapka ₹2,499 ka payment complete nahi ho paya tha.", time: "10:32 AM" },
      { speaker: "customer", text: "Haan, main thoda busy tha. Kal subah karunga pakka.", time: "10:32 AM" },
      { speaker: "agent", text: "Dhanyawad Rahul ji! Main kal subah 10 baje aapko WhatsApp pe link bhej dunga. Have a good day!", time: "10:33 AM" },
    ],
    PAY_NOW: [
      { speaker: "agent", text: "Namaste Priya ji, aapka subscription renew hone me fail hua tha. Kya aap payment dobara try karna chahengi?", time: "11:15 AM" },
      { speaker: "customer", text: "Haan please link bhej dijiye, main abhi UPI se kar deti hoon.", time: "11:15 AM" },
      { speaker: "agent", text: "Instant WhatsApp link aapke number par send kar diya gaya hai. Thank you!", time: "11:16 AM" },
    ],
  };

  const handleStartDemo = (intent: "TRY_LATER" | "PAY_NOW") => {
    setActiveTab(intent);
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      alert(
        intent === "TRY_LATER"
          ? "Voice session completed! Intent detected: TRY_LATER → Promise-to-Pay created for tomorrow."
          : "Voice session completed! Intent detected: PAY_NOW → Instant WhatsApp UPI payment link dispatched."
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Hinglish Voice Recovery"
        subtitle="Empathetic conversational voice agents that understand natural Hindi-English customer intents and schedule commitments"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] border border-[#5B3DF5]/30 flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" /> Voice Agent
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartDemo("TRY_LATER")}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Demo: &ldquo;Kal Karunga&rdquo; (Promise)
            </button>
            <button
              onClick={() => handleStartDemo("PAY_NOW")}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#13B981] bg-[#EAFBF4] hover:bg-[#13B981] hover:text-white rounded-lg transition-colors border border-[#13B981]/30 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo: &ldquo;Abhi Kar Raha Hoon&rdquo; (Pay Now)
            </button>
          </div>
        }
      />

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Eligible Voice Cases
          </span>
          <span className="text-2xl font-bold text-[#111827] mt-1 block">48 Cases</span>
          <span className="text-xs text-[#5B3DF5] mt-1 font-medium block">Consent Verified</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Voice Call Connection Rate
          </span>
          <span className="text-2xl font-bold text-[#13B981] mt-1 block">78.4%</span>
          <span className="text-xs text-[#13B981] mt-1 font-medium block">Within 10AM-7PM IST</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Commitment / Promise Rate
          </span>
          <span className="text-2xl font-bold text-[#2F6BFF] mt-1 block">62.0%</span>
          <span className="text-xs text-[#2F6BFF] mt-1 font-medium block">Transferred to Promise Tracker</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Recovered via Voice Channel
          </span>
          <span className="text-2xl font-bold text-[#13B981] mt-1 block">₹6.45L</span>
          <span className="text-xs text-[#667085] mt-1 block">Cost: ₹10 / completed session</span>
        </div>
      </div>

      {/* Interactive Transcript Viewer & Intent Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transcript Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7EAF0] mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F1EDFF] text-[#5B3DF5] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Live Voice Interaction Transcript</h3>
                <p className="text-xs text-[#667085]">Language: Hinglish (Hindi + English colloquial)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("TRY_LATER")}
                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                  activeTab === "TRY_LATER"
                    ? "bg-[#5B3DF5] text-white border-[#5B3DF5]"
                    : "bg-[#FAFBFF] text-[#667085] border-[#E7EAF0]"
                }`}
              >
                Case A: &ldquo;Kal Karunga&rdquo;
              </button>
              <button
                onClick={() => setActiveTab("PAY_NOW")}
                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                  activeTab === "PAY_NOW"
                    ? "bg-[#13B981] text-white border-[#13B981]"
                    : "bg-[#FAFBFF] text-[#667085] border-[#E7EAF0]"
                }`}
              >
                Case B: &ldquo;Abhi Pay&rdquo;
              </button>
            </div>
          </div>

          {/* Chat Bubbles */}
          <div className="space-y-4 min-h-[220px]">
            {transcripts[activeTab].map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.speaker === "customer" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.speaker === "customer"
                      ? "bg-[#2F6BFF] text-white"
                      : "bg-[#5B3DF5] text-white"
                  }`}
                >
                  {msg.speaker === "customer" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.speaker === "customer"
                      ? "bg-[#EEF4FF] text-[#111827] rounded-tr-none font-medium"
                      : "bg-[#F1EDFF] text-[#111827] rounded-tl-none font-medium"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] text-[#667085] mt-1 block text-right">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Autonomous Intent & Next-Action Chain */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#111827]">Intent &amp; Execution Trace</h3>

          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] space-y-2 text-xs">
            <span className="text-[#667085] block uppercase font-bold text-[10px]">Detected Intent</span>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#5B3DF5] text-base">
                {activeTab === "TRY_LATER" ? "TRY_LATER (Promise Commitment)" : "PAY_NOW (Instant Payment)"}
              </span>
              <span className="text-xs font-bold text-[#13B981] bg-[#EAFBF4] px-2 py-0.5 rounded-full">
                98.4% Confidence
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] space-y-2 text-xs">
            <span className="text-[#667085] block uppercase font-bold text-[10px]">Policy Validation</span>
            <div className="flex items-center gap-2 text-[#13B981] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Consent Verified • Within Allowed Hours (10:32 AM)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EAFBF4] border border-[#13B981]/30 space-y-1.5 text-xs">
            <span className="text-[#13B981] block uppercase font-bold text-[10px]">Autonomous Action Dispatched</span>
            <span className="font-bold text-[#111827] block text-sm">
              {activeTab === "TRY_LATER"
                ? "Promise-to-Pay created for Tomorrow 10:00 AM"
                : "Instant WhatsApp UPI payment link sent"}
            </span>
            <p className="text-[#667085] text-[11px]">
              {activeTab === "TRY_LATER"
                ? "Connected into Promise Tracker. Scheduled morning WhatsApp reminder queued."
                : "Payment link active for 30 minutes."}
            </p>
          </div>

          {activeTab === "TRY_LATER" && (
            <Link
              href="/promises"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B3DF5] hover:underline"
            >
              View in Promise-to-Pay Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
