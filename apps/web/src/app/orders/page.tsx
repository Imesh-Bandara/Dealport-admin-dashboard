"use client";

import { useEffect, useState } from "react";
import { Plus, MoreVertical, Filter, ArrowUpDown, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MiniStat } from "@/components/ui/MiniStat";
import { Pagination } from "@/components/ui/Pagination";
import { listOrders, ORDER_STATS, type Order, type OrderStatus } from "@/lib/mock/orders";
import { formatCurrency } from "@/lib/format";
import clsx from "clsx";

const TABS = ["All order", "Completed", "Pending", "Canceled"] as const;

const STATUS_STYLES: Record<OrderStatus, string> = {
  Delivered: "text-emerald-600",
  Pending: "text-amber-500",
  Shipped: "text-sky-500",
  Cancelled: "text-red-500",
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All order");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    listOrders().then(setOrders);
  }, []);

  const filtered = orders.filter((o) => {
    const matchesTab =
      tab === "All order" ||
      (tab === "Completed" && o.status === "Delivered") ||
      (tab === "Pending" && o.status === "Pending") ||
      (tab === "Canceled" && o.status === "Cancelled");
    const matchesSearch = o.product.toLowerCase().includes(search.toLowerCase()) || o.orderId.includes(search);
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell title="Order Management">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-900">Order List</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Order
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            More Action <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat title="Total Orders" value={ORDER_STATS.totalOrders.value} changeLabel={ORDER_STATS.totalOrders.change} changeDirection={ORDER_STATS.totalOrders.direction} />
        <MiniStat title="New Orders" value={ORDER_STATS.newOrders.value} changeLabel={ORDER_STATS.newOrders.change} changeDirection={ORDER_STATS.newOrders.direction} />
        <MiniStat title="Completed Orders" value={ORDER_STATS.completedOrders.value} changeLabel={ORDER_STATS.completedOrders.change} changeDirection={ORDER_STATS.completedOrders.direction} valueClassName="text-emerald-600" />
        <MiniStat title="Canceled Orders" value={ORDER_STATS.canceledOrders.value} changeLabel={ORDER_STATS.canceledOrders.change} changeDirection={ORDER_STATS.canceledOrders.direction} valueClassName="text-red-500" />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm font-medium">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={clsx(
                  "rounded-md px-3 py-1.5 transition-colors",
                  tab === t ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {t === "All order" ? `All order (${orders.length})` : t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order report"
                className="w-56 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50">
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="w-8 py-2 pr-3"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="py-2 pr-3 font-medium">No.</th>
                <th className="py-2 pr-3 font-medium">Order Id</th>
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 pr-3 font-medium">Payment</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                    No orders found.
                  </td>
                </tr>
              )}
              {filtered.map((order, i) => (
                <tr key={`${order.orderId}-${i}`} className="border-t border-slate-100">
                  <td className="py-3 pr-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="py-3 pr-3 text-slate-500">{order.no}</td>
                  <td className="py-3 pr-3 font-medium text-slate-700">{order.orderId}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">
                        {order.productImage}
                      </span>
                      <span className="font-medium text-slate-700">{order.product}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{order.date}</td>
                  <td className="py-3 pr-3 font-semibold text-slate-800">{formatCurrency(order.price)}</td>
                  <td className="py-3 pr-3">
                    <span className={clsx("font-medium", order.payment === "Paid" ? "text-emerald-600" : "text-red-500")}>
                      &bull; {order.payment}
                    </span>
                  </td>
                  <td className={clsx("py-3 pr-3 font-medium", STATUS_STYLES[order.status])}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={24} onChange={setPage} />
      </div>
    </AppShell>
  );
}
