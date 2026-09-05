"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  RefreshCw,
  ShieldAlert,
  Check,
} from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput("");
    setErrorMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCaptchaValid =
    userInput.trim().toUpperCase() === captchaCode.toUpperCase();

  const handleDeleteAll = async () => {
    if (!isCaptchaValid) {
      setErrorMsg("Captcha does not match. Please try again.");
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/data-source/reset", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete data");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete database records");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7EAF0] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F7F8FC] hover:bg-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header Warning */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#E5484D] flex items-center justify-center shrink-0 border border-[#FEE2E2]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111827]">
                Delete All Data &amp; Reset
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Permanently purge all transactions, cases, and logs
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-[#FED7D7] text-xs text-[#9B2C2C] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#E5484D]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Permanent &amp; Irreversible Action</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#742A2A]">
              This will wipe all imported payment records, B2B invoices, NACH mandates, AI recovery cases, and customer history. Your workspace will be restored to an empty state.
            </p>
          </div>

          {/* Captcha Box */}
          <div className="p-4 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#5B3DF5]" />
                Security Captcha Verification
              </span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B3DF5] hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="flex items-center justify-center p-3 rounded-lg bg-white border border-[#E7EAF0] shadow-xs select-none">
              <span className="font-mono text-2xl font-black tracking-widest text-[#111827] line-through decoration-[#5B3DF5]/40 italic">
                {captchaCode}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#667085] mb-1">
                Type the 5-character captcha code above to unlock deletion:
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={5}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder="Enter captcha..."
                  className="w-full text-center font-mono font-bold text-sm tracking-widest uppercase rounded-lg border border-[#E7EAF0] bg-white px-3 py-2 text-[#111827] focus:outline-none focus:border-[#E5484D]"
                />
                {isCaptchaValid && (
                  <Check className="w-4 h-4 text-[#13B981] absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#E5484D] font-medium flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7EAF0] bg-white hover:bg-[#F7F8FC] text-[#111827] text-xs font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isCaptchaValid || isDeleting}
              onClick={handleDeleteAll}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E5484D] hover:bg-[#DC2626] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isDeleting ? "Wiping Data..." : "Delete All Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
