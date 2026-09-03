import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function EmptyState({
  title,
  description,
  actionText = "Generate Demo Data",
  onAction,
  isLoading = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FAFBFF] border border-dashed border-[#E7EAF0] rounded-xl my-6">
      <div className="w-12 h-12 rounded-full bg-[#F1EDFF] flex items-center justify-center mb-4 text-[#5B3DF5]">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
      <p className="text-sm text-[#667085] max-w-md mt-1 mb-6">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? "Generating..." : actionText}
        </button>
      )}
    </div>
  );
}
