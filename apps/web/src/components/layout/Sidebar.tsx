"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  PlusSquare,
  ListChecks,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Scoped to the three in-scope screens per the assessment brief (Dashboard /
// Add Products / Product List) — everything else in the wider Figma admin
// kit (Order Management, Customers, Coupon Code, Brand, Categories,
// Transactions, Product Media/Reviews, Admin role, Control Authority) is
// intentionally out of scope and not linked here.
const MAIN_NAV = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];

const PRODUCT_NAV = [
  { href: "/products/new", label: "Add Products", icon: PlusSquare },
  { href: "/products", label: "Product List", icon: ListChecks },
];

function NavSection({
  title,
  items,
  pathname,
  collapsed,
}: {
  title: string;
  items: typeof MAIN_NAV;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {title}
        </p>
      )}
      <div className={clsx("space-y-1", collapsed ? "px-2 pt-4 first:pt-0" : "px-3")}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/products" ? pathname === "/products" : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} size={18} />
              {!collapsed && label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const SWIPE_THRESHOLD = 40;

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -SWIPE_THRESHOLD) setCollapsed(true);
    else if (deltaX > SWIPE_THRESHOLD) setCollapsed(false);
    touchStartX.current = null;
  }

  return (
    <aside
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        "flex h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
        collapsed ? "w-20" : "w-60",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white"
          >
            D
          </button>
        ) : (
          <>
            <Image
              src="/logo-background-remover.png"
              alt="Dealport"
              width={200}
              height={64}
              priority
              className="h-11 w-auto object-contain"
            />
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <PanelLeftClose className="h-4.5 w-4.5" size={18} />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pb-1">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <PanelLeftOpen className="h-4.5 w-4.5" size={18} />
          </button>
        </div>
      )}

      <nav className="flex-1 pb-2">
        <NavSection title="Main menu" items={MAIN_NAV} pathname={pathname} collapsed={collapsed} />
        <NavSection title="Product" items={PRODUCT_NAV} pathname={pathname} collapsed={collapsed} />
      </nav>

      <div className={clsx("border-t border-slate-100 py-4 dark:border-slate-800", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={logout}
          title={collapsed ? (user?.name ?? "Dealport") : undefined}
          className={clsx(
            "flex w-full items-center gap-3 rounded-lg py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800",
            collapsed ? "justify-center px-0" : "px-2",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            {user?.name?.charAt(0) ?? "D"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name ?? "Dealport"}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email ?? "Mark@thedesigner..."}</p>
              </div>
              <SquarePen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </>
          )}
        </button>

        <button
          title={collapsed ? "Your Shop" : undefined}
          className={clsx(
            "mt-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <Store className="h-4 w-4 shrink-0" size={16} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Your Shop</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
