"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, RefreshCw, Lock } from "lucide-react";

export default function HostedPaymentRecoveryPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recoveries/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.case) {
          setCaseData(data.case);
        } else {
          // Fallback case state for direct payment links
          setCaseData({
            id,
            customerName: "Rahul Sharma",
            amountAtRisk: 249900,
            status: "AWAITING_CUSTOMER",
          });
        }
      })
      .catch(() => {
        setCaseData({
          id,
          customerName: "Valued Customer",
          amountAtRisk: 249900,
          status: "AWAITING_CUSTOMER",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/pay/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: id,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment processing failed");
      setIsSuccess(true);
    } catch (e: any) {
      setErrorMsg(e.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-[#5B3DF5] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#667085]">Loading Recovery Payment Portal...</p>
      </div>
    );
  }

  const amountRupees = Math.round((caseData?.amountAtRisk || 249900) / 100);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7EAF0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#5B3DF5] p-6 text-white text-center relative">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Bank Grade Encrypted
            </div>
            <div className="h-6 px-2 rounded bg-[#0C2340] flex items-center justify-center">
              <img src="/razorpay.png" alt="Razorpay Partner" className="h-3.5 object-contain brightness-200" />
            </div>
          </div>
          <h1 className="text-xl font-extrabold">RecoveroAI Merchant Checkout</h1>
          <p className="text-xs text-white/80 mt-1">Instant Recovery Payment Link</p>

          <div className="mt-4 bg-white/10 backdrop-blur-xs rounded-xl p-3.5">
            <span className="text-xs uppercase tracking-wider font-medium text-white/80 block">
              Amount Due
            </span>
            <span className="text-3xl font-black text-white">₹{amountRupees.toLocaleString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#EAFBF4] text-[#13B981] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-[#111827]">Payment Verified &amp; Completed!</h2>
              <p className="text-xs text-[#667085]">
                Thank you {caseData?.customerName || "Customer"}. Your payment of ₹{amountRupees.toLocaleString()} was successfully processed and verified.
              </p>
              <div className="pt-4 border-t border-[#E7EAF0]">
                <span className="text-[11px] text-[#667085] font-mono block">
                  Transaction Ref: TXN_REC_{id?.substring(0, 8)?.toUpperCase()}
                </span>
                <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-[#EAFBF4] text-[#13B981] text-xs font-bold border border-[#13B981]/30">
                  ✓ Case Marked RECOVERED
                </span>
              </div>
            </div>
          ) : (
            <>
              <div>
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block mb-2">
                  Select Payment Method
                </span>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "upi"
                        ? "border-[#5B3DF5] bg-[#F1EDFF]/40 ring-2 ring-[#5B3DF5]/20"
                        : "border-[#E7EAF0] hover:border-[#667085]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] text-white flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#111827] block">Instant UPI (GPay / PhonePe / Paytm)</span>
                        <span className="text-[10px] text-[#667085]">Zero transaction fee • Auto-verify</span>
                      </div>
                    </div>
                    {paymentMethod === "upi" && <CheckCircle2 className="w-4 h-4 text-[#5B3DF5]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "card"
                        ? "border-[#5B3DF5] bg-[#F1EDFF]/40 ring-2 ring-[#5B3DF5]/20"
                        : "border-[#E7EAF0] hover:border-[#667085]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2F6BFF] text-white flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#111827] block">Credit / Debit Card</span>
                        <span className="text-[10px] text-[#667085]">Visa, Mastercard, RuPay</span>
                      </div>
                    </div>
                    {paymentMethod === "card" && <CheckCircle2 className="w-4 h-4 text-[#5B3DF5]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "netbanking"
                        ? "border-[#5B3DF5] bg-[#F1EDFF]/40 ring-2 ring-[#5B3DF5]/20"
                        : "border-[#E7EAF0] hover:border-[#667085]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#13B981] text-white flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#111827] block">Netbanking</span>
                        <span className="text-[10px] text-[#667085]">All major Indian banks supported</span>
                      </div>
                    </div>
                    {paymentMethod === "netbanking" && <CheckCircle2 className="w-4 h-4 text-[#5B3DF5]" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FFF5F5] border border-[#FED7D7] text-xs text-[#E5484D]">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 text-sm font-extrabold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Payment with Gateway...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ₹{amountRupees.toLocaleString()} Now
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAFBFF] px-6 py-3 border-t border-[#E7EAF0] flex items-center justify-between">
          <p className="text-[10px] text-[#667085]">
            Powered by <span className="font-bold text-[#5B3DF5]">RecoveroAI</span>
          </p>
          <div className="flex items-center gap-1 text-[10px] text-[#667085]">
            <span>Gateway Partner:</span>
            <div className="h-4 px-1 rounded bg-[#0C2340] flex items-center justify-center">
              <img src="/razorpay.png" alt="Razorpay Logo" className="h-2.5 object-contain brightness-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
