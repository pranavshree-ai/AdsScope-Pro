"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Eye,
  Clock,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [niches, setNiches] = useState<any[]>([]);
  const [activeNicheId, setActiveNicheId] = useState<string>("");
  const [insights, setInsights] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeNicheId) {
      loadNicheInsights(activeNicheId);
    }
  }, [activeNicheId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [nichesRes, compsRes, adsRes] = await Promise.all([
        fetch("/api/niches").then((r) => r.json()),
        fetch("/api/competitors").then((r) => r.json()),
        fetch("/api/ads").then((r) => r.json()),
      ]);

      if (nichesRes.success && nichesRes.niches.length > 0) {
        setNiches(nichesRes.niches);
        const defaultNiche = nichesRes.niches[0].id;
        setActiveNicheId(defaultNiche);
      }
      if (compsRes.success) setCompetitors(compsRes.competitors);
      if (adsRes.success) setAds(adsRes.ads);
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadNicheInsights = async (nicheId: string) => {
    try {
      const res = await fetch(`/api/niches/${nicheId}/insights`).then((r) => r.json());
      if (res.success) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error("Failed to load niche insights", err);
    }
  };

  const activeNiche = niches.find((n) => n.id === activeNicheId);
  const longevityAds = ads.filter((a) => a.activeDays >= 60).sort((a, b) => b.activeDays - a.activeDays);
  const recentAds = ads.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Banner / Niche selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-indigo-950/40 border border-white/10 glass-panel">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="h-3.5 w-3.5" /> Intelligence Live Stream
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Competitive Ad Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time public ad tracking across Meta, Google, and TikTok. Deconstructing hooks, longevity winners, and whitespace opportunities.
          </p>
        </div>

        {/* Niche Selector */}
        <div className="flex items-center gap-3">
          <select
            value={activeNicheId}
            onChange={(e) => setActiveNicheId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {niches.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <Link
            href="/niches"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <span>+ New Niche</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 glass-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Competitors Monitored</span>
            <UsersIcon className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">
            {competitors.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="h-3 w-3" /> 100% active sources
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 glass-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Ad Creatives</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">
            {ads.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Meta, Google, TikTok</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 glass-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Longevity Winners (&gt;60d)</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">
            {longevityAds.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <Flame className="h-3 w-3" /> Top 10% highest ROI signals
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 glass-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Whitespace Gaps</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white">
            {insights?.whitespaceGaps?.length || 3}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span>High potential angles</span>
          </div>
        </div>
      </div>

      {/* Longevity Winners Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Longevity Winners (Long-Running Scaled Ads)
            </h2>
          </div>
          <Link
            href="/explorer?minActiveDays=60"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>View all {longevityAds.length} winners</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {longevityAds.slice(0, 3).map((ad) => (
            <div
              key={ad.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200">
                    {ad.advertiserName}
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-400">
                    <Clock className="h-3 w-3" />
                    <span>{ad.activeDays} Days Active</span>
                  </div>
                </div>

                {ad.thumbnailUrl && (
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-slate-950 border border-white/5">
                    <img
                      src={ad.thumbnailUrl}
                      alt={ad.headline || "Ad Creative"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white uppercase">
                      {ad.platform} • {ad.format}
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                  {ad.headline}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {ad.adCopy}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {ad.analysis?.angle || "Performance"}
                </span>
                <Link
                  href={`/explorer?adId=${ad.id}`}
                  className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" /> Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Matrix: Creative Velocity & Whitespace Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creative Velocity Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Competitor Creative Velocity
            </h3>
            <span className="text-[11px] text-slate-400">Weekly New Ad Velocity</span>
          </div>

          <div className="space-y-3 pt-2">
            {insights?.creativeVelocity?.map((item: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{item.competitor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold">{item.weeklyNewAds} ads / week</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {item.trend}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, item.weeklyNewAds * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whitespace Gaps */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> High-Opportunity Whitespace Gaps
            </h3>
            <Link href="/strategies" className="text-xs text-indigo-400 hover:underline">
              Generate Strategy
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {insights?.whitespaceGaps?.map((gap: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{gap.gap}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                    Score: {gap.potentialScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{gap.description}</p>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span>Angle: "{gap.recommendedHook}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx={9} cy={7} r={4} />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
