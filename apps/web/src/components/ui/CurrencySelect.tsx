"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { CountryCurrency } from "@/lib/currency";

interface CurrencySelectProps {
  /** Selected country name — the unique key, since several countries can
   *  share a currency (e.g. the eurozone). */
  value: string;
  options: CountryCurrency[];
  onChange: (country: string) => void;
}

/** Searchable "flag + currency code" dropdown for the Pricing section's
 *  country/currency picker — a plain <select> doesn't scale to filtering
 *  ~80 countries by name or currency code. */
export function CurrencySelect({ value, options, onChange }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.country === value) ?? options[0];

  const filtered = options.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return o.country.toLowerCase().includes(q) || o.currency.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Focusing the search input is an imperative DOM action, not state — fine
  // to do in an effect. Resetting `query` happens in the click handler below
  // instead, so this effect never calls setState itself.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function toggleOpen() {
    if (!open) setQuery("");
    setOpen((v) => !v);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-full items-center gap-1 py-2 pl-2 pr-1 text-sm text-slate-600 outline-none"
      >
        <span aria-hidden>{selected.flag}</span>
        <span>{selected.currency}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-2 dark:border-slate-700">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or currency…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400">No matches.</li>
            )}
            {filtered.map((o) => (
              <li key={o.country}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.country === value}
                  onClick={() => {
                    onChange(o.country);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 ${
                    o.country === value
                      ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span aria-hidden>{o.flag}</span>
                  <span className="flex-1 truncate">{o.country}</span>
                  <span className="text-xs text-slate-400">{o.currency}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
