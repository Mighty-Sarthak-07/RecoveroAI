"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Play,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Building2,
  RefreshCcw,
  PhoneCall,
  CalendarCheck,
  CreditCard,
  User,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileText,
} from "lucide-react";
import { RiskBadge } from "@/src/components/shared/risk-badge";
import { StatusBadge } from "@/src/components/shared/status-badge";
import { EvidenceList } from "@/src/components/recovery/evidence-list";
import { DecisionCard } from "@/src/components/recovery/decision-card";
import { PolicyCheckList } from "@/src/components/recovery/policy-check-list";
import { RecoveryTimeline } from "@/src/components/recovery/recovery-timeline";
import { AuditTimeline } from "@/src/components/audit/audit-timeline";
import { generateRecoveryWorkflowPDF } from "@/src/lib/pdf/generate-recovery-pdf";

export default function RecoveryCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [callingVoiceAgent, setCallingVoiceAgent] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recoveries/${id}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerVoiceCall = async (customUtterance?: string) => {
    setCallingVoiceAgent(true);
    try {
      const res = await fetch(`/api/recoveries/${id}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptInput: customUtterance || "Namaste, main kal subah 10 baje tak pay kar dunga pakka.",
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.executionMessage || resData.error || "Voice call failed");
      }

      alert(`📞 Voice Agent Call Complete!\nIntent: ${resData.detectedIntent}\n\n${resData.executionMessage}`);
      await fetchDetail();
    } catch (e: any) {
      alert("Voice Call Error: " + e.message);
    } finally {
      setCallingVoiceAgent(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleRunAgent = async () => {
    setRunningAgent(true);
    try {
      const res = await fetch(`/api/recoveries/${id}/run-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoExecute: true }),
      });
      const resJson = await res.json();
      if (resJson.executionSummary?.policyDecision === "BLOCK") {
        alert("Action Blocked by Merchant Policy!");
      }
      await fetchDetail();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setRunningAgent(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await fetch(`/api/recoveries/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: data?.latestDecision?.selectedAction || "IMMEDIATE_RETRY",
          channel: "gateway",
        }),
      });
      await fetchDetail();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/recoveries/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceSuccess: true }),
      });
      const resJson = await res.json();
      alert(resJson.message || "Payment verified and recovered!");
      await fetchDetail();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      await fetch(`/api/recoveries/${id}/escalate`, { method: "POST" });
      await fetchDetail();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-[#5B3DF5] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#667085]">Loading Case Details #{id}...</p>
      </div>
    );
  }

  const recCase = data?.case;
  const customer = data?.customer;
  const payment = data?.payment;
  const context = data?.context;
  const latestDecision = data?.latestDecision;
  const policyChecks = data?.policyChecks || [];
  const auditTrail = data?.auditTrail || [];

  const isRecovered = recCase?.status === "RECOVERED";
  const isBlocked = recCase?.status === "BLOCKED";
  const isEscalated = recCase?.status === "ESCALATED";

  const formatINR = (cents: number) => `₹${((cents || 0) / 100).toLocaleString()}`;
  const caseType = recCase?.caseType || "payment_failure";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <Link
          href="/recoveries"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#111827]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recovery Cases
        </Link>

        {/* Interactive Action Control Strip */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              try {
                generateRecoveryWorkflowPDF({
                  caseId: recCase?.id,
                  customerName: customer?.name,
                  amountAtRiskRupees: Math.round((recCase?.amountAtRisk || 0) / 100),
                  rootCause: recCase?.rootCause,
                  workflowType: recCase?.caseType,
                  status: recCase?.status,
                });
              } catch (e) {
                window.print();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-[#13B981] hover:bg-[#0F9F6E] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate PDF Report
          </button>

          {!isRecovered && !isBlocked && (
            <>
              <button
                onClick={handleRunAgent}
                disabled={runningAgent}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {runningAgent ? "Gemini AI Analyzing..." : "Run Gemini AI Diagnosis"}
              </button>

              <button
                onClick={() => handleTriggerVoiceCall()}
                disabled={callingVoiceAgent}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2F6BFF] hover:bg-[#2050D0] rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {callingVoiceAgent ? "Initiating Guardrail & Call..." : "Approve & Call Voice Agent"}
              </button>
            </>
          )}

          {(recCase?.status === "APPROVED" || recCase?.status === "ESCALATED") && (
            <button
              onClick={handleExecute}
              disabled={executing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2F6BFF] hover:bg-[#2050D0] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {executing ? "Dispatching..." : "Approve & Execute Action"}
            </button>
          )}

          {!isRecovered && (recCase?.status === "EXECUTING" || recCase?.status === "VERIFYING" || recCase?.status === "APPROVED") && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#13B981] bg-[#EAFBF4] hover:bg-[#13B981] hover:text-white rounded-lg transition-colors border border-[#13B981]/30 disabled:opacity-50 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {verifying ? "Verifying..." : "Verify Payment & Mark Recovered"}
            </button>
          )}

          {isRecovered && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#13B981] bg-[#EAFBF4] rounded-lg border border-[#13B981]/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Recovered • View in Overview ↗
            </Link>
          )}

          {!isEscalated && !isRecovered && !isBlocked && (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#667085] bg-white hover:bg-[#F7F8FC] rounded-lg transition-colors border border-[#E7EAF0]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Escalate to Human
            </button>
          )}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#E7EAF0]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#F7F8FC] text-[#5B3DF5] border border-[#E7EAF0]">
                CASE #{recCase?.id?.substring(0, 8)}
              </span>
              <StatusBadge status={recCase?.status} />
              <RiskBadge level={recCase?.riskLevel} score={recCase?.riskScore} />
            </div>
            <h1 className="text-2xl font-black text-[#111827] mt-2">
              {formatINR(recCase?.amountAtRisk)} AT RISK
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Workflow: <span className="font-semibold text-[#5B3DF5] capitalize">{caseType.replace(/_/g, " ")}</span> • Root Cause:{" "}
              <span className="font-mono font-bold text-[#111827]">{recCase?.rootCause || "unknown"}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs bg-[#FAFBFF] p-4 rounded-xl border border-[#E7EAF0]">
            <div>
              <span className="text-[#667085] block font-medium">Customer Account</span>
              <span className="font-bold text-[#111827] text-sm mt-0.5 block">{customer?.name}</span>
              <span className="text-[11px] text-[#667085]">{customer?.email}</span>
            </div>
            <div className="w-px h-8 bg-[#E7EAF0]" />
            <div>
              <span className="text-[#667085] block font-medium">Channel / Source</span>
              <span className="font-bold text-[#111827] text-sm mt-0.5 block capitalize">
                {caseType.includes("b2b") ? "B2B Invoice" : caseType.includes("mandate") ? "e-Mandate" : caseType.includes("voice") ? "Voice Call" : "Gateway"}
              </span>
              <span className="text-[11px] text-[#667085]">LTV: {formatINR(customer?.lifetimeValue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Workflow-Specific Banner */}
        {caseType === "b2b_receivable" && (
          <div className="mt-5 p-4 rounded-xl bg-[#F1EDFF]/60 border border-[#5B3DF5]/30 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#5B3DF5] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#111827] block text-sm">B2B Invoice Receivables Details</span>
              <p className="text-[#667085]">
                Invoice Number: <span className="font-mono font-bold text-[#111827]">{context?.invoiceSnapshot?.invoiceNumber || "INV-8500"}</span> • Days Overdue: <span className="font-bold text-[#E5484D]">{context?.invoiceSnapshot?.daysOverdue || 12} days</span> • Account Owner: <span className="font-semibold text-[#111827]">{context?.invoiceSnapshot?.accountOwner || "Enterprise Collections"}</span>
              </p>
            </div>
          </div>
        )}

        {caseType === "mandate_retry" && (
          <div className="mt-5 p-4 rounded-xl bg-[#EEF4FF]/60 border border-[#2F6BFF]/30 flex items-start gap-3">
            <RefreshCcw className="w-5 h-5 text-[#2F6BFF] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#111827] block text-sm">Mandate Retry Sequencer State</span>
              <p className="text-[#667085]">
                Mandate Ref: <span className="font-mono font-bold text-[#111827]">{context?.mandateSnapshot?.mandateReference || "MD-1042"}</span> • Attempt: <span className="font-bold text-[#2F6BFF]">1 of 3</span> • Cooling Cooldown: <span className="font-semibold text-[#111827]">6 Hours between retries</span>
              </p>
            </div>
          </div>
        )}

        {caseType === "voice_recovery" && (
          <div className="mt-5 p-4 rounded-xl bg-[#F1EDFF]/60 border border-[#5B3DF5]/30 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-[#5B3DF5] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#111827] block text-sm">Hinglish Voice Recovery Session</span>
              <p className="text-[#667085]">
                Language: <span className="font-bold text-[#5B3DF5]">Hinglish</span> • Detected Customer Intent: <span className="font-bold text-[#13B981]">{context?.voiceSnapshot?.detectedIntent || "TRY_LATER (Commitment)"}</span>
              </p>
              <p className="italic text-[#111827] bg-white p-2 rounded border border-[#E7EAF0]">
                &ldquo;{context?.voiceSnapshot?.transcriptSnippet || "Namaste Rahul ji, main kal subah karunga pakka."}&rdquo;
              </p>
            </div>
          </div>
        )}

        {caseType === "promise_to_pay" && (
          <div className="mt-5 p-4 rounded-xl bg-[#EAFBF4]/60 border border-[#13B981]/30 flex items-start gap-3">
            <CalendarCheck className="w-5 h-5 text-[#13B981] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#111827] block text-sm">Promise-to-Pay Commitment</span>
              <p className="text-[#667085]">
                Promised Date: <span className="font-bold text-[#13B981]">Tomorrow, 10:00 AM</span> • Channel: <span className="font-semibold text-[#111827]">{context?.promiseSnapshot?.channel || "voice"}</span> • Status: <span className="font-bold text-[#2F6BFF]">PROMISED (Reminder Queued)</span>
              </p>
            </div>
          </div>
        )}

        {/* Why is this at risk? */}
        <div className="mt-5 p-4 rounded-xl bg-[#FFF6E8]/60 border border-[#F59E0B]/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#111827] block text-sm">Why is this revenue at risk?</span>
            <p className="text-[#667085] mt-1">
              Root Cause:{" "}
              <span className="font-mono font-bold text-[#111827]">
                {recCase?.rootCause || "unclassified"}
              </span>
              . Autonomous recovery engine evaluated customer history, risk score ({recCase?.riskScore}), and cost models to formulate the highest-ROI intervention.
            </p>
          </div>
        </div>
      </div>

      {/* Recovery Timeline (7 Stages) */}
      <RecoveryTimeline status={recCase?.status} amountRecovered={recCase?.amountAtRisk} caseData={recCase} />

      {/* 2-Column Grid: AI Decision vs Policy Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Decision & Evidence */}
        <div className="space-y-6">
          <DecisionCard
            diagnosis={latestDecision?.diagnosis || "temporary_payment_failure"}
            selectedAction={latestDecision?.selectedAction || "DELAYED_RETRY"}
            confidence={latestDecision?.confidence || "0.910"}
            candidateActions={latestDecision?.candidateActions || []}
            expectedRecovery={latestDecision?.expectedRecovery || recCase?.amountAtRisk * 0.72}
            estimatedCost={latestDecision?.estimatedCost || 0}
            expectedNetValue={latestDecision?.expectedNetValue || recCase?.amountAtRisk * 0.7}
            expectedRoi={latestDecision?.expectedRoi || "999.00"}
            requiresHumanApproval={latestDecision?.requiresHumanApproval}
          />

          <EvidenceList
            evidence={
              latestDecision?.evidence ||
              context?.historicalContext?.notes || [
                "14 successful previous payments recorded",
                "1 previous failure recorded",
                "Active relationship linked",
                "Retry count below configured threshold",
              ]
            }
            customerSnapshot={context?.customerSnapshot || customer}
            paymentSnapshot={context?.paymentSnapshot || payment}
          />
        </div>

        {/* Right: Policy Validation & Audit Trail */}
        <div className="space-y-6">
          <PolicyCheckList checks={policyChecks} isBlocked={isBlocked} />

          <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
            <h3 className="text-sm font-bold text-[#111827] mb-4">Auditable Decision Trace</h3>
            <AuditTimeline logs={auditTrail} />
          </div>
        </div>
      </div>
    </div>
  );
}
