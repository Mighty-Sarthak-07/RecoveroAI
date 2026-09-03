"use client";

import React, { useState } from "react";
import { Cpu, Play, RefreshCw, Zap, TrendingUp, CheckCircle2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/src/components/shared/page-header";
import { MetricComparison } from "@/src/components/simulation/metric-comparison";
import { SimulationResult } from "@/src/types/recovery";

export default function SimulationPage() {
  const [count, setCount] = useState(1000);
  const [strategy, setStrategy] = useState("COMPARISON");
  const [running, setRunning] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setRunning(true);
    setProgressStage("Generating synthetic event batch...");

    try {
      setTimeout(() => setProgressStage("Running deterministic risk classification..."), 400);
      setTimeout(() => setProgressStage("Evaluating cost models and candidate actions..."), 800);
      setTimeout(() => setProgressStage("Enforcing merchant policy validation rules..."), 1200);
      setTimeout(() => setProgressStage("Simulating bounded action execution & verification..."), 1600);

      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, strategy }),
      });

      const json = await res.json();
      if (json.result) {
        setResult(json.result);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setRunning(false);
      setProgressStage("");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Recovery Simulation Engine"
        subtitle="Benchmark autonomous recovery strategies against synthetic revenue loss batches with verified baseline metrics"
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#2F6BFF] border border-[#2F6BFF]/30">
            High-Performance Engine
          </span>
        }
      />

      {/* Simulation Control Card */}
      <div className="bg-white p-6 rounded-xl border border-[#E7EAF0] shadow-sm">
        <h3 className="text-base font-bold text-[#111827] mb-2">Configure Simulation Run</h3>
        <p className="text-xs text-[#667085] mb-6">
          Execute the same production decision and policy engine at scale across realistic event distributions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Batch Size Selector */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-2">
              Event Batch Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCount(val)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    count === val
                      ? "bg-[#5B3DF5] text-white border-[#5B3DF5] shadow-xs"
                      : "bg-[#FAFBFF] text-[#111827] border-[#E7EAF0] hover:bg-white"
                  }`}
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="text-xs font-bold text-[#111827] block mb-2">
              Strategy Mode
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-[#E7EAF0] bg-[#FAFBFF] px-3 py-2.5 text-[#111827] focus:outline-none focus:border-[#5B3DF5]"
            >
              <option value="COMPARISON">RecoveroAI vs. Baseline Benchmark</option>
              <option value="RECOVERO_AI">RecoveroAI Autonomous Engine Only</option>
              <option value="BASELINE">Baseline (Naive Immediate Retry)</option>
            </select>
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={handleRunSimulation}
              disabled={running}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#5B3DF5] hover:bg-[#4D32D8] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              {running ? "Simulating Pipeline..." : `Run ${count.toLocaleString()} Event Simulation →`}
            </button>
          </div>
        </div>

        {/* Animated Progress Banner */}
        {running && (
          <div className="mt-6 p-4 rounded-xl bg-[#F1EDFF] border border-[#5B3DF5]/30 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-[#5B3DF5] animate-spin shrink-0" />
            <span className="text-xs font-bold text-[#5B3DF5]">{progressStage}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && <MetricComparison result={result} />}
    </div>
  );
}
