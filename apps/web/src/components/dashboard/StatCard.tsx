import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  period: string;
  value: string;
  changeLabel: string;
  changeDirection: "up" | "down";
  footnote: string;
}

export function StatCard({ title, period, value, changeLabel, changeDirection, footnote }: StatCardProps) {
  const isUp = changeDirection === "up";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{period}</p>
        </div>
        <button aria-label="More options" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
        <span
          className={clsx(
            "flex items-center gap-0.5 text-xs font-semibold",
            isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
          )}
        >
          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {changeLabel}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{footnote}</p>

      <button className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        Details
      </button>
    </div>
  );
}

interface SplitStatCardProps {
  title: string;
  period: string;
  pendingValue: string;
  pendingSubLabel: string;
  canceledValue: string;
  canceledChangeLabel: string;
}

export function SplitStatCard({
  title,
  period,
  pendingValue,
  pendingSubLabel,
  canceledValue,
  canceledChangeLabel,
}: SplitStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{period}</p>
        </div>
        <button aria-label="More options" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pending</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingValue}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{pendingSubLabel}</span>
          </div>
        </div>
        <div className="border-l border-slate-100 pl-3 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">Canceled</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-red-500 dark:text-red-400">{canceledValue}</span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500 dark:text-red-400">
              <ArrowDownRight className="h-3.5 w-3.5" />
              {canceledChangeLabel}
            </span>
          </div>
        </div>
      </div>

      <button className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        Details
      </button>
    </div>
  );
}
