"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Share2,
  Building,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";

export default function ReportsPage() {
  const [session, setSession] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then(setSession);
    fetch("/api/strategies").then((r) => r.json()).then((d) => {
      if (d.success) setStrategies(d.strategies);
    });
  }, []);

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="h-3.5 w-3.5" /> Intelligence Deliverables
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Competitive Audit Reports & Exports
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Generate executive-ready PDF audit briefs, white-label client decks, and competitive intelligence summaries.
          </p>
        </div>

        <button
          onClick={printReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Download className="h-3.5 w-3.5" /> Print / Save as PDF
        </button>
      </div>

      {/* Report Preview Document */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 glass-panel space-y-6 max-w-4xl mx-auto text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>{session?.workspace?.name || "Acme Growth Labs"}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                Official Intelligence Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Classification</span>
            <div className="text-xs font-bold text-white">Confidential Strategy</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Executive Market Summary
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This competitive audit tracks active commercial campaigns across Meta, Google, and TikTok. Analysis identifies major market saturation in morning focus angles and reveals a 94/100 whitespace opportunity in sleep-safe afternoon focus drinks and transparent milligram ingredient labeling.
          </p>
        </div>

        {/* Longevity Benchmark */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Longevity Winners Benchmark
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400">Ketone-IQ (184 Days)</span>
              <p className="text-slate-400">US Special Forces & Elite Athlete Endorsement angle.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400">Proper Wild (165 Days)</span>
              <p className="text-slate-400">2x Caffeine + 0g Sugar + 15x L-Theanine Taste Superiority.</p>
            </div>
          </div>
        </div>

        {/* Strategy Roadmap */}
        {strategies[0] && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Recommended Market Entry Strategy
            </h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
              <div className="font-bold text-white">{strategies[0].title}</div>
              <p className="text-slate-400">{strategies[0].brandProfile?.usp}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
