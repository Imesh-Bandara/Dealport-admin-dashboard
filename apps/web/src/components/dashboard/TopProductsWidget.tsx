"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function TopProductsWidget() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .top(4)
      .then(setProducts)
      .catch(() => setError("Failed to load top products"));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Top Products</h2>
        <button className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">All product</button>
      </div>

      <div className="mt-3 space-y-3">
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {!products && !error && <SkeletonList />}
        {products?.map((product) => (
          <div key={product.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">IMG</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{product.totalOrders} orders</p>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(product.price)}</span>
          </div>
        ))}
        {products?.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">No products yet.</p>}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
