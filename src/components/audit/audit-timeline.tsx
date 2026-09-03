import React, { useState } from "react";
import { Search, Filter, Clock } from "lucide-react";
import Link from "next/link";

interface AuditEntry {
  id: string;
  caseId?: string | null;
  actor: string;
  event: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export function AuditTimeline({ logs }: { logs: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [filterActor, setFilterActor] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(search.toLowerCase()) ||
      (log.caseId && log.caseId.toLowerCase().includes(search.toLowerCase())) ||
      log.actor.toLowerCase().includes(search.toLowerCase());

    const matchesActor = filterActor === "ALL" || log.actor === filterActor;
    return matchesSearch && matchesActor;
  });

  const getActorBadge = (actor: string) => {
    if (actor.includes("AGENT")) {
      return "bg-[#F1EDFF] text-[#5B3DF5] border-[#5B3DF5]/30";
    }
    if (actor.includes("POLICY")) {
      return "bg-[#FFF6E8] text-[#F59E0B] border-[#F59E0B]/30";
    }
    if (actor.includes("VERIFIER")) {
      return "bg-[#EAFBF4] text-[#13B981] border-[#13B981]/30";
    }
    if (actor.includes("OPERATOR")) {
      return "bg-[#EEF4FF] text-[#2F6BFF] border-[#2F6BFF]/30";
    }
    return "bg-[#F7F8FC] text-[#667085] border-[#E7EAF0]";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event, case ID, or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#667085]" />
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2 focus:outline-none focus:border-[#5B3DF5]"
          >
            <option value="ALL">All Actors</option>
            <option value="RECOVERO_AGENT">AI Agent</option>
            <option value="POLICY_ENGINE">Policy Engine</option>
            <option value="ORCHESTRATOR">Orchestrator</option>
            <option value="OUTCOME_VERIFIER">Outcome Verifier</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E7EAF0] before:-z-0">
        {filteredLogs.map((log) => {
          const formattedDate = new Date(log.timestamp).toLocaleString();

          return (
            <div key={log.id} className="flex items-start gap-4 relative z-10 pl-1">
              <div className="w-6 h-6 rounded-full bg-white border-2 border-[#5B3DF5] flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B3DF5]" />
              </div>
              <div className="flex-1 p-3.5 rounded-xl border border-[#E7EAF0] bg-[#FAFBFF] hover:bg-white transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827]">
                      {log.event.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActorBadge(
                        log.actor
                      )}`}
                    >
                      {log.actor}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#667085] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </div>

                {log.caseId && (
                  <div className="text-xs mt-1">
                    <span className="text-[#667085]">Target Case: </span>
                    <Link
                      href={`/recoveries/${log.caseId}`}
                      className="font-mono text-[#5B3DF5] font-semibold hover:underline"
                    >
                      #{log.caseId.substring(0, 8)}
                    </Link>
                  </div>
                )}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-2 p-2 rounded bg-[#F7F8FC] border border-[#E7EAF0] text-[11px] font-mono text-[#667085] overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-xs text-[#667085]">
            No matching audit logs found.
          </div>
        )}
      </div>
    </div>
  );
}
