"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Search, Filter, ArrowUpDown, MoreVertical, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MiniStat } from "@/components/ui/MiniStat";
import { Pagination } from "@/components/ui/Pagination";
import { listTransactions, TRANSACTION_STATS, type Transaction, type TxStatus } from "@/lib/mock/transactions";
import { formatCurrency } from "@/lib/format";

const TABS = ["All order", "Completed", "Pending", "Canceled"] as const;

const STATUS_STYLES: Record<TxStatus, string> = {
  Complete: "text-emerald-600",
  Pending: "text-amber-500",
  Canceled: "text-red-500",
};

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All order");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cardActive, setCardActive] = useState(true);

  useEffect(() => {
    listTransactions().then(setTransactions);
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesTab =
      tab === "All order" ||
      (tab === "Completed" && t.status === "Complete") ||
      (tab === "Pending" && t.status === "Pending") ||
      (tab === "Canceled" && t.status === "Canceled");
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.customerId.includes(search);
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell title="Transaction">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
          <MiniStat title="Total Revenue" value={TRANSACTION_STATS.totalRevenue.value} changeLabel={TRANSACTION_STATS.totalRevenue.change} />
          <MiniStat title="Completed Transactions" value={TRANSACTION_STATS.completedTransactions.value} changeLabel={TRANSACTION_STATS.completedTransactions.change} />
          <MiniStat title="Pending Transactions" value={TRANSACTION_STATS.pendingTransactions.value} period={TRANSACTION_STATS.pendingTransactions.note} valueClassName="text-amber-500" />
          <MiniStat title="Failed Transactions" value={TRANSACTION_STATS.failedTransactions.value} period={TRANSACTION_STATS.failedTransactions.note} valueClassName="text-red-500" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Payment Method</h2>
            <button aria-label="More options" className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-linear-to-br from-emerald-700 to-emerald-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Finaci</span>
              <button
                onClick={() => setCardActive((v) => !v)}
                className={clsx(
                  "relative h-5 w-9 rounded-full transition-colors",
                  cardActive ? "bg-white/90" : "bg-white/30",
                )}
              >
                <span
                  className={clsx(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-emerald-700 transition-transform",
                    cardActive ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
            <p className="mt-4 text-sm tracking-widest">•••• •••• •••• 2345</p>
            <div className="mt-3 flex items-end justify-between text-xs">
              <div>
                <p className="text-white/70">Card Holder name</p>
                <p className="font-medium">Noman Manzoor</p>
              </div>
              <div>
                <p className="text-white/70">Expiry Date</p>
                <p className="font-medium">02/30</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Status: <span className="font-medium text-emerald-600">{cardActive ? "Active" : "Inactive"}</span></span>
            <span>Transactions: 1,250</span>
          </div>
          <p className="text-xs text-slate-500">Revenue: $50,000</p>

          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Plus className="h-3.5 w-3.5" /> Add Card
            </button>
            <button className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              Deactivate
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm font-medium">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "rounded-md px-3 py-1.5 transition-colors",
                  tab === t ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {t === "All order" ? `All order (${transactions.length})` : t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment history"
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
                <th className="py-2 pr-3 font-medium">Customer Id</th>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Total</th>
                <th className="py-2 pr-3 font-medium">Method</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={`${tx.customerId}-${i}`} className="border-t border-slate-100">
                  <td className="py-3 pr-3 text-slate-500">{tx.customerId}</td>
                  <td className="py-3 pr-3 font-medium text-slate-700">{tx.name}</td>
                  <td className="py-3 pr-3 text-slate-500">{tx.date}</td>
                  <td className="py-3 pr-3 font-semibold text-slate-800">{formatCurrency(tx.total)}</td>
                  <td className="py-3 pr-3 text-slate-500">{tx.method}</td>
                  <td className={clsx("py-3 pr-3 font-medium", STATUS_STYLES[tx.status])}>&bull; {tx.status}</td>
                  <td className="py-3 pr-3">
                    <button className="text-sm font-medium text-emerald-600 hover:underline">View Details</button>
                  </td>
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
