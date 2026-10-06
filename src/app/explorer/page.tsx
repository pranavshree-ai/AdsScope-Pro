"use client";

import React, { useState, useEffect } from "react";
import {
  GalleryHorizontalEnd,
  Search,
  Filter,
  Eye,
  Clock,
  Flame,
  ExternalLink,
  X,
  Bookmark,
  Share2,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function AdExplorerPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedHook, setSelectedHook] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [minDays, setMinDays] = useState<number>(0);

  // Inspector Modal
  const [activeAd, setActiveAd] = useState<any | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, [selectedPlatform, selectedFormat, selectedHook, selectedCompetitor, minDays]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPlatform) params.set("platform", selectedPlatform);
      if (selectedFormat) params.set("format", selectedFormat);
      if (selectedHook) params.set("hookType", selectedHook);
      if (selectedCompetitor) params.set("competitorId", selectedCompetitor);
      if (minDays > 0) params.set("minActiveDays", minDays.toString());
      if (search) params.set("search", search);

      const [adsRes, compsRes] = await Promise.all([
        fetch(`/api/ads?${params.toString()}`).then((r) => r.json()),
        fetch("/api/competitors").then((r) => r.json()),
      ]);

      if (adsRes.success) setAds(adsRes.ads);
      if (compsRes.success) setCompetitors(compsRes.competitors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GalleryHorizontalEnd className="h-3.5 w-3.5" /> Ad Creative Discovery
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Competitor Ad Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and dissect active public ad creatives, creative formats, copy hooks, and destination landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{ads.length}</strong> creatives
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 glass-panel space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search headline, ad copy, offer, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* Platform */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Platforms</option>
            <option value="meta">Meta (FB & IG)</option>
            <option value="google">Google Ads</option>
            <option value="tiktok">TikTok Ads</option>
          </select>

          {/* Competitor */}
          <select
            value={selectedCompetitor}
            onChange={(e) => setSelectedCompetitor(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Competitors</option>
            {competitors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Format */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Formats</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="carousel">Carousel</option>
            <option value="text">Search Text</option>
          </select>

          {/* Hook Type */}
          <select
            value={selectedHook}
            onChange={(e) => setSelectedHook(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Hook Types</option>
            <option value="contrarian">Contrarian</option>
            <option value="social_proof">Social Proof</option>
            <option value="curiosity">Curiosity</option>
            <option value="direct_offer">Direct Offer</option>
            <option value="how_to">How-To</option>
            <option value="pain_point">Pain Point</option>
          </select>

          {/* Longevity Duration Filter */}
          <select
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="0">Any Active Duration</option>
            <option value="30">&gt; 30 Days Active</option>
            <option value="60">&gt; 60 Days (Winners)</option>
            <option value="90">&gt; 90 Days (Scaling)</option>
          </select>

          {(selectedPlatform || selectedFormat || selectedHook || selectedCompetitor || minDays > 0 || search) && (
            <button
              onClick={() => {
                setSelectedPlatform("");
                setSelectedFormat("");
                setSelectedHook("");
                setSelectedCompetitor("");
                setMinDays(0);
                setSearch("");
              }}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Ad Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900/40 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 glass-panel">
          <p className="text-sm text-slate-400">No ads matched your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const isWinner = ad.activeDays >= 60;
            const isSaved = !!savedIds[ad.id];

            return (
              <div
                key={ad.id}
                className="rounded-2xl bg-slate-900/80 border border-white/10 glass-card flex flex-col justify-between overflow-hidden group"
              >
                {/* Media preview */}
                <div className="relative h-48 w-full bg-slate-950">
                  {ad.thumbnailUrl ? (
                    <img
                      src={ad.thumbnailUrl}
                      alt={ad.headline || "Creative"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600 text-xs">
                      No media preview
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {ad.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-semibold text-slate-300 capitalize">
                      {ad.format}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={() => toggleSave(ad.id)}
                      className={`p-1.5 rounded-lg backdrop-blur-md ${
                        isSaved ? "bg-emerald-500 text-slate-950" : "bg-black/60 text-white hover:bg-black/80"
                      } transition-colors`}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Longevity Banner */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                        isWinner
                          ? "bg-amber-500/90 text-slate-950 shadow-lg shadow-amber-500/30"
                          : "bg-black/70 text-slate-200"
                      }`}
                    >
                      {isWinner ? <Flame className="h-3 w-3 fill-slate-950" /> : <Clock className="h-3 w-3" />}
                      <span>{ad.activeDays}d active</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-white">{ad.advertiserName}</span>
                      {ad.analysis && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          {ad.analysis.hookType}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">
                      {ad.headline || "Commercial announcement"}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {ad.adCopy}
                    </p>
                  </div>

                  {/* Footer & Inspect Button */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-emerald-400 font-medium truncate max-w-[160px]">
                      {ad.analysis?.angle || ad.cta || "Direct Offer"}
                    </div>
                    <button
                      onClick={() => setActiveAd(ad)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ad Inspector Modal */}
      {activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{activeAd.advertiserName}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {activeAd.activeDays} Days Running
                </span>
              </div>
              <button
                onClick={() => setActiveAd(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Creative & Copy */}
              <div className="space-y-4">
                {activeAd.creativeUrl && (
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                    <img
                      src={activeAd.creativeUrl}
                      alt={activeAd.headline}
                      className="w-full max-h-80 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Headline
                  </h4>
                  <p className="text-sm font-semibold text-white">{activeAd.headline}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Primary Ad Copy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                    {activeAd.adCopy}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-400">Call to Action:</span>
                  <span className="font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10">
                    {activeAd.cta || "Shop Now"}
                  </span>
                </div>
              </div>

              {/* Right Column: AI Deconstruction & Landing Page */}
              <div className="space-y-6">
                {/* AI Deconstruction */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> AI Creative Deconstruction
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Confidence: {activeAd.analysis?.confidenceScore || 94}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Hook Category</div>
                      <div className="font-bold text-white capitalize mt-0.5">
                        {activeAd.analysis?.hookType || "Contrarian"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase">Funnel Stage</div>
                      <div className="font-bold text-white capitalize mt-0.5">
                        {activeAd.analysis?.funnelStage || "Top of funnel"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Primary Selling Angle:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{activeAd.analysis?.angle}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Core Emotional Driver:</span>
                      <p className="font-medium text-slate-300 mt-0.5">{activeAd.analysis?.emotionalDriver}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Objection Mitigated:</span>
                      <p className="font-medium text-slate-300 mt-0.5">{activeAd.analysis?.objectionHandled}</p>
                    </div>
                  </div>
                </div>

                {/* Landing Page Capture */}
                {activeAd.landingPage && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> Destination Landing Page
                      </h4>
                      <a
                        href={activeAd.landingPage.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Headline & Hook:</span>
                        <p className="font-semibold text-white mt-0.5">{activeAd.landingPage.headline}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px]">Promoted Offer:</span>
                        <p className="font-medium text-emerald-300 mt-0.5">{activeAd.landingPage.offer}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px]">Social Proof Cues:</span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{activeAd.landingPage.socialProof}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
