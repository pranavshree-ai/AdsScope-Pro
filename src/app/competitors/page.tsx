"use client";

import React, { useState, useEffect } from "react";
import {
  Users2,
  RefreshCw,
  ExternalLink,
  Clock,
  Sparkles,
  TrendingUp,
  Layers,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitors();
  }, []);

  useEffect(() => {
    if (selectedComp) {
      loadCompetitorAds(selectedComp.id);
    }
  }, [selectedComp]);

  const loadCompetitors = async () => {
    try {
      const res = await fetch("/api/competitors").then((r) => r.json());
      if (res.success && res.competitors.length > 0) {
        setCompetitors(res.competitors);
        setSelectedComp(res.competitors[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCompetitorAds = async (competitorId: string) => {
    try {
      const res = await fetch(`/api/ads?competitorId=${competitorId}`).then((r) => r.json());
      if (res.success) {
        setAds(res.ads);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSync = async (competitorId: string) => {
    setSyncingId(competitorId);
    try {
      await fetch(`/api/competitors/${competitorId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "meta" }),
      });
      setTimeout(() => {
        setSyncingId(null);
        loadCompetitorAds(competitorId);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Users2 className="h-3.5 w-3.5" /> Intelligence Profiles
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Competitor Profiles & Launch Timelines
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Deep-dive into each competitor's creative launch velocity, active formats, messaging evolution, and longevity winners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Competitor Directory */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tracked Competitors ({competitors.length})
          </h2>

          <div className="space-y-3">
            {competitors.map((c) => {
              const isSelected = selectedComp?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComp(c)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950/60 border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{c.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{c.domain}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                      Active
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Last Synced: Today
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerSync(c.id);
                      }}
                      disabled={syncingId === c.id}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${syncingId === c.id ? "animate-spin" : ""}`} />
                      <span>{syncingId === c.id ? "Syncing..." : "Sync Now"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Competitor Profile & Launch Timeline */}
        {selectedComp && (
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Banner */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 glass-panel space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedComp.name}</h2>
                  <a
                    href={`https://${selectedComp.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {selectedComp.domain} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => triggerSync(selectedComp.id)}
                    disabled={syncingId === selectedComp.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncingId === selectedComp.id ? "animate-spin" : ""}`} />
                    <span>Refresh Library</span>
                  </button>
                </div>
              </div>

              {/* Quick Stat Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Tracked Ads</div>
                  <div className="text-lg font-bold text-white mt-1">{ads.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Longevity Winners</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {ads.filter((a) => a.activeDays >= 60).length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Platform</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1 uppercase">
                    Meta & TikTok
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Timeline Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" /> Creative Timeline & Ad Variants
                </h3>
              </div>

              <div className="space-y-4">
                {ads.map((ad, idx) => (
                  <div
                    key={ad.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 glass-card flex flex-col md:flex-row gap-5"
                  >
                    {ad.thumbnailUrl && (
                      <div className="w-full md:w-44 h-36 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                        <img
                          src={ad.thumbnailUrl}
                          alt={ad.headline}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white uppercase">
                            {ad.platform}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 capitalize">
                            {ad.format} format
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <Clock className="h-3 w-3" />
                          <span>Active {ad.activeDays} Days</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white">{ad.headline}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{ad.adCopy}</p>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-emerald-400 font-medium">
                          Angle: {ad.analysis?.angle || "Performance Optimization"}
                        </span>
                        <span className="text-slate-300 font-medium">CTA: {ad.cta || "Shop Now"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
