interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
      >
        ← Previous
      </button>
      <div className="flex items-center gap-1.5">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
              p === page
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {p}
          </button>
        ))}
        {totalPages > 5 && <span className="px-1 text-slate-400 dark:text-slate-500">…</span>}
        {totalPages > 5 && (
          <button
            onClick={() => onChange(totalPages)}
            className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {totalPages}
          </button>
        )}
      </div>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
      >
        Next →
      </button>
    </div>
  );
}
