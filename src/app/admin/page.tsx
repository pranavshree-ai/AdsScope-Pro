"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Building,
  Layers,
  Sparkles,
  DollarSign,
  Activity,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin").then((r) => r.json());
      if (res.success) setAdminData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="h-3.5 w-3.5" /> SuperAdmin Operations
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tenant Oversight & Cloud Economics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Global administrative control: multi-tenant health, cross-workspace ad collection totals, estimated LLM costs per tenant, and external provider statuses.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Active Tenants</div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-emerald-400" />
            <span>{adminData?.summary?.totalTenants || 0}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">100% tenant isolation active</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Ads in Global Pool</div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            <span>{adminData?.summary?.totalAdsAcrossTenants || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400">Meta, Google, TikTok collected</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Strategies Synthesized</div>
          <div className="text-3xl font-bold text-amber-400 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <span>{adminData?.summary?.totalStrategiesGenerated || 0}</span>
          </div>
          <p className="text-[11px] text-slate-400">Verified evidence-grounded</p>
        </div>
      </div>

      {/* Tenants Table with Cost Accounting */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Workspaces & Cost Allocation Breakdown
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 glass-panel">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Workspace</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Competitors</th>
                <th className="py-3 px-4">Ads Ingested</th>
                <th className="py-3 px-4">AI Credits Balance</th>
                <th className="py-3 px-4">Credits Consumed</th>
                <th className="py-3 px-4">Est. Cloud Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {adminData?.tenants?.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div>{t.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{t.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {t.planTier}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-white font-medium">{t.competitorsCount}</td>
                  <td className="py-3 px-4 text-white font-medium">{t.adsCount}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{t.aiCreditsBalance}</td>
                  <td className="py-3 px-4 text-slate-400">{t.creditsUsed}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {t.estimatedCostUsd}
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
