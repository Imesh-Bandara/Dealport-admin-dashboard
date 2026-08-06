"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Plus, MoreVertical, Search, Pencil, Trash2, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Pagination } from "@/components/ui/Pagination";
import { CATEGORY_TILES, listCategoryProducts, type CategoryProductRow } from "@/lib/mock/categories-page";

const TABS = ["All Product", "Featured Products", "On Sale", "Out of Stock"] as const;

export default function CategoriesPage() {
  const [products, setProducts] = useState<CategoryProductRow[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Product");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    listCategoryProducts().then(setProducts);
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell title="Categories">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-900">Discover</h1>
        <div className="flex gap-2">
          <Link
            href="/products/new"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            More Action <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORY_TILES.slice(0, 4).map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:border-emerald-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">{c.emoji}</span>
              <span className="text-sm font-semibold text-slate-800">{c.name}</span>
            </div>
          ))}
        </div>
        <button className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 lg:flex">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORY_TILES.slice(4, 8).map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:border-emerald-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">{c.emoji}</span>
            <span className="text-sm font-semibold text-slate-800">{c.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm font-medium">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "rounded-md px-3 py-1.5 transition-colors",
                  tab === t ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {t === "All Product" ? `All Product (145)` : t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your product"
              className="w-56 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="w-8 py-2 pr-3"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="py-2 pr-3 font-medium">No.</th>
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Created Date</th>
                <th className="py-2 pr-3 font-medium">Order</th>
                <th className="py-2 pr-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={`${p.name}-${i}`} className="border-t border-slate-100">
                  <td className="py-3 pr-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="py-3 pr-3 text-slate-500">{p.no}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">{p.emoji}</span>
                      <span className="font-medium text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{p.createdDate}</td>
                  <td className="py-3 pr-3 text-slate-500">{p.orders}</td>
                  <td className="py-3 pr-3 text-right">
                    <button aria-label="Edit" className="mr-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button aria-label="Delete" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={24} onChange={setPage} />
      </div>
    </AppShell>
  );
}
