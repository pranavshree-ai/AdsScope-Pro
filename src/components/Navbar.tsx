"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radar,
  Bell,
  Sparkles,
  ChevronDown,
  Building,
  Check,
  Plus,
  ExternalLink,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  aiCreditsBalance: number;
}

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  useEffect(() => {
    fetchSession();
    fetchAlerts();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.success) {
        setSession(data);
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    try {
      await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      setShowWorkspaceMenu(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch workspace", err);
    }
  };

  const unreadAlerts = alerts.filter((a) => a.status === "unread");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090D16]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full rounded-[10px] bg-[#090D16] flex items-center justify-center">
                <Radar className="h-5 w-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AdScope <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Competitive Ad Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Right actions: Workspace selector, Credits, Alerts, Profile */}
        <div className="flex items-center gap-4">
          {/* AI Credits Pill */}
          {session?.workspace && (
            <Link
              href="/billing"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:border-emerald-500/40 transition-colors text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">
                {session.workspace.aiCreditsBalance} Credits
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10">
                {session.workspace.planTier.toUpperCase()}
              </span>
            </Link>
          )}

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span className="max-w-[120px] truncate">{session?.workspace?.name || "Loading..."}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {session?.allWorkspaces?.map((ws: Workspace) => (
                  <button
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <div className="truncate">
                      <div className="font-medium text-white truncate">{ws.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{ws.planTier} tier</div>
                    </div>
                    {ws.id === session?.workspace?.id && (
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
                  <span className="text-xs font-semibold text-white">Ad Alerts & Signals</span>
                  <Link
                    href="/monitors"
                    onClick={() => setShowAlertMenu(false)}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    View Rules
                  </Link>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-white/5 py-1">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No new alerts</div>
                  ) : (
                    alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-2.5 hover:bg-slate-800/50 rounded-lg text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200 truncate">{alert.title}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                              alert.severity === "alert"
                                ? "bg-rose-500/20 text-rose-400"
                                : alert.severity === "warning"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950">
              {session?.user?.name ? session.user.name.charAt(0) : "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
