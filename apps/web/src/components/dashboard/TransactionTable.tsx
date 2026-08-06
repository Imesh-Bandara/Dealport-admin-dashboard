import clsx from "clsx";

// Static seed data: the dashboard transaction feed is out of scope for the
// Products API per the assessment brief, so this is documented static data.
const TRANSACTIONS = [
  { id: "#6545", customer: "#6545", date: "01 Oct | 11:29 am", status: "Paid", amount: "$64" },
  { id: "#5412", customer: "#5412", date: "01 Oct | 11:29 am", status: "Pending", amount: "$557" },
  { id: "#6622", customer: "#6622", date: "01 Oct | 11:29 am", status: "Paid", amount: "$156" },
  { id: "#6462", customer: "#6462", date: "01 Oct | 11:29 am", status: "Paid", amount: "$265" },
  { id: "#6462", customer: "#6462", date: "01 Oct | 11:29 am", status: "Paid", amount: "$265" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  Paid: "text-emerald-600 dark:text-emerald-400",
  Pending: "text-amber-500 dark:text-amber-400",
};

export function TransactionTable() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Transaction</h2>
        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Filter
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-400 dark:text-slate-500">
              <th className="py-2 pr-3 font-medium">No</th>
              <th className="py-2 pr-3 font-medium">Id Customer</th>
              <th className="py-2 pr-3 font-medium">Order Date</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => (
              <tr key={`${tx.id}-${i}`} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{i + 1}.</td>
                <td className="py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">{tx.customer}</td>
                <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{tx.date}</td>
                <td className={clsx("py-2.5 pr-3 font-medium", STATUS_STYLES[tx.status] ?? "text-slate-500 dark:text-slate-400")}>
                  &bull; {tx.status}
                </td>
                <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-100">{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
        Details
      </button>
    </div>
  );
}
