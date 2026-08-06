"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

const THIS_WEEK = [
  { day: "Sun", value: 18 },
  { day: "Mon", value: 24 },
  { day: "Tue", value: 20 },
  { day: "Wed", value: 34 },
  { day: "Thu", value: 22 },
  { day: "Fri", value: 28 },
  { day: "Sat", value: 30 },
];

const LAST_WEEK = [
  { day: "Sun", value: 12 },
  { day: "Mon", value: 19 },
  { day: "Tue", value: 15 },
  { day: "Wed", value: 21 },
  { day: "Thu", value: 17 },
  { day: "Fri", value: 23 },
  { day: "Sat", value: 20 },
];

const SUMMARY = [
  { label: "Customers", value: "52k" },
  { label: "Total Products", value: "3.5k" },
  { label: "Stock Products", value: "2.5k" },
  { label: "Out of Stock", value: "0.5k" },
  { label: "Revenue", value: "250k" },
];

export function ReportChart() {
  const [range, setRange] = useState<"this" | "last">("this");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = range === "this" ? THIS_WEEK : LAST_WEEK;
  const tickColor = isDark ? "#64748b" : "#94a3b8";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Report for this week</h2>
        <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium dark:border-slate-700">
          <button
            onClick={() => setRange("this")}
            className={`rounded-md px-3 py-1 transition-colors ${
              range === "this"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            This week
          </button>
          <button
            onClick={() => setRange("last")}
            className={`rounded-md px-3 py-1 transition-colors ${
              range === "last"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Last week
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {SUMMARY.map((item) => (
          <div key={item.label}>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: tickColor }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}k`}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
              tick={{ fontSize: 11, fill: tickColor }}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                borderColor: isDark ? "#334155" : "#e2e8f0",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                fontSize: 12,
              }}
              labelStyle={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: 600 }}
              itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#reportGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
