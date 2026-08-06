"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Eye, ImagePlus, Loader2, Pencil, Plus, Wand2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Category, Product, ProductInput, StockStatus } from "@/lib/types";
import {
  COUNTRY_CURRENCIES,
  DEFAULT_COUNTRY_CURRENCY,
  convertBetween,
  findCountry,
  formatCurrencyAmount,
  toUsd,
} from "@/lib/currency";
import { CurrencySelect } from "@/components/ui/CurrencySelect";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const COLOR_SWATCHES = ["#bbf7d0", "#fecaca", "#bfdbfe", "#fef08a", "#1f2937"];

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: Product;
}

export function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(true);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // `price` and `discountAmount` are always denominated in whichever
  // currency `country` currently points at — not fixed to USD. Switching
  // the country selector live-converts both displayed numbers (see
  // handleCountryChange); only buildPayload() normalizes back to USD for
  // the API. initialData.price/discountPrice are USD from the API, and the
  // default country is the USD entry, so no conversion is needed on load.
  const [price, setPrice] = useState(initialData?.price ?? "");
  // The API stores the final sale price in `discountPrice`, but the form asks
  // for the discount *amount* to subtract and computes/displays the sale
  // price live (see the "Sale= $x" preview below) — this state holds that
  // amount, not the final price.
  const [discountAmount, setDiscountAmount] = useState(() => {
    if (!initialData?.discountPrice) return "";
    const amount = Number(initialData.price) - Number(initialData.discountPrice);
    return amount > 0 ? String(amount) : "";
  });
  const [country, setCountry] = useState(DEFAULT_COUNTRY_CURRENCY.country);
  const [expirationStart, setExpirationStart] = useState(initialData?.expirationStart?.slice(0, 10) ?? "");
  const [expirationEnd, setExpirationEnd] = useState(initialData?.expirationEnd?.slice(0, 10) ?? "");
  const [taxIncluded, setTaxIncluded] = useState(initialData?.taxIncluded ?? true);
  const [stockQuantity, setStockQuantity] = useState(String(initialData?.stockQuantity ?? 0));
  const [stockUnlimited, setStockUnlimited] = useState(initialData?.stockUnlimited ?? false);
  const [stockStatus, setStockStatus] = useState<StockStatus>(initialData?.stockStatus ?? "IN_STOCK");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [tags, setTags] = useState(initialData?.tags.map((t) => t.name).join(", ") ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [color, setColor] = useState(initialData?.color ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<"draft" | "publish" | null>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  function validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Only JPEG, PNG, WEBP, or GIF images are allowed.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "Image must be 5MB or smaller.";
    }
    return null;
  }

  async function handleMainImageSelect(file: File | undefined) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsUploadingMain(true);
    try {
      const { url } = await api.uploads.image(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setIsUploadingMain(false);
    }
  }

  async function handleGalleryImageSelect(file: File | undefined) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (images.length >= 10) {
      setError("You can add up to 10 gallery images.");
      return;
    }
    setError(null);
    setIsUploadingGallery(true);
    try {
      const { url } = await api.uploads.image(file);
      setImages((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload image.");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  function removeGalleryImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setError("Failed to load categories"));
  }, []);

  // Both displayed in `selectedCurrency`'s terms — see the state comment above.
  const numericPrice = Number(price) || 0;
  const numericDiscountAmount = Number(discountAmount) || 0;
  const salePrice = numericDiscountAmount > 0 ? Math.max(0, numericPrice - numericDiscountAmount) : null;
  const selectedCurrency = findCountry(country);
  const priceUsd = numericPrice > 0 ? toUsd(numericPrice, selectedCurrency) : 0;
  const salePriceUsd = salePrice !== null ? toUsd(salePrice, selectedCurrency) : null;

  /** Re-expresses the currently entered price/discount in the newly picked
   *  currency's terms so the fields visibly update in real time, instead of
   *  silently reinterpreting the same digits as a different currency. */
  function handleCountryChange(nextCountry: string) {
    const nextCurrency = findCountry(nextCountry);
    setCountry(nextCountry);
    setPrice((prev) => {
      const n = Number(prev);
      if (!prev || Number.isNaN(n)) return prev;
      return convertBetween(n, selectedCurrency, nextCurrency).toFixed(nextCurrency.decimals);
    });
    setDiscountAmount((prev) => {
      const n = Number(prev);
      if (!prev || Number.isNaN(n)) return prev;
      return convertBetween(n, selectedCurrency, nextCurrency).toFixed(nextCurrency.decimals);
    });
  }

  async function handleGenerateDescription() {
    if (!name.trim()) {
      setDescriptionError("Enter a product name first.");
      return;
    }
    setDescriptionError(null);
    setIsGeneratingDescription(true);
    try {
      const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;
      const { description: generated } = await api.products.generateDescription({
        name: name.trim(),
        category: selectedCategoryName,
        price: priceUsd > 0 ? priceUsd : undefined,
      });
      setDescription(generated);
      setIsDescriptionEditable(true);
    } catch (err) {
      setDescriptionError(
        err instanceof ApiError ? err.message : "Failed to generate a description. Please try again.",
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  function buildPayload(status: "DRAFT" | "PUBLISHED"): ProductInput {
    return {
      name,
      description: description || undefined,
      price: priceUsd,
      // The form collects a discount *amount*; the API stores the resulting
      // final sale price in `discountPrice`. Both are normalized to USD here
      // regardless of which currency was selected while editing.
      discountPrice: salePriceUsd !== null ? salePriceUsd : undefined,
      expirationStart: expirationStart ? new Date(expirationStart).toISOString() : undefined,
      expirationEnd: expirationEnd ? new Date(expirationEnd).toISOString() : undefined,
      taxIncluded,
      stockQuantity: Number(stockQuantity) || 0,
      stockUnlimited,
      stockStatus,
      status,
      featured,
      categoryId: categoryId || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl: imageUrl || undefined,
      images: images.length > 0 ? images : undefined,
      color: color || undefined,
    };
  }

  async function handleSubmit(e: FormEvent, status: "DRAFT" | "PUBLISHED") {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!price || Number(price) < 0) {
      setError("Enter a valid product price.");
      return;
    }
    if (expirationStart && expirationEnd && new Date(expirationEnd) < new Date(expirationStart)) {
      setError("Expiration end date must not be before the start date.");
      return;
    }
    if (isUploadingMain || isUploadingGallery) {
      setError("Please wait for image upload to finish.");
      return;
    }

    setIsSubmitting(status === "DRAFT" ? "draft" : "publish");
    try {
      const payload = buildPayload(status);
      if (mode === "edit" && productId) {
        await api.products.update(productId, payload);
      } else {
        await api.products.create(payload);
      }
      router.push("/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save product.");
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <form className="space-y-5" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </h1>
        <div className="flex gap-2">
          {mode === "edit" && productId && (
            <Link
              href={`/products/${productId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" /> View as Customer
            </Link>
          )}
          <button
            type="button"
            disabled={isSubmitting !== null}
            onClick={(e) => handleSubmit(e, "DRAFT")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isSubmitting === "draft" ? "Saving…" : "Save to draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting !== null}
            onClick={(e) => handleSubmit(e, "PUBLISHED")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting === "publish" ? "Publishing…" : "Publish Product"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Basic Details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    readOnly={!isDescriptionEditable}
                    rows={4}
                    maxLength={4000}
                    className={clsx(
                      "w-full rounded-lg border border-slate-300 px-3 py-2 pb-9 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
                      !isDescriptionEditable && "bg-slate-50 text-slate-500",
                    )}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={isDescriptionEditable ? "Lock description" : "Edit description"}
                      aria-pressed={isDescriptionEditable}
                      title={isDescriptionEditable ? "Lock description" : "Edit description"}
                      onClick={() => setIsDescriptionEditable((v) => !v)}
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                        isDescriptionEditable
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-white text-slate-400 hover:text-slate-600",
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Generate description with AI"
                      title="Generate description with AI"
                      disabled={isGeneratingDescription}
                      onClick={() => void handleGenerateDescription()}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGeneratingDescription ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {descriptionError && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600">
                    {descriptionError}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-slate-400">
                  <Pencil className="mr-1 inline h-3 w-3 align-[-1px]" /> toggles editing ·{" "}
                  <Wand2 className="mr-1 inline h-3 w-3 align-[-1px]" /> generates a description from the name/
                  category/price via Gemini.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Pricing</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product Price
                </label>
                <div className="flex items-stretch rounded-lg border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <span className="flex items-center pl-3 text-sm text-slate-400">{selectedCurrency.symbol}</span>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full min-w-0 border-none bg-transparent px-2 py-2 text-sm outline-none"
                  />
                  <div className="flex items-center border-l border-slate-200 pl-1">
                    <CurrencySelect value={country} options={COUNTRY_CURRENCIES} onChange={handleCountryChange} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedCurrency.currency === "USD"
                    ? "Stored and submitted in USD."
                    : `= ${formatCurrencyAmount(priceUsd, DEFAULT_COUNTRY_CURRENCY)} — this is what's stored and submitted (converted live at a static reference rate, not a live feed).`}
                </p>
              </div>

              <div>
                <label htmlFor="discountAmount" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Discounted Price (Optional)
                </label>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <span className="flex items-center bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
                    {selectedCurrency.symbol}
                  </span>
                  <input
                    id="discountAmount"
                    type="number"
                    min={0}
                    step="any"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full min-w-0 border-none px-2 py-2 text-sm outline-none"
                  />
                  {salePrice !== null && (
                    <span className="flex items-center whitespace-nowrap pr-3 text-xs text-slate-500">
                      Sale=
                      <span className="ml-1 font-semibold text-emerald-600">
                        {formatCurrencyAmount(salePrice, selectedCurrency)}
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">Amount to subtract from the price above.</p>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Tax Included</span>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-1.5 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="taxIncluded"
                      checked={taxIncluded}
                      onChange={() => setTaxIncluded(true)}
                      className="accent-emerald-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="taxIncluded"
                      checked={!taxIncluded}
                      onChange={() => setTaxIncluded(false)}
                      className="accent-emerald-600"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Expiration</span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="expirationStart" className="mb-1 block text-xs text-slate-500">
                      Start
                    </label>
                    <input
                      id="expirationStart"
                      type="date"
                      value={expirationStart}
                      onChange={(e) => setExpirationStart(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="expirationEnd" className="mb-1 block text-xs text-slate-500">
                      End
                    </label>
                    <input
                      id="expirationEnd"
                      type="date"
                      value={expirationEnd}
                      min={expirationStart || undefined}
                      onChange={(e) => setExpirationEnd(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Optional — leave both blank if this pricing never expires.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Inventory</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="stockQuantity" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Stock Quantity
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  min={0}
                  disabled={stockUnlimited}
                  value={stockUnlimited ? "" : stockQuantity}
                  placeholder={stockUnlimited ? "Unlimited" : undefined}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label htmlFor="stockStatus" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Stock Status
                </label>
                <select
                  id="stockStatus"
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={stockUnlimited}
                  aria-label="Unlimited stock"
                  onClick={() => setStockUnlimited((v) => !v)}
                  className={clsx(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    stockUnlimited ? "bg-emerald-600" : "bg-slate-300",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      stockUnlimited ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
                <span className="text-sm text-slate-600">Unlimited</span>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                Highlight this product in a featured section.
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Upload Product Image</h2>

            <input
              ref={mainFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                void handleMainImageSelect(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <div
              className="mt-3 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleMainImageSelect(e.dataTransfer.files?.[0]);
              }}
            >
              {isUploadingMain ? (
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Product preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Drag & drop or browse</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isUploadingMain}
              onClick={() => mainFileInputRef.current?.click()}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {isUploadingMain ? "Uploading…" : imageUrl ? "Replace" : "Browse"}
            </button>

            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                void handleGalleryImageSelect(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Product gallery" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button
                  type="button"
                  disabled={isUploadingGallery}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-60"
                >
                  {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="text-[11px] font-medium">Add Image</span>
                </button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Categories</h2>
            <div className="mt-3">
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">
                Product Categories
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select your category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label htmlFor="tags" className="mb-1.5 block text-sm font-medium text-slate-700">
                Product Tag
              </label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. new, sale, featured"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-slate-400">Comma-separated tags.</p>
            </div>

            <div className="mt-3">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Select your color</span>
              <div className="flex gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    type="button"
                    key={swatch}
                    aria-label={`Choose color ${swatch}`}
                    onClick={() => setColor(swatch)}
                    className={`h-7 w-7 rounded-full border-2 ${
                      color === swatch ? "border-emerald-600" : "border-transparent"
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
