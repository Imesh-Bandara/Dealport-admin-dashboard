// Mock data — Order Management is not backed by an API endpoint yet.
// Swap `listOrders()` for a real `api.orders.list()` call once the
// NestJS API grows an orders resource; the shape below is the intended
// response contract so callers don't need to change.

export type OrderStatus = "Delivered" | "Pending" | "Shipped" | "Cancelled";
export type PaymentStatus = "Paid" | "Unpaid";

export interface Order {
  no: number;
  orderId: string;
  product: string;
  productImage: string;
  date: string;
  price: number;
  payment: PaymentStatus;
  status: OrderStatus;
}

const ORDERS: Order[] = [
  { no: 1, orderId: "#ORD0001", product: "Wireless Bluetooth Headphones", productImage: "🎧", date: "01-01-2025", price: 49.99, payment: "Paid", status: "Delivered" },
  { no: 2, orderId: "#ORD0002", product: "Men's T-Shirt", productImage: "👕", date: "01-01-2025", price: 14.99, payment: "Unpaid", status: "Pending" },
  { no: 3, orderId: "#ORD0003", product: "Men's Leather Wallet", productImage: "👛", date: "01-01-2025", price: 49.99, payment: "Paid", status: "Delivered" },
  { no: 4, orderId: "#ORD0004", product: "Memory Foam Pillow", productImage: "🛏️", date: "01-01-2025", price: 39.99, payment: "Paid", status: "Shipped" },
  { no: 5, orderId: "#ORD0005", product: "Adjustable Dumbbells", productImage: "🏋️", date: "01-01-2025", price: 14.99, payment: "Unpaid", status: "Pending" },
  { no: 6, orderId: "#ORD0006", product: "Coffee Maker", productImage: "☕", date: "01-01-2025", price: 79.99, payment: "Unpaid", status: "Cancelled" },
  { no: 7, orderId: "#ORD0007", product: "Casual Baseball Cap", productImage: "🧢", date: "01-01-2025", price: 49.99, payment: "Paid", status: "Delivered" },
  { no: 8, orderId: "#ORD0008", product: "Full HD Webcam", productImage: "📷", date: "01-01-2025", price: 39.99, payment: "Paid", status: "Delivered" },
  { no: 9, orderId: "#ORD0009", product: "Smart LED Color Bulb", productImage: "💡", date: "01-01-2025", price: 79.99, payment: "Unpaid", status: "Delivered" },
  { no: 10, orderId: "#ORD0010", product: "Men's T-Shirt", productImage: "👕", date: "01-01-2025", price: 14.99, payment: "Unpaid", status: "Delivered" },
];

export const ORDER_STATS = {
  totalOrders: { value: "1,240", change: "+14.4%", direction: "up" as const },
  newOrders: { value: "240", change: "+20%", direction: "up" as const },
  completedOrders: { value: "960", change: "85%", direction: "up" as const },
  canceledOrders: { value: "87", change: "-5%", direction: "down" as const },
};

export async function listOrders(): Promise<Order[]> {
  return ORDERS;
}
