"use client";

import { use, useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CustomerPreview } from "@/components/products/CustomerPreview";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .get(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load product"));
  }, [id]);

  return (
    <AuthGuard>
      {error && (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
        </div>
      )}
      {!product && !error && (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      )}
      {product && <CustomerPreview product={product} editHref={`/products/${id}/edit`} />}
    </AuthGuard>
  );
}
