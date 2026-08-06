"use client";

import { MoreHorizontal } from "lucide-react";
import { CircleFlag } from "./CircleFlag";

const BAR_HEIGHTS = [30, 45, 25, 60, 40, 70, 35, 55, 80, 45, 65, 30, 50, 40, 60, 35, 70, 45];

const COUNTRIES = [
  { code: "US", name: "US", sales: "30k", change: "+25.8%", up: true, bar: 78 },
  { code: "BR", name: "Brazil", sales: "30k", change: "-15.8%", up: false, bar: 55 },
  { code: "AU", name: "Australia", sales: "25k", change: "+35.6%", up: true, bar: 65 },
];

export function UsersInsightWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Users in last 30 minutes</p>
        <button aria-label="More options" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">21.5K</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">Users per minute</p>

      <div className="mt-3 flex h-16 items-end gap-1">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-emerald-500/80 dark:bg-emerald-500/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
        <span>Sales by Country</span>
        <span>Sales</span>
      </div>

      <div className="mt-2 space-y-3">
        {COUNTRIES.map((c) => (
          <div key={c.code} className="flex items-center gap-3">
            <CircleFlag code={c.code} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.sales}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{c.name}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${c.bar}%` }}
                />
              </div>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold ${c.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
            >
              {c.up ? "↑" : "↓"} {c.change}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        View Insight
      </button>
    </div>
  );
}
