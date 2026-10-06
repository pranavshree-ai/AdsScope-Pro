"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Sparkles,
  Check,
  Zap,
  TrendingUp,
  ShieldCheck,
  Building,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function BillingPage() {
  const [billingData, setBillingData] = useState<any>(null);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const res = await fetch("/api/billing").then((r) => r.json());
      if (res.success) setBillingData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgrade = async (planTier: string) => {
    setUpgradingTier(planTier);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planTier }),
      }).then((r) => r.json());

      if (res.success) {
        alert(res.message);
        loadBilling();
      } else {
        alert(res.error || "Upgrade failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgradingTier(null);
    }
  };

  const plans = billingData?.allPlans || {};
  const currentTier = billingData?.currentTier || "pro";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <CreditCard className="h-3.5 w-3.5" /> Plan Management & Credit Usage
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Subscription Tiers & Usage Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Scale your competitive intelligence pipeline. Upgrade tiers to unlock higher competitor limits, ultra-frequent refresh cadences, and agency white-label reports.
        </p>
      </div>

      {/* Usage Meter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Available AI Credits</div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <span>{billingData?.balance || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total consumed: {billingData?.usage?.creditsConsumedTotal || 0} credits
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Tracked Competitors Limit</div>
          <div className="text-3xl font-bold text-white">
            {billingData?.usage?.competitorsCount || 0} /{" "}
            <span className="text-slate-500">{billingData?.limits?.maxCompetitors || 30}</span>
          </div>
          <p className="text-[11px] text-emerald-400">Within plan quota</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Pipeline Refresh Cadence</div>
          <div className="text-3xl font-bold text-indigo-400">
            Every {billingData?.limits?.refreshFrequencyHours || 12}h
          </div>
          <p className="text-[11px] text-slate-500">Continuous ad registry polling</p>
        </div>
      </div>

      {/* Pricing Tier Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {Object.entries(plans).map(([tierKey, plan]: [string, any]) => {
            const isCurrent = currentTier === tierKey;
            return (
              <div
                key={tierKey}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                  isCurrent
                    ? "bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        Current Tier
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-3xl font-bold text-white">
                      ${plan.priceMonthly / 100}
                      <span className="text-xs text-slate-400 font-normal"> /month</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{plan.maxCompetitors} Competitors Tracked</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Every {plan.refreshFrequencyHours}h Auto-Refresh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{plan.aiCreditsPerMonth} AI Strategy Credits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{plan.maxTeamSeats} Team Workspace Seats</span>
                    </li>
                    {plan.exportPdf && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>PDF & Markdown Exports</span>
                      </li>
                    )}
                    {plan.whiteLabel && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Agency White-Label Branding</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-800 text-center text-xs font-bold text-emerald-400">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tierKey)}
                      disabled={upgradingTier === tierKey}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      {upgradingTier === tierKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Switch to {plan.name}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Ledger Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Credit Usage Ledger (Audited)
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 glass-panel">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Credits Consumed</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {billingData?.recentLedger?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white capitalize">
                    {item.eventType.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 text-amber-400 font-bold">
                    -{item.creditsConsumed} Credits
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                    {JSON.stringify(item.metadata || {})}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    Today
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
