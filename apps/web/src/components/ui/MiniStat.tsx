import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

interface MiniStatProps {
  title: string;
  value: string;
  changeLabel?: string;
  changeDirection?: "up" | "down";
  period?: string;
  valueClassName?: string;
}

export function MiniStat({
  title,
  value,
  changeLabel,
  changeDirection = "up",
  period = "Last 7 days",
  valueClassName,
}: MiniStatProps) {
  const isUp = changeDirection === "up";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <button aria-label="More options" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={clsx("text-2xl font-bold text-slate-900 dark:text-slate-100", valueClassName)}>{value}</span>
        {changeLabel && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-xs font-semibold",
              isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
            )}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {changeLabel}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{period}</p>
    </div>
  );
}
