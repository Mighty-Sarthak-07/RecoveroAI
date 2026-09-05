"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  CreditCard,
  RefreshCcw,
  Users,
  BarChart3,
  History,
  Cpu,
  Settings,
  Sparkles,
  Building2,
  PhoneCall,
  CalendarCheck,
  Play,
  ShieldX,
  Search,
  Bell,
  HelpCircle,
  Database,
  Menu,
  X,
} from "lucide-react";
import { DataSourceModal } from "@/src/components/onboarding/data-source-modal";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recovery Cases", href: "/recoveries", icon: FolderGit2 },
  { label: "B2B Receivables", href: "/b2b", icon: Building2, badge: "Chaser" },
  { label: "Mandate Retries", href: "/mandates", icon: RefreshCcw, badge: "Sequencer" },
  { label: "Voice Recovery", href: "/voice", icon: PhoneCall, badge: "Hinglish" },
  { label: "Promise-to-Pay", href: "/promises", icon: CalendarCheck, badge: "Tracker" },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Subscriptions", href: "/subscriptions", icon: RefreshCcw },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Audit Trail", href: "/audit", icon: History },
  { label: "Guardrails", href: "/guardrails", icon: ShieldX, badge: "10 Rules" },
  { label: "Simulation", href: "/simulation", icon: Cpu, badge: "Engine" },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTriggering, setIsTriggering] = useState(false);
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const triggerDemoEvent = async (endpoint: string, successMsg: string) => {
    setIsTriggering(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      alert(data.message || successMsg);
      window.location.reload();
    } catch (e: any) {
      alert("Error triggering demo event: " + e.message);
    } finally {
      setIsTriggering(false);
    }
  };

  const renderNavItems = () => (
    <nav className="p-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isActive
                ? "bg-[#F1EDFF] text-[#5B3DF5] shadow-2xs font-bold"
                : "text-[#667085] hover:bg-[#F7F8FC] hover:text-[#111827]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#5B3DF5]" : "text-[#667085]"}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EEF4FF] text-[#2F6BFF]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E7EAF0] flex-col justify-between shrink-0 hidden lg:flex sticky top-0 h-screen">
        <div className="overflow-y-auto">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center border-b border-[#E7EAF0] gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] flex items-center justify-center text-white font-black text-lg shadow-xs">
              R
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#111827]">
                Recovero<span className="text-[#5B3DF5]">AI</span>
              </span>
              <span className="text-[10px] block font-semibold text-[#667085] uppercase tracking-wider -mt-1">
                Autonomous Recovery
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          {renderNavItems()}
        </div>

        {/* Demo Triggers & User Card */}
        <div className="p-3 border-t border-[#E7EAF0] space-y-2.5 bg-white">
          <div className="p-2.5 rounded-xl bg-[#FAFBFF] border border-[#E7EAF0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B3DF5] block mb-1.5">
              ⚡ Demo Trigger Actions
            </span>
            <div className="space-y-1 text-[11px]">
              <button
                onClick={() =>
                  triggerDemoEvent(
                    "/api/demo/trigger-payment-failure",
                    "Hero ₹2,499 payment failure created!"
                  )
                }
                disabled={isTriggering}
                className="w-full text-left font-medium py-1 px-1.5 rounded hover:bg-white text-[#111827] flex items-center justify-between transition-colors"
              >
                <span>+ Failed Payment (₹2,499)</span>
                <Play className="w-3 h-3 text-[#5B3DF5]" />
              </button>

              <button
                onClick={() =>
                  triggerDemoEvent(
                    "/api/demo/trigger-policy-violation",
                    "Kill Switch triggered! ₹200,000 transaction blocked."
                  )
                }
                disabled={isTriggering}
                className="w-full text-left font-medium py-1 px-1.5 rounded hover:bg-white text-[#E5484D] flex items-center justify-between transition-colors"
              >
                <span>⚠️ Kill Switch (₹200k Block)</span>
                <ShieldX className="w-3 h-3 text-[#E5484D]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F7F8FC]">
            <div className="w-7 h-7 rounded-full bg-[#5B3DF5] text-white flex items-center justify-center font-bold text-xs">
              RS
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#111827] block truncate">Rahul Sharma</span>
              <span className="text-[10px] text-[#667085] block truncate">Merchant Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sliding Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col justify-between lg:hidden border-r border-[#E7EAF0] shadow-xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="overflow-y-auto">
          {/* Logo + Close Button */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E7EAF0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] flex items-center justify-center text-white font-black text-lg">
                R
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#111827]">
                Recovero<span className="text-[#5B3DF5]">AI</span>
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#667085] hover:bg-[#F7F8FC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          {renderNavItems()}
        </div>

        <div className="p-3 border-t border-[#E7EAF0] space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F7F8FC]">
            <div className="w-7 h-7 rounded-full bg-[#5B3DF5] text-white flex items-center justify-center font-bold text-xs">
              RS
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#111827] block truncate">Rahul Sharma</span>
              <span className="text-[10px] text-[#667085] block truncate">Merchant Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E7EAF0] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Hamburger button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#667085] hover:bg-[#F7F8FC] hover:text-[#111827]"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across 7 recovery workflows..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDataSourceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-[#5B3DF5] hover:bg-[#4D32D8] rounded-lg transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect Data Source</span>
              <span className="sm:hidden">Connect</span>
            </button>

            <button
              onClick={() =>
                triggerDemoEvent("/api/demo/generate", "Demo dataset seeded successfully!")
              }
              disabled={isTriggering}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B3DF5] bg-[#F1EDFF] hover:bg-[#5B3DF5] hover:text-white rounded-lg transition-colors border border-[#5B3DF5]/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isTriggering ? "Generating..." : "Generate Demo Data"}
            </button>

            <Link
              href="/"
              className="hidden xl:inline-block text-xs font-semibold text-[#667085] hover:text-[#111827] px-2.5 py-1.5 rounded-lg hover:bg-[#F7F8FC]"
            >
              Landing Page ↗
            </Link>

            <div className="w-px h-5 bg-[#E7EAF0] mx-0.5 hidden sm:block" />

            <button className="w-8 h-8 rounded-lg text-[#667085] hover:bg-[#F7F8FC] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-[#667085] hover:bg-[#F7F8FC] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content with Smooth Fade-In Animation */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Data Source Modal */}
      <DataSourceModal
        isOpen={isDataSourceModalOpen}
        onClose={() => setIsDataSourceModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
