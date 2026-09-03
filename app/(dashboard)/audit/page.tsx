"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { AuditTimeline } from "@/src/components/audit/audit-timeline";
import { RefreshCw } from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setLogs(json.recentActivity || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Trail"
        subtitle="Chronological, immutable ledger of all agent decisions, policy evaluations, and executed interventions"
        actions={
          <button
            onClick={fetchAuditLogs}
            className="p-2 rounded-lg bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      <AuditTimeline logs={logs} />
    </div>
  );
}
