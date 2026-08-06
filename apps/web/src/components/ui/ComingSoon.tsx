import { AppShell } from "@/components/layout/AppShell";
import type { LucideIcon } from "lucide-react";

export function ComingSoon({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <AppShell title={title}>
      <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-slate-500">
          This screen isn&apos;t built out yet — it&apos;s next up on the roadmap.
        </p>
      </div>
    </AppShell>
  );
}
