"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import {
  PhoneCall,
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  Volume2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { VoiceIntent } from "@/src/types/recovery";

interface ChatMessage {
  id: string;
  speaker: "agent" | "customer";
  text: string;
  timestamp: string;
  intent?: VoiceIntent;
  actionExecuted?: string;
}

export default function VoiceRecoveryPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      speaker: "agent",
      text: "Namaste Vikas ji! Main Recovero AI se baat kar raha hu. Aapka invoice #INV-8821 (₹14,500) overdue hai. Kya aap abhi UPI/Card se pay kar sakte hain ya koi madad chahiye?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputSpeech, setInputSpeech] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeIntent, setActiveIntent] = useState<VoiceIntent | "READY">("READY");
  const [lastOutcome, setLastOutcome] = useState<any>(null);
  const [sttError, setSttError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "hi-IN";

        recognition.onstart = () => {
          setIsListening(true);
          setSttError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputSpeech(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            setSttError(`Voice error: ${event.error}. You can type your message below.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Toggle Mic Recording
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSttError("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Text-to-Speech (Agent Spoken Voice Synthesis)
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.includes("hi") || v.lang.includes("IN") || v.name.includes("India")
      );
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Send Customer Speech Message to Backend Voice Agent
  const handleSendMessage = async (textToSend?: string) => {
    const speech = textToSend || inputSpeech;
    if (!speech.trim() || isProcessing) return;

    const userMsgId = `cust-${Date.now()}`;
    const newCustomerMsg: ChatMessage = {
      id: userMsgId,
      speaker: "customer",
      text: speech.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newCustomerMsg]);
    setInputSpeech("");
    setIsProcessing(true);
    setSttError(null);

    try {
      const res = await fetch("/api/recoveries");
      const data = await res.json();
      const cases = data.cases || [];
      const voiceCase = cases.find((c: any) => c.caseType === "voice_recovery") || cases[0];
      const targetCaseId = voiceCase?.id || "ef4b4c53-45a4-4fff-8fa8-45bd7f343c52";

      const callRes = await fetch(`/api/recoveries/${targetCaseId}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptInput: speech.trim(),
        }),
      });

      const callData = await callRes.json();
      setLastOutcome(callData);

      if (callData.detectedIntent) {
        setActiveIntent(callData.detectedIntent);
      }

      const latestAgentTurn = callData.transcript?.find((t: any) => t.speaker === "agent");
      const agentText =
        latestAgentTurn?.text ||
        "Aapki baat samajh gaya hoon. Main system ko update kar raha hoon.";

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        speaker: "agent",
        text: agentText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: callData.detectedIntent,
        actionExecuted: callData.executionMessage,
      };

      setMessages((prev) => [...prev, agentMsg]);
      speakText(agentText);
    } catch (err: any) {
      console.error("Error processing voice message:", err);
      const errorAgentMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        speaker: "agent",
        text: "Maaf kijiye, connectivity issue ki wajah se response process nahi ho paya. Kripya dubara koshish karein.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorAgentMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickUtterances = [
    {
      label: "Bhai link bhej do abhi kar deta hu",
      intent: "PAY_NOW",
    },
    {
      label: "Kal shaam 5 baje tak UPI se kar dunga",
      intent: "TRY_LATER",
    },
    {
      label: "Payment gateway fail ho raha hai, OTP nahi aaya",
      intent: "NEEDS_HELP",
    },
    {
      label: "Abhi mat pareshan karo, me paise nahi dunga",
      intent: "DECLINE",
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title="Hinglish Voice Recovery Agent"
        subtitle="Real-time speech-to-text voice assistant with dynamic Hinglish intent detection, pre-call guardrails, and automated recovery actions."
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1EDFF] text-[#5B3DF5] border border-[#5B3DF5]/30 flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" /> Live Voice Orchestrator
          </span>
        }
      />

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
            Voice Agent Status
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13B981] animate-ping" />
            <span className="text-lg font-extrabold text-[#111827]">Active &amp; Ready</span>
          </div>
          <span className="text-[11px] text-[#5B3DF5] mt-0.5 font-medium block">
            Listening in Hinglish (Hindi + English)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
            Voice Connection Rate
          </span>
          <span className="text-xl font-extrabold text-[#13B981] mt-0.5 block">78.4%</span>
          <span className="text-[11px] text-[#13B981] mt-0.5 font-medium block">Within 10 AM - 7 PM IST</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
            Promise-to-Pay Rate
          </span>
          <span className="text-xl font-extrabold text-[#2F6BFF] mt-0.5 block">62.0%</span>
          <span className="text-[11px] text-[#2F6BFF] mt-0.5 font-medium block">
            Recorded in Promise Tracker
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
            Recovered via Voice
          </span>
          <span className="text-xl font-extrabold text-[#13B981] mt-0.5 block">₹6.45L</span>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Cost: ₹10 per completed call</span>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Real-Time Voice Chat & Mic */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7EAF0] shadow-xs flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#FAFBFF] rounded-t-xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5B3DF5] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#111827] flex items-center gap-2">
                  Recovero AI Voice Agent (Vikas Sharma)
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981] border border-[#13B981]/30">
                    Live Session
                  </span>
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Overdue Invoice #INV-8821 (₹14,500) • Speaks Hinglish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F1EDFF] text-[#5B3DF5] text-[11px] font-bold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" /> Speaking...
                </span>
              ) : (
                <button
                  onClick={() =>
                    speakText(messages[messages.length - 1]?.text || "Hello, how can I help?")
                  }
                  title="Replay Voice Agent Audio"
                  className="p-1.5 rounded-lg border border-[#E7EAF0] hover:bg-[#FAFBFF] text-[#667085] transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions Toolbar (No scrollbar line) */}
          <div className="px-4 py-2 bg-[#FAFBFF] border-b border-[#E7EAF0] flex items-center gap-2 overflow-x-auto shrink-0 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider shrink-0 mr-1">
              Try Speaking:
            </span>
            {quickUtterances.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.label)}
                disabled={isProcessing}
                className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-[#111827] border border-[#E7EAF0] hover:border-[#5B3DF5] hover:text-[#5B3DF5] transition-all shadow-2xs"
              >
                "{item.label}"
              </button>
            ))}
          </div>

          {/* Chat Messages Timeline (Fills space cleanly) */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-[#FFFFFF]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.speaker === "customer" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                    msg.speaker === "customer"
                      ? "bg-[#2F6BFF] text-white"
                      : "bg-[#5B3DF5] text-white"
                  }`}
                >
                  {msg.speaker === "customer" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={`max-w-lg p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.speaker === "customer"
                      ? "bg-[#EEF4FF] text-[#111827] rounded-tr-none font-medium border border-[#2F6BFF]/20"
                      : "bg-[#F1EDFF] text-[#111827] rounded-tl-none font-medium border border-[#5B3DF5]/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] text-[#667085]">
                      {msg.speaker === "customer" ? "You (Customer)" : "Voice Recovery Agent"}
                    </span>
                    <span className="text-[10px] text-[#667085]">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-sm">{msg.text}</p>

                  {msg.actionExecuted && (
                    <div className="mt-2 pt-1.5 border-t border-[#5B3DF5]/20 text-[10px] font-bold text-[#5B3DF5] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Action: {msg.actionExecuted}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#5B3DF5] text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F1EDFF] p-2.5 rounded-xl text-xs font-semibold text-[#5B3DF5] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Understanding speech &amp; classifying Hinglish intent...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* STT Error Notice */}
          {sttError && (
            <div className="px-4 py-1.5 bg-[#FEF2F2] border-t border-[#FEE2E2] text-[11px] font-medium text-[#991B1B] flex items-center gap-2 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {sttError}
            </div>
          )}

          {/* Mic Speech-to-Text & Input Controls */}
          <div className="p-3 px-4 border-t border-[#E7EAF0] bg-[#FAFBFF] rounded-b-xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-[#EF4444] text-white animate-pulse shadow-sm ring-4 ring-[#EF4444]/20"
                    : "bg-[#F1EDFF] text-[#5B3DF5] hover:bg-[#5B3DF5] hover:text-white border border-[#5B3DF5]/30"
                }`}
                title={isListening ? "Stop listening" : "Click mic to speak in Hinglish"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputSpeech}
                onChange={(e) => setInputSpeech(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening to your voice in Hinglish..."
                    : "Speak using mic or type e.g. 'bhai link bhej do abhi kar deta hu'..."
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E7EAF0] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/10 shadow-2xs"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputSpeech.trim() || isProcessing}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                  inputSpeech.trim() && !isProcessing
                    ? "bg-[#5B3DF5] text-white hover:bg-[#4D32D8] shadow-xs"
                    : "bg-[#E7EAF0] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols): Real-Time Intent, Guardrails & Action Output */}
        <div className="lg:col-span-4 h-[520px] overflow-y-auto space-y-3.5 pr-1">
          {/* Active Intent Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Gemini AI Intent Parser
            </span>

            <div className="p-3.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] text-center space-y-1">
              <span className="text-[11px] text-[#667085] font-medium block">Detected Intent</span>
              <div
                className={`text-xl font-extrabold tracking-tight ${
                  activeIntent === "PAY_NOW"
                    ? "text-[#13B981]"
                    : activeIntent === "TRY_LATER"
                    ? "text-[#2F6BFF]"
                    : activeIntent === "DECLINE"
                    ? "text-[#E5484D]"
                    : "text-[#5B3DF5]"
                }`}
              >
                {activeIntent}
              </div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAFBF4] text-[#13B981]">
                Strict Classification Active
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5 text-xs">
              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#FAFBFF]">
                <span className="text-[#667085] text-[11px]">Language</span>
                <span className="font-bold text-[#111827] text-[11px]">Hinglish / Hindi</span>
              </div>
              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#FAFBFF]">
                <span className="text-[#667085] text-[11px]">STT Accuracy</span>
                <span className="font-bold text-[#13B981] text-[11px]">96.8%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#FAFBFF]">
                <span className="text-[#667085] text-[11px]">Execution Mode</span>
                <span className="font-bold text-[#5B3DF5] text-[11px]">Autonomous</span>
              </div>
            </div>
          </div>

          {/* Pre-Call Guardrails Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-[#111827] uppercase tracking-wider">
                Pre-Call Guardrails
              </h4>
              <ShieldCheck className="w-4 h-4 text-[#13B981]" />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-[#EAFBF4] text-[#13B981] font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Customer Consent Verified</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-[#EAFBF4] text-[#13B981] font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Calling Hours (10 AM - 7 PM IST)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-[#EAFBF4] text-[#13B981] font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Frequency &amp; Retry Limits Checked</span>
              </div>
            </div>
          </div>

          {/* Executed Recovery Action Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E7EAF0] shadow-xs space-y-2.5">
            <h4 className="text-[10px] font-bold text-[#111827] uppercase tracking-wider">
              Executed Recovery Action
            </h4>

            {lastOutcome ? (
              <div className="p-3 rounded-xl bg-[#EAFBF4] border border-[#13B981]/30 space-y-1.5 text-xs">
                <span className="text-[#13B981] font-bold block uppercase text-[9px]">
                  Workflow Output
                </span>
                <p className="font-extrabold text-[#111827] text-xs leading-snug">
                  {lastOutcome.executionMessage || "Recovery Action Dispatched"}
                </p>

                {lastOutcome.paymentLink && (
                  <a
                    href={lastOutcome.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-0.5 text-[11px] font-bold text-[#5B3DF5] underline"
                  >
                    View Generated WhatsApp Payment Link
                  </a>
                )}

                <p className="text-[10px] text-[#667085]">
                  Database records, audit logs &amp; recovery cases updated in real-time.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] text-center text-xs text-[#667085] space-y-1">
                <Sparkles className="w-4 h-4 text-[#5B3DF5] mx-auto" />
                <p className="font-bold text-[#111827] text-xs">Waiting for Speech Input</p>
                <p className="text-[10px]">Speak or type to trigger automated recovery actions.</p>
              </div>
            )}

            {activeIntent === "TRY_LATER" && (
              <Link
                href="/promises"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B3DF5] hover:underline pt-0.5 block"
              >
                Open Promise-to-Pay Tracker <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
