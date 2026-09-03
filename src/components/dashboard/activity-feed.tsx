"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, ShieldAlert, UserCheck, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  caseId?: string | null;
  actor: string;
  event: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[#667085]">
        No recent activity logged yet.
      </div>
    );
  }

  const getEventIcon = (event: string) => {
    if (event.includes("OUTCOME_VERIFIED") || event.includes("RECOVERED")) {
      return <CheckCircle2 className="w-4 h-4 text-[#13B981]" />;
    }
    if (event.includes("BLOCKED")) {
      return <ShieldAlert className="w-4 h-4 text-[#E5484D]" />;
    }
    if (event.includes("ESCALATED")) {
      return <UserCheck className="w-4 h-4 text-[#2F6BFF]" />;
    }
    if (event.includes("EMAIL")) {
      return <Mail className="w-4 h-4 text-[#5B3DF5]" />;
    }
    if (event.includes("WHATSAPP")) {
      return <MessageSquare className="w-4 h-4 text-[#13B981]" />;
    }
    return <Clock className="w-4 h-4 text-[#667085]" />;
  };

  const formatEventTitle = (item: ActivityItem) => {
    if (item.event === "OUTCOME_VERIFIED") return "Payment successfully recovered";
    if (item.event === "POLICY_BLOCKED_ACTION") return "Policy engine blocked risky action";
    if (item.event === "HUMAN_ESCALATION_TRIGGERED") return "Escalated to human operator";
    if (item.event === "ACTION_EXECUTED") return "Recovery action executed";
    if (item.event === "RECOVERY_CASE_CREATED") return "Revenue risk detected & case opened";
    if (item.event === "AI_DIAGNOSIS_COMPLETED") return "AI root cause diagnosed";
    return item.event.replace(/_/g, " ").toLowerCase();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    if (!now) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const diffMin = Math.round((now - date.getTime()) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  return (
    <div className="divide-y divide-[#E7EAF0]">
      {activities.map((item) => (
        <div key={item.id} className="py-3 flex items-start gap-3 hover:bg-[#FAFBFF] px-2 rounded-lg transition-colors">
          <div className="mt-0.5 p-1 rounded-md bg-[#F7F8FC] border border-[#E7EAF0] shrink-0">
            {getEventIcon(item.event)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#111827] truncate capitalize">
                {formatEventTitle(item)}
              </span>
              <span className="text-[10px] text-[#667085] shrink-0">
                {formatTimeAgo(item.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-[#667085]">
                {item.actor}
              </span>
              {item.caseId && (
                <>
                  <span className="text-[10px] text-[#E7EAF0]">•</span>
                  <Link
                    href={`/recoveries/${item.caseId}`}
                    className="text-[10px] font-mono text-[#5B3DF5] hover:underline"
                  >
                    Case #{item.caseId.substring(0, 8)}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
