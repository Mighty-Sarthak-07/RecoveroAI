"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/src/components/shared/page-header";
import { Search, RefreshCw, CreditCard, CheckCircle2, XCircle } from "lucide-react";

export default function PaymentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json.topCases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payments"
        subtitle="Gateway transaction records, failure reasons, and settlement tracking"
        actions={
          <button
            onClick={fetchPayments}
            className="p-2 rounded-lg bg-white border border-[#E7EAF0] text-[#667085] hover:text-[#111827]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[#667085] uppercase font-semibold bg-[#FAFBFF]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFF]">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5B3DF5]">
                    pay_{item.id?.substring(0, 10)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#111827]">
                    {item.customerName || "Customer"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    ₹{((item.amountAtRisk || 0) / 100).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#667085]">Razorpay Test Mode</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#667085]">
                    {item.rootCause || "insufficient_funds"}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === "RECOVERED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#13B981] bg-[#EAFBF4] px-2.5 py-0.5 rounded-full border border-[#13B981]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Succeeded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E5484D] bg-[#FEECEC] px-2.5 py-0.5 rounded-full border border-[#E5484D]/30">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
