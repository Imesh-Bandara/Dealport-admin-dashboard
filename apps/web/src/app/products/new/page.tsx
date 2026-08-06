"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <AppShell title="Add Product">
      <ProductForm mode="create" />
    </AppShell>
  );
}
