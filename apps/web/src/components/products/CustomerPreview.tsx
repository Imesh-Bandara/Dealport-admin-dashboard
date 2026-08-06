"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ImageOff, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function CustomerPreview({ product, editHref }: { product: Product; editHref: string }) {
  const images = Array.from(new Set([product.imageUrl, ...product.images].filter(Boolean))) as string[];
  const [activeImage, setActiveImage] = useState(images[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const hasDiscount =
    product.discountPrice !== null && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const inStock = product.stockStatus === "IN_STOCK";
  const maxQty = product.stockUnlimited ? 99 : Math.max(product.stockQuantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin preview banner — not part of the customer-facing chrome */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2.5 text-white sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={editHref}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 font-medium hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to editor
          </Link>
          <span className="hidden text-white/50 sm:inline">|</span>
          <span className="hidden text-white/70 sm:inline">
            Admin preview — this is how <strong className="text-white">{product.name}</strong> looks to customers
          </span>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            product.status === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-900",
          )}
        >
          {product.status === "PUBLISHED" ? "Live" : "Draft — not visible to customers yet"}
        </span>
      </div>

      {/* Storefront chrome */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            DEALP<span className="text-emerald-600">✷</span>RT
          </span>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Home</span>
            <span>Shop</span>
            <span>Deals</span>
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <nav className="mb-5 text-xs text-slate-400">
          Home <span className="mx-1">/</span> {product.category?.name ?? "Shop"} <span className="mx-1">/</span>{" "}
          <span className="text-slate-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((url) => (
                  <button
                    key={url}
                    onClick={() => setActiveImage(url)}
                    className={clsx(
                      "aspect-square overflow-hidden rounded-lg border-2",
                      activeImage === url ? "border-emerald-600" : "border-transparent",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category.name}</p>
            )}
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>

            <div className="mt-2 flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-1 text-xs font-medium text-slate-400">(sample rating — no reviews yet)</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">{formatCurrency(displayPrice)}</span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>
              )}
              {product.taxIncluded && <span className="text-xs text-slate-400">(tax included)</span>}
            </div>

            <div className="mt-3">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  &bull; In Stock{!product.stockUnlimited && ` — ${product.stockQuantity} left`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  &bull; Out of Stock
                </span>
              )}
              {product.featured && (
                <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>
            )}

            {product.colors.length > 0 && (
              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  {product.colors.length > 1 ? "Colors" : "Color"}
                </span>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-block h-7 w-7 rounded-full border border-slate-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-slate-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-slate-500 hover:bg-slate-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty || 99, q + 1))}
                  className="p-2.5 text-slate-500 hover:bg-slate-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                disabled={!inStock}
                title="Preview only — not a live storefront"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Buttons are for layout preview only — this page doesn&apos;t process real orders.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck className="h-4 w-4 text-slate-400" /> Free shipping over $50
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RotateCcw className="h-4 w-4 text-slate-400" /> 30-day returns
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-slate-400" /> Secure checkout
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
