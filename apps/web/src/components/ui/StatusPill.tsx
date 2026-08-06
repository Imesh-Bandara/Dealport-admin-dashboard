import clsx from "clsx";

const DOT_STYLES: Record<string, string> = {
  emerald: "text-emerald-600",
  amber: "text-amber-500",
  red: "text-red-500",
  slate: "text-slate-500",
};

export function StatusPill({ label, tone }: { label: string; tone: keyof typeof DOT_STYLES }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-sm font-medium", DOT_STYLES[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
