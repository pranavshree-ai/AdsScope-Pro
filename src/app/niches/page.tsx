"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  Plus,
  Check,
  X,
  Search,
  ArrowRight,
  Globe,
  Loader2,
  Building2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function NichesPage() {
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);

  // Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("D2C & Wellness");
  const [region, setRegion] = useState("US");
  const [seeds, setSeeds] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<any[]>([]);
  const [approvedMap, setApprovedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadNiches();
  }, []);

  const loadNiches = async () => {
    try {
      const res = await fetch("/api/niches").then((r) => r.json());
      if (res.success && res.niches.length > 0) {
        setNiches(res.niches);
        setSelectedNiche(res.niches[0]);
        loadCompetitors(res.niches[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadCompetitors = async (nicheId: string) => {
    try {
      const res = await fetch(`/api/competitors?nicheId=${nicheId}`).then((r) => r.json());
      if (res.success) {
        setCompetitors(res.competitors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setDiscovering(true);
    try {
      // 1. Create Niche
      const nicheRes = await fetch("/api/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          region,
          description: `Competitive ad monitoring for ${name}`,
        }),
      }).then((r) => r.json());

      if (!nicheRes.success) {
        alert(nicheRes.error || "Failed to create niche");
        setDiscovering(false);
        return;
      }

      const newNiche = nicheRes.niche;

      // 2. Run Auto-Discovery
      const seedKeywords = seeds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const discoRes = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheName: name,
          category,
          seedKeywords: seedKeywords.length > 0 ? seedKeywords : [name],
          region,
        }),
      }).then((r) => r.json());

      if (discoRes.success) {
        setDiscoveredCompetitors(discoRes.suggestions);
        setSelectedNiche(newNiche);
        setNiches((prev) => [newNiche, ...prev]);
        setWizardStep(2);
      }
    } catch (err) {
      console.error("Discovery error", err);
    } finally {
      setDiscovering(false);
    }
  };

  const toggleApprove = async (item: any) => {
    const isApproved = approvedMap[item.domain];
    if (isApproved) return;

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId: selectedNiche.id,
          name: item.name,
          domain: item.domain,
          pageIdMeta: item.platformId,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setApprovedMap((prev) => ({ ...prev, [item.domain]: true }));
        setCompetitors((prev) => [res.competitor, ...prev]);
      } else {
        alert(res.error || "Could not add competitor");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Compass className="h-3.5 w-3.5" /> Market Exploration & Onboarding
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Niche Setup & Competitor Auto-Discovery
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Define your target market and let AdScope automatically query public ad registries (Meta, Google, TikTok) to discover active competitors and their ad libraries.
        </p>
      </div>

      {/* Main Grid: Onboarding Wizard & Active Niches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Setup Wizard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 glass-panel">
            {wizardStep === 1 ? (
              <form onSubmit={runDiscovery} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="text-sm font-bold text-white">
                      Define Your Niche & Seed Keywords
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Step 1 of 2</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Niche / Market Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clean Energy Drinks & Nootropics"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Industry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="D2C & Wellness">D2C & Wellness</option>
                      <option value="SaaS & AI Infrastructure">SaaS & AI Infrastructure</option>
                      <option value="Fintech & Wealth">Fintech & Wealth</option>
                      <option value="E-Commerce Apparel">E-Commerce Apparel</option>
                      <option value="B2B Professional Services">B2B Professional Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Seed Competitors or Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Magic Mind, Proper Wild, Ketone IQ, nootropic caffeine"
                    value={seeds}
                    onChange={(e) => setSeeds(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    AdScope will search Meta Ad Library, Google Ads Transparency, and TikTok Creative Center using these seeds.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={discovering || !name}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {discovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching Ad Registries...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Run Auto-Discovery</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-sm font-bold text-white">
                      Review Discovered Competitors ({discoveredCompetitors.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setWizardStep(1)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Back to Setup
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  We found these active commercial advertisers in the public ad registries. Click Approve to automatically begin syncing their ads.
                </p>

                <div className="space-y-3">
                  {discoveredCompetitors.map((item, idx) => {
                    const isApproved = approvedMap[item.domain];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                              {item.platform}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {item.confidenceScore}% match
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{item.domain}</p>
                          <p className="text-[11px] text-slate-500 italic">
                            Est. {item.adCountEstimated} active commercial ads tracked
                          </p>
                        </div>

                        <div>
                          {isApproved ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                              <Check className="h-3.5 w-3.5" /> Approved & Syncing
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleApprove(item)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Niche details & Competitors List */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 glass-card space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tracked Niches ({niches.length})
            </h3>
            <div className="space-y-2">
              {niches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedNiche(n);
                    loadCompetitors(n.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedNiche?.id === n.id
                      ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                      : "bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold text-xs">{n.name}</div>
                  <div className="text-[11px] text-slate-400">{n.category} • {n.region}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Competitors in selected niche */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Competitors ({competitors.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {competitors.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No competitors added yet.</div>
              ) : (
                competitors.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.domain}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                      Syncing
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
