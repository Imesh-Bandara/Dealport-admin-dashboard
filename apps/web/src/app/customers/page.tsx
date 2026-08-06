"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { MessageSquare, Trash2, Copy, Globe, AtSign, Link2, Send, MapPin, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MiniStat } from "@/components/ui/MiniStat";
import { Pagination } from "@/components/ui/Pagination";
import { ReportChart } from "@/components/dashboard/ReportChart";
import { listCustomers, CUSTOMER_STATS, type Customer, type CustomerStatus } from "@/lib/mock/customers";
import { formatCurrency } from "@/lib/format";

const STATUS_STYLES: Record<CustomerStatus, string> = {
  Active: "text-emerald-600 dark:text-emerald-400",
  Inactive: "text-red-500 dark:text-red-400",
  VIP: "text-amber-500 dark:text-amber-400",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    listCustomers().then((data) => {
      setCustomers(data);
      setSelectedId(data[0]?.id ?? null);
    });
  }, []);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <AppShell title="Customers">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-5">
          <MiniStat title="Total Customers" value={CUSTOMER_STATS.totalCustomers.value} changeLabel={CUSTOMER_STATS.totalCustomers.change} />
          <MiniStat title="New Customers" value={CUSTOMER_STATS.newCustomers.value} changeLabel={CUSTOMER_STATS.newCustomers.change} />
          <MiniStat title="Visitor" value={CUSTOMER_STATS.visitor.value} changeLabel={CUSTOMER_STATS.visitor.change} />
        </div>
        <ReportChart />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Customer Details</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-slate-400 dark:text-slate-500">
                  <th className="py-2 pr-3 font-medium">Customer Id</th>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Phone</th>
                  <th className="py-2 pr-3 font-medium">Order Count</th>
                  <th className="py-2 pr-3 font-medium">Total Spend</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr
                    key={`${c.id}-${i}`}
                    onClick={() => setSelectedId(c.id)}
                    className={clsx(
                      "cursor-pointer border-t border-slate-100 transition-colors dark:border-slate-800",
                      selectedId === c.id ? "bg-emerald-50 dark:bg-emerald-950/50" : "hover:bg-slate-50 dark:hover:bg-slate-800",
                    )}
                  >
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{c.id}</td>
                    <td className="py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">{c.name}</td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{c.phone}</td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{c.orderCount}</td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(c.totalSpend)}</td>
                    <td className={clsx("py-2.5 pr-3 font-medium", STATUS_STYLES[c.status])}>&bull; {c.status}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1">
                        <button aria-label="Message" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-emerald-400">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button aria-label="Delete" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={24} onChange={setPage} />
        </div>

        {selected && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                {selected.avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{selected.name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <span className="truncate">{selected.email}</span>
                  <Copy className="h-3 w-3 shrink-0" />
                </div>
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Customer Info</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" /> {selected.phone}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-slate-400" /> {selected.location}
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Social Media</p>
            <div className="mt-2 flex gap-2">
              {[Globe, MessageSquare, AtSign, Link2, Send].map((Icon, i) => (
                <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Activity</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <p>Registration: {selected.registrationDate}</p>
              <p>Last purchase: {selected.lastPurchase}</p>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Order overview</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selected.totalOrders}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Total order</p>
              </div>
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selected.completedOrders}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Completed</p>
              </div>
              <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selected.canceledOrders}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Canceled</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
