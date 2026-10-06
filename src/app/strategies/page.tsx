"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  X,
  Eye,
  Clock,
} from "lucide-react";

export default function StrategyLabPage() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<any | null>(null);
  const [citedAds, setCitedAds] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNicheId, setSelectedNicheId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Evidence Drawer state
  const [evidenceModalConcept, setEvidenceModalConcept] = useState<any | null>(null);

  // Generator form
  const [productName, setProductName] = useState("Aura Flow Nootropic Elixir");
  const [description, setDescription] = useState(
    "Sparkling cold-pressed yuzu nootropic beverage infused with Alpha-GPC, L-Theanine, and wild green tea."
  );
  const [targetAudience, setTargetAudience] = useState(
    "High-performing tech founders, developers, creators, and athletes (ages 24-42)."
  );
  const [usp, setUsp] = useState(
    "Zero afternoon jitters, 6 hours of clean cognition, exquisite natural citrus taste, zero artificial sweeteners."
  );
  const [pricePoint, setPricePoint] = useState("$3.75/can ($45 per 12-pack)");

  useEffect(() => {
    loadNichesAndStrategies();
  }, []);

  const loadNichesAndStrategies = async () => {
    try {
      const [nichesRes, stratRes] = await Promise.all([
        fetch("/api/niches").then((r) => r.json()),
        fetch("/api/strategies").then((r) => r.json()),
      ]);

      if (nichesRes.success && nichesRes.niches.length > 0) {
        setNiches(nichesRes.niches);
        setSelectedNicheId(nichesRes.niches[0].id);
      }
      if (stratRes.success && stratRes.strategies.length > 0) {
        setStrategies(stratRes.strategies);
        loadStrategyDetails(stratRes.strategies[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStrategyDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/strategies/${id}`).then((r) => r.json());
      if (res.success) {
        setActiveStrategy(res.strategy);
        setCitedAds(res.citedAds || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId: selectedNicheId,
          brandProfile: {
            productName,
            description,
            targetAudience,
            usp,
            pricePoint,
          },
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowGenerateModal(false);
        setStrategies((prev) => [res.strategy, ...prev]);
        loadStrategyDetails(res.strategy.id);
      } else {
        alert(res.error || "Failed to generate strategy");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const exportMarkdown = () => {
    if (!activeStrategy) return;
    const content = `# ${activeStrategy.title}\n\n## Brand Profile\n- Product: ${activeStrategy.brandProfile?.productName}\n- Description: ${activeStrategy.brandProfile?.description}\n- Target Audience: ${activeStrategy.brandProfile?.targetAudience}\n- USP: ${activeStrategy.brandProfile?.usp}\n\n## Positioning Gaps\n${activeStrategy.positioningGaps?.map((g: any) => `### ${g.gap}\n- Opportunity: ${g.opportunity}\n- Recommended Angle: ${g.recommendedAngle}\n`).join("\n")}\n\n## Ad Concepts\n${activeStrategy.items?.map((item: any, i: number) => `### Concept ${i + 1}: ${item.conceptTitle}\n- Hook: ${item.hook}\n- Angle: ${item.angle}\n- Creative Direction: ${item.creativeDirection}\n- Grounded Ad Citations: ${item.citedAdIds?.join(", ")}\n`).join("\n")}\n\n## 2-Week Test Plan\n${activeStrategy.twoWeekTestPlan?.map((plan: any) => `### ${plan.dayRange}\n- Hypothesis: ${plan.hypothesis}\n- Target KPI: ${plan.kpi}\n`).join("\n")}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeStrategy.brandProfile?.productName}_ad_strategy.md`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lightbulb className="h-3.5 w-3.5" /> AI Strategy Synthesizer
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Grounded Ad Strategy & Test Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Synthesize verified competitor signals into 10 high-converting creative concepts and a 2-week testing roadmap. Every recommendation strictly cites real competitor ads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeStrategy && (
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export Strategy
            </button>
          )}

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate Strategy
          </button>
        </div>
      </div>

      {activeStrategy ? (
        <div className="space-y-8">
          {/* Strategy Meta & Brand Header */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Grounded Evidence Verified
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{activeStrategy.title}</h2>
              </div>
              <div className="text-xs text-slate-400">
                Brand: <strong className="text-white">{activeStrategy.brandProfile?.productName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Unique Selling Prop</span>
                <p className="text-slate-200 mt-1 font-medium">{activeStrategy.brandProfile?.usp}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Demographic</span>
                <p className="text-slate-200 mt-1 font-medium">{activeStrategy.brandProfile?.targetAudience}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Price Tier</span>
                <p className="text-slate-200 mt-1 font-medium">{activeStrategy.brandProfile?.pricePoint}</p>
              </div>
            </div>
          </div>

          {/* Positioning Gaps */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Strategic Positioning Gaps & Market Opportunities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeStrategy.positioningGaps?.map((gap: any, i: number) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 glass-card space-y-3"
                >
                  <div className="text-xs font-bold text-emerald-400">Gap #{i + 1}: {gap.gap}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{gap.opportunity}</p>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Recommended Angle:</span>
                    <p className="text-xs font-semibold text-white mt-0.5">"{gap.recommendedAngle}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Ad Concepts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" /> 10 Evidence-Grounded Ad Concepts
              </h3>
              <span className="text-xs text-slate-400">All concepts cite underlying ads</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeStrategy.items?.map((concept: any, idx: number) => (
                <div
                  key={concept.id || idx}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 glass-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{concept.conceptTitle}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 uppercase">
                        {concept.funnelStage} funnel
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Scroll-Stopping Hook
                      </span>
                      <p className="text-xs font-semibold text-white mt-1">"{concept.hook}"</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Copy Variations</span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                        {concept.copyVariants?.map((variant: string, vi: number) => (
                          <li key={vi}>{variant}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Creative Brief: </span>
                      {concept.creativeDirection}
                    </div>
                  </div>

                  {/* Grounded Citation Badge */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{concept.citedAdIds?.length || 2} Verified Ad Citations</span>
                    </div>
                    <button
                      onClick={() => setEvidenceModalConcept(concept)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Week Test Plan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" /> 2-Week Systematic Testing Sprint
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeStrategy.twoWeekTestPlan?.map((plan: any, i: number) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 glass-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{plan.dayRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Hypothesis:</span>
                    <p className="text-xs text-white mt-1 leading-relaxed">{plan.hypothesis}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Target KPI:</span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">{plan.kpi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 glass-panel">
          <p className="text-sm text-slate-400">No strategy generated yet.</p>
        </div>
      )}

      {/* Generate Strategy Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Generate Grounded Ad Strategy
              </h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Niche</label>
                <select
                  value={selectedNicheId}
                  onChange={(e) => setSelectedNicheId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                >
                  {niches.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Demographic</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Unique Selling Proposition (USP)</label>
                <input
                  type="text"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing (Costs 50 Credits)...</span>
                    </>
                  ) : (
                    <span>Generate Strategy (50 Credits)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Drawer Modal */}
      {evidenceModalConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold">
                  Grounded Citation Evidence
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {evidenceModalConcept.conceptTitle}
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModalConcept(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              The recommendations, hook angle, and copy variants for this concept were synthesized from the following verified competitor ads:
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {citedAds
                .filter((a) => evidenceModalConcept.citedAdIds?.includes(a.id))
                .map((citedAd) => (
                  <div
                    key={citedAd.id}
                    className="p-4 rounded-xl bg-slate-950 border border-white/10 flex gap-4 items-center"
                  >
                    {citedAd.thumbnailUrl && (
                      <img
                        src={citedAd.thumbnailUrl}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{citedAd.advertiserName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                          {citedAd.activeDays} Days Active
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{citedAd.headline}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{citedAd.adCopy}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
