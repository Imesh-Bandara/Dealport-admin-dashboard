"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions (delete, remove) — red icon/button.
   *  "default" for neutral confirmations — emerald, matching the rest of the app. */
  variant?: "danger" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Replaces native window.confirm() with a themed modal — used anywhere the
 * app needs a "are you sure?" step before an irreversible or important
 * action (currently: deleting a product from the Product List).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const danger = variant === "danger";

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[dialog-fade-in_150ms_ease-out]"
        onClick={() => !isLoading && onCancel()}
      />
      <div className="relative w-full max-w-sm animate-[dialog-pop-in_180ms_ease-out] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-full",
            danger
              ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
          )}
        >
          {danger ? <AlertTriangle className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
        </div>

        <h2 id="confirm-dialog-title" className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70",
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
