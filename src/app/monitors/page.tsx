"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Bell,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Loader2,
  X,
  Send,
} from "lucide-react";

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Modal form
  const [ruleType, setRuleType] = useState("new_ad");
  const [competitorId, setCompetitorId] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [monRes, altRes, compRes] = await Promise.all([
        fetch("/api/monitors").then((r) => r.json()),
        fetch("/api/alerts").then((r) => r.json()),
        fetch("/api/competitors").then((r) => r.json()),
      ]);

      if (monRes.success) setMonitors(monRes.monitors);
      if (altRes.success) setAlerts(altRes.alerts);
      if (compRes.success && compRes.competitors.length > 0) {
        setCompetitors(compRes.competitors);
        setCompetitorId(compRes.competitors[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const testMonitors = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/monitors/test", { method: "POST" }).then((r) => r.json());
      if (res.success) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleType,
          competitorId: competitorId || undefined,
          config: {
            thresholdDays: 7,
            slackWebhook: slackWebhook || undefined,
            emailNotification: true,
          },
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (alertId: string) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="h-3.5 w-3.5" /> Surveillance Engine
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Competitor Watch Rules & Signal Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure automated monitors for new ad launches, promotional offer shifts, and creative velocity spikes. Delivers in-app, via email digest, or direct Slack webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={testMonitors}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition-colors"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>Evaluate Rules Now</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Create Watch Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Configured Rules */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Watch Rules ({monitors.length})
          </h2>

          <div className="space-y-3">
            {monitors.map((m) => {
              const comp = competitors.find((c) => c.id === m.competitorId);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {m.ruleType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Target: <strong className="text-white">{comp ? comp.name : "All Competitors"}</strong>
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Frequency: Continuous</span>
                    <span>In-App + Slack</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Alerts Timeline Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Signals & Alerts Timeline ({alerts.length})
          </h2>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-white/10">
                No alerts logged yet. Click "Evaluate Rules Now" to test.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alert.status === "unread"
                      ? "bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                      : "bg-slate-950/60 border-white/5 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            alert.severity === "alert"
                              ? "bg-rose-500/20 text-rose-400"
                              : alert.severity === "warning"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Channel: {alert.channel}</span>
                        <span>•</span>
                        <span>Detected: Today</span>
                      </div>
                    </div>

                    <div>
                      {alert.status === "unread" ? (
                        <button
                          onClick={() => markRead(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-slate-500" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Create Competitor Watch Rule</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createRule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Condition</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                >
                  <option value="new_ad">New Ad Launched (Any Platform)</option>
                  <option value="new_offer">Promotional Offer Detected (Discounts/Guarantees)</option>
                  <option value="velocity_spike">Creative Velocity Spike (+30% Launches)</option>
                  <option value="ad_stopped">Winning Long-Running Ad Stopped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Competitor Target</label>
                <select
                  value={competitorId}
                  onChange={(e) => setCompetitorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                >
                  <option value="">All Competitors in Niche</option>
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Slack Webhook URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
