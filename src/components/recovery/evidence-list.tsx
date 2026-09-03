import React from "react";
import { CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

interface EvidenceListProps {
  evidence?: string[];
  customerSnapshot?: { lifetimeValue?: number; contactPermission?: boolean } | null;
  paymentSnapshot?: Record<string, unknown> | null;
}

export function EvidenceList({
  evidence = [],
  customerSnapshot,
}: EvidenceListProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm">
      <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#5B3DF5]" />
        Auditable Customer Evidence
      </h3>

      <div className="space-y-2.5 mb-5">
        {evidence.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAFBFF] border border-[#E7EAF0] text-sm text-[#111827]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#13B981] shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
        {evidence.length === 0 && (
          <p className="text-sm text-[#667085]">Evidence assembling from historical ledger...</p>
        )}
      </div>

      <div className="pt-4 border-t border-[#E7EAF0] grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#F7F8FC]">
          <span className="text-[#667085] block">Customer LTV</span>
          <span className="font-bold text-[#111827] text-sm mt-0.5 block">
            ₹{(((customerSnapshot?.lifetimeValue || 0)) / 100).toLocaleString()}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[#F7F8FC]">
          <span className="text-[#667085] block">Contact Consent</span>
          <span className="font-bold text-[#13B981] text-sm mt-0.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            {customerSnapshot?.contactPermission ? "Authorized" : "Revoked"}
          </span>
        </div>
      </div>
    </div>
  );
}
