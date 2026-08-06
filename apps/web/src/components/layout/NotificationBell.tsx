"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Pencil, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { Notification, NotificationType } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";

const POLL_INTERVAL_MS = 30_000;

const TYPE_ICON: Record<NotificationType, typeof Plus> = {
  PRODUCT_CREATED: Plus,
  PRODUCT_UPDATED: Pencil,
  PRODUCT_DELETED: Trash2,
};

const TYPE_STYLE: Record<NotificationType, string> = {
  PRODUCT_CREATED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  PRODUCT_UPDATED: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
  PRODUCT_DELETED: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

/** Bell icon + dropdown feed of product create/update/delete events,
 *  backed by the persisted /notifications API. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(() => {
    api.notifications
      .unreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!open) return;
    api.notifications
      .list(20)
      .then((list) => {
        setNotifications(list);
        setError(null);
      })
      .catch(() => setError("Failed to load notifications"));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
      setUnreadCount(0);
    } catch {
      setError("Failed to mark notifications as read");
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (notification.read) return;
    setNotifications((prev) =>
      prev?.map((n) => (n.id === notification.id ? { ...n, read: true } : n)) ?? prev,
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.notifications.markRead(notification.id);
    } catch {
      // Non-critical — the read state will resync next time the list loads.
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
            {notifications && notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {error && <p className="px-4 py-4 text-sm text-red-500 dark:text-red-400">{error}</p>}
            {!notifications && !error && (
              <div className="space-y-3 px-4 py-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
                ))}
              </div>
            )}
            {notifications?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No notifications yet.
              </p>
            )}
            {notifications?.map((notification) => {
              const Icon = TYPE_ICON[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={clsx(
                    "flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/50",
                    !notification.read && "bg-emerald-50/40 dark:bg-emerald-950/20",
                  )}
                >
                  <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_STYLE[notification.type])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-700 dark:text-slate-200">{notification.message}</span>
                    <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                  {!notification.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-label="Unread" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
