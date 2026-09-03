import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  isPositive = true,
  icon: Icon,
  iconColor = "text-[#5B3DF5]",
  iconBg = "bg-[#F1EDFF]",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E7EAF0] shadow-sm hover:border-[#5B3DF5]/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#667085] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#111827]">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              isPositive ? "text-[#13B981]" : "text-[#E5484D]"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#667085] mt-1.5">{subtitle}</p>}
    </div>
  );
}
