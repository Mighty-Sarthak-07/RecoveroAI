"use client";

import React, { useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { ShieldCheck, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [maxRetries, setMaxRetries] = useState(4);
  const [highValueThreshold, setHighValueThreshold] = useState(100000); // in rupees (₹100,000)
  const [cooldownHours, setCooldownHours] = useState(6);
  const [costCeilingRatio, setCostCeilingRatio] = useState(15);
  const [requireConsent, setRequireConsent] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Merchant Policy Engine Settings"
        subtitle="Configure deterministic guardrails, economic thresholds, and compliance boundaries"
        actions={
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-colors shadow-sm"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Policies Saved!" : "Save Changes"}
          </button>
        }
      />

      <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#E7EAF0]">
          <ShieldCheck className="w-5 h-5 text-[#5B3DF5]" />
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Deterministic Policy Guardrails</h3>
            <p className="text-xs text-[#667085]">
              These rules override all AI model decisions before action authorization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Retries */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-1">
              Rule 1: Maximum Retries Cap
            </label>
            <p className="text-[11px] text-[#667085] mb-2">
              Block automated payment retries and escalate to human review after N attempts.
            </p>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>

          {/* High Value Threshold */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-1">
              Rule 2: High-Value Threshold (INR)
            </label>
            <p className="text-[11px] text-[#667085] mb-2">
              Require human approval for any transaction exceeding this monetary value.
            </p>
            <input
              type="number"
              value={highValueThreshold}
              onChange={(e) => setHighValueThreshold(Number(e.target.value))}
              step={10000}
              className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>

          {/* Cooldown Hours */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-1">
              Rule 6: Smart Timing Cooldown (Hours)
            </label>
            <p className="text-[11px] text-[#667085] mb-2">
              Minimum delay before scheduling subsequent automated retry re-authorizations.
            </p>
            <input
              type="number"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(Number(e.target.value))}
              min={1}
              max={72}
              className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>

          {/* Cost Ceiling Ratio */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-1">
              Rule 7: Cost Ceiling Ratio (%)
            </label>
            <p className="text-[11px] text-[#667085] mb-2">
              Reject recovery interventions where action cost exceeds X% of expected recovery.
            </p>
            <input
              type="number"
              value={costCeilingRatio}
              onChange={(e) => setCostCeilingRatio(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>
        </div>

        {/* Contact Permission Checkbox */}
        <div className="pt-4 border-t border-[#E7EAF0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#111827] block">
              Rule 4: Require Explicit Consent for WhatsApp & Email
            </span>
            <span className="text-[11px] text-[#667085] block mt-0.5">
              Strictly respect customer contact permissions and block outreach if revoked.
            </span>
          </div>
          <input
            type="checkbox"
            checked={requireConsent}
            onChange={(e) => setRequireConsent(e.target.checked)}
            className="w-4 h-4 text-[#5B3DF5] rounded accent-[#5B3DF5]"
          />
        </div>
      </div>
    </div>
  );
}
