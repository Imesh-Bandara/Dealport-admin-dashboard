"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api, ApiError } from "@/lib/api";
import type { Category, PaginatedProducts, ProductStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 8;

export default function ProductListPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.resolve()
      .then(() => setIsLoading(true))
      .then(() => api.products.list({ page, limit: PAGE_SIZE, search, status, categoryId }))
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load products"))
      .finally(() => setIsLoading(false));
  }, [page, search, status, categoryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => undefined);
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.products.remove(id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="Product List">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Products</h1>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search products…"
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
            />
            <select
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as ProductStatus | "");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
            >
              <option value="">All statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <Link
              href="/products/new"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 dark:text-slate-500">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Total Orders</th>
                <th className="py-2 pr-3 font-medium">Stock</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 pr-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [0, 1, 2, 3].map((i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td colSpan={7} className="py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.items.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">IMG</span>
                          )}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-500 dark:text-slate-400">{product.category?.name ?? "—"}</td>
                    <td className="py-3 pr-3 text-slate-500 dark:text-slate-400">{product.totalOrders}</td>
                    <td
                      className={clsx(
                        "py-3 pr-3 font-medium",
                        product.stockStatus === "IN_STOCK" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                      )}
                    >
                      &bull; {product.stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          product.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                        )}
                      >
                        {product.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <Link
                        href={`/products/${product.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${product.name} as customer`}
                        className="mr-1 inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        aria-label={`Edit ${product.name}`}
                        onClick={() => router.push(`/products/${product.id}/edit`)}
                        className="mr-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${product.name}`}
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-slate-400 dark:text-slate-500">
              Page {data.meta.page} of {data.meta.totalPages} &middot; {data.meta.total} products
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
