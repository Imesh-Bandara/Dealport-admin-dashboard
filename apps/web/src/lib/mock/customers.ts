// Mock data — swap `listCustomers()` for `api.customers.list()` once the
// NestJS API grows a customers resource.

export type CustomerStatus = "Active" | "Inactive" | "VIP";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpend: number;
  status: CustomerStatus;
  avatarInitial: string;
  location: string;
  registrationDate: string;
  lastPurchase: string;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
}

const CUSTOMERS: Customer[] = [
  { id: "#CUST001", name: "John Doe", email: "john.doe@example.com", phone: "+1234567890", orderCount: 25, totalSpend: 3450, status: "Active", avatarInitial: "J", location: "123 Main St, NY", registrationDate: "15.01.2025", lastPurchase: "10.01.2025", totalOrders: 150, completedOrders: 140, canceledOrders: 10 },
  { id: "#CUST002", name: "Jane Smith", email: "jane.smith@example.com", phone: "+1234567891", orderCount: 5, totalSpend: 250, status: "Inactive", avatarInitial: "J", location: "88 Birch Ave, LA", registrationDate: "02.02.2025", lastPurchase: "05.02.2025", totalOrders: 12, completedOrders: 9, canceledOrders: 3 },
  { id: "#CUST003", name: "Emily Davis", email: "emily.davis@example.com", phone: "+1234567892", orderCount: 30, totalSpend: 4600, status: "VIP", avatarInitial: "E", location: "9 Ocean Dr, Miami", registrationDate: "20.11.2024", lastPurchase: "28.02.2025", totalOrders: 210, completedOrders: 200, canceledOrders: 10 },
  { id: "#CUST004", name: "Michael Chen", email: "michael.chen@example.com", phone: "+1234567893", orderCount: 18, totalSpend: 2100, status: "Active", avatarInitial: "M", location: "45 Elm St, Chicago", registrationDate: "05.03.2025", lastPurchase: "18.03.2025", totalOrders: 60, completedOrders: 55, canceledOrders: 5 },
  { id: "#CUST005", name: "Sarah Johnson", email: "sarah.j@example.com", phone: "+1234567894", orderCount: 3, totalSpend: 180, status: "Inactive", avatarInitial: "S", location: "17 Pine Rd, Austin", registrationDate: "22.01.2025", lastPurchase: "01.02.2025", totalOrders: 8, completedOrders: 6, canceledOrders: 2 },
  { id: "#CUST006", name: "David Wilson", email: "david.w@example.com", phone: "+1234567895", orderCount: 42, totalSpend: 6200, status: "VIP", avatarInitial: "D", location: "3 Lakeview Ct, Seattle", registrationDate: "11.09.2024", lastPurchase: "30.03.2025", totalOrders: 300, completedOrders: 285, canceledOrders: 15 },
  { id: "#CUST007", name: "Laura Martinez", email: "laura.m@example.com", phone: "+1234567896", orderCount: 9, totalSpend: 890, status: "Active", avatarInitial: "L", location: "60 Cedar Blvd, Denver", registrationDate: "14.02.2025", lastPurchase: "12.03.2025", totalOrders: 22, completedOrders: 20, canceledOrders: 2 },
  { id: "#CUST008", name: "Robert Lee", email: "robert.lee@example.com", phone: "+1234567897", orderCount: 2, totalSpend: 95, status: "Inactive", avatarInitial: "R", location: "5 Hilltop Way, Boston", registrationDate: "30.03.2025", lastPurchase: "31.03.2025", totalOrders: 3, completedOrders: 2, canceledOrders: 1 },
];

export const CUSTOMER_STATS = {
  totalCustomers: { value: "11,040", change: "+14.4%" },
  newCustomers: { value: "2,370", change: "+20%" },
  visitor: { value: "250k", change: "+20%" },
};

export async function listCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}
