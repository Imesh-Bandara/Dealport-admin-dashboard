// Mock data — swap `listTransactions()` for `api.transactions.list()` once
// the NestJS API grows a payments/transactions resource.

export type TxStatus = "Complete" | "Pending" | "Canceled";
export type TxMethod = "CC" | "PayPal" | "Bank";

export interface Transaction {
  customerId: string;
  name: string;
  date: string;
  total: number;
  method: TxMethod;
  status: TxStatus;
}

const TRANSACTIONS: Transaction[] = [
  { customerId: "#CUST001", name: "John Doe", date: "01-01-2025", total: 2904, method: "CC", status: "Complete" },
  { customerId: "#CUST001", name: "John Doe", date: "01-01-2025", total: 2904, method: "PayPal", status: "Complete" },
  { customerId: "#CUST001", name: "John Doe", date: "01-01-2025", total: 2904, method: "CC", status: "Complete" },
  { customerId: "#CUST001", name: "John Doe", date: "01-01-2025", total: 2904, method: "Bank", status: "Complete" },
  { customerId: "#CUST002", name: "Jane Smith", date: "01-01-2025", total: 2904, method: "CC", status: "Canceled" },
  { customerId: "#CUST003", name: "Emily Davis", date: "01-01-2025", total: 2904, method: "PayPal", status: "Pending" },
  { customerId: "#CUST002", name: "Jane Smith", date: "01-01-2025", total: 2904, method: "Bank", status: "Canceled" },
  { customerId: "#CUST001", name: "John Doe", date: "01-01-2025", total: 2904, method: "CC", status: "Complete" },
  { customerId: "#CUST003", name: "Emily Davis", date: "01-01-2025", total: 2904, method: "PayPal", status: "Pending" },
  { customerId: "#CUST002", name: "Jane Smith", date: "01-01-2025", total: 2904, method: "Bank", status: "Canceled" },
];

export const TRANSACTION_STATS = {
  totalRevenue: { value: "$15,045", change: "+14.4%" },
  completedTransactions: { value: "3,150", change: "+20%" },
  pendingTransactions: { value: "150", note: "85%" },
  failedTransactions: { value: "75", note: "15%" },
};

export async function listTransactions(): Promise<Transaction[]> {
  return TRANSACTIONS;
}
