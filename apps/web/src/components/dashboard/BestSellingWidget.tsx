"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BestSellingWidget() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .bestSelling(4)
      .then(setProducts)
      .catch(() => setError("Failed to load best selling products"));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Best selling product</h2>
        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Filter
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-400 dark:text-slate-500">
              <th className="py-2 pr-3 font-medium">Product</th>
              <th className="py-2 pr-3 font-medium">Total Order</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {!products &&
              !error &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2.5 pr-3" colSpan={4}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))}
            {products?.map((product) => (
              <tr key={product.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    {product.name}
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{product.totalOrders}</td>
                <td
                  className={clsx(
                    "py-2.5 pr-3 font-medium",
                    product.stockStatus === "IN_STOCK" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                  )}
                >
                  &bull; {product.stockStatus === "IN_STOCK" ? "Stock" : "Stock out"}
                </td>
                <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(product.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        Details
      </button>
    </div>
  );
}
