"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProductForm } from "@/components/products/ProductForm";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
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
    <AppShell title="Edit Product">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!product && !error && <p className="text-sm text-slate-400">Loading product…</p>}
      {product && <ProductForm mode="edit" productId={id} initialData={product} />}
    </AppShell>
  );
}
