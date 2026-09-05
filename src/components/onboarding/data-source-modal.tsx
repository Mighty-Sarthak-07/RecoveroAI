"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { DataSourceSelector } from "./data-source-selector";

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DataSourceModal({
  isOpen,
  onClose,
  onSuccess,
}: DataSourceModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F7F8FC] hover:bg-[#E7EAF0] text-[#667085] hover:text-[#111827] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <DataSourceSelector
          inline={true}
          onCompleted={() => {
            if (onSuccess) {
              onSuccess();
            } else {
              window.location.reload();
            }
            onClose();
          }}
        />
      </div>
    </div>,
    document.body
  );
}
