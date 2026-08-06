"use client";

import Link from "next/link";
import { Plus, ChevronRight, Laptop, Shirt, Home as HomeIcon } from "lucide-react";

const CATEGORIES = [
  { label: "Electronic", icon: Laptop },
  { label: "Fashion", icon: Shirt },
  { label: "Home", icon: HomeIcon },
];

const QUICK_PRODUCTS = [
  { name: "Smart Fitness Tracker", price: "$39.99" },
  { name: "Leather Wallet", price: "$19.99" },
  { name: "Electric Hair Trimmer", price: "$34.99" },
];

export function AddNewProductWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Add New Product</h2>
        <Link
          href="/products/new"
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New
        </Link>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">Categories</p>
      <div className="mt-2 space-y-2">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            href="/products/new"
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </span>
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </Link>
        ))}
      </div>
      <Link href="/categories" className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">
        See more
      </Link>

      <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">Product</p>
      <div className="mt-2 space-y-3">
        {QUICK_PRODUCTS.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{p.price}</p>
            </div>
            <button
              aria-label={`Add ${p.name}`}
              className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        ))}
      </div>
      <Link href="/products" className="mt-3 inline-block text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">
        See more
      </Link>
    </div>
  );
}
