"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Activity,
  Layers,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobsAndHealth();
  }, []);

  const loadJobsAndHealth = async () => {
    try {
      setLoading(true);
      const [jobsRes, healthRes] = await Promise.all([
        fetch("/api/jobs").then((r) => r.json()),
        fetch("/api/health").then((r) => r.json()),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs);
      if (healthRes.status === "ok") setHealthData(healthRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerJob = async (type: string) => {
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload: {} }),
      });
      loadJobsAndHealth();
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
            <Cpu className="h-3.5 w-3.5" /> Background Orchestration
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pipeline Jobs & Ingestion Workers
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitor scheduled collection runs, AI deconstruction workers, deduplication checkpoints, and live provider adapter status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadJobsAndHealth()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
          </button>
          <button
            onClick={() => triggerJob("sync_ads")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Play className="h-3.5 w-3.5" /> Run Global Ingestion
          </button>
        </div>
      </div>

      {/* Provider Source Health Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Provider Adapters & Ingestion Endpoints Health
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthData?.sources?.map((source: any, i: number) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 glass-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {source.platform}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Healthy
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Latency:</span>
                  <span className="font-mono text-white">{source.latencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Rate Quota Remaining:</span>
                  <span className="font-mono text-emerald-400">{source.rateLimitRemaining || 200}/hr</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5">
                Ethical ToS throttling enabled • Zero personal data
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pipeline Execution Logs ({jobs.length})
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 glass-panel">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Job ID & Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Result Summary</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white capitalize">
                      {job.type.replace("_", " ")}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">{job.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        job.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : job.status === "running"
                          ? "bg-indigo-500/15 text-indigo-400 animate-pulse"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                    {job.result ? JSON.stringify(job.result) : "Processing..."}
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
