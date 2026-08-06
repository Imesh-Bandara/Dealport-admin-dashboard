"use client";

import { Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NotificationBell } from "./NotificationBell";

export function Topbar({ title }: { title: string }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search data, users, or reports"
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-emerald-900"
          />
        </div>
        <NotificationBell />
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="relative flex h-7 w-14 items-center rounded-full bg-slate-100 px-1 transition-colors dark:bg-slate-800"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform dark:bg-slate-600 ${
              isDark ? "translate-x-7" : "translate-x-0"
            }`}
          >
            {isDark ? <Moon className="h-3 w-3 text-slate-200" /> : <Sun className="h-3 w-3 text-amber-500" />}
          </span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
          {user?.name?.charAt(0) ?? "D"}
        </div>
      </div>
    </header>
  );
}
