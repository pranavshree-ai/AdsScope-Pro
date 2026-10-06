"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  GalleryHorizontalEnd,
  Users2,
  Lightbulb,
  Radio,
  Cpu,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Niches & Discovery", href: "/niches", icon: Compass },
  { name: "Ad Explorer", href: "/explorer", icon: GalleryHorizontalEnd },
  { name: "Competitors", href: "/competitors", icon: Users2 },
  { name: "Strategy Lab", href: "/strategies", icon: Lightbulb },
  { name: "Monitors & Alerts", href: "/monitors", icon: Radio },
  { name: "Pipeline Jobs", href: "/jobs", icon: Cpu },
  { name: "Plans & Billing", href: "/billing", icon: CreditCard },
  { name: "SuperAdmin", href: "/admin", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#090D16] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Intelligence Hub
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Compliance badge */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-tight">Public Ad Policy Safe</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          100% aggregate commercial transparency disclosures. Zero personal data collection guaranteed.
        </p>
      </div>
    </aside>
  );
}
