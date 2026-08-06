// Mock data for the Categories discovery view (tiles + recent product
// listing). The category CRUD itself lives in the real `api.categories()`
// endpoint (see /products/new) — this file only backs the tile/browse UI.

export interface CategoryTile {
  name: string;
  emoji: string;
}

export const CATEGORY_TILES: CategoryTile[] = [
  { name: "Electronics", emoji: "🖥️" },
  { name: "Fashion", emoji: "👕" },
  { name: "Accessories", emoji: "🎧" },
  { name: "Home & Kitchen", emoji: "🍽️" },
  { name: "Sports & Outdoors", emoji: "🏀" },
  { name: "Toys & Games", emoji: "🎮" },
  { name: "Health & Fitness", emoji: "💪" },
  { name: "Books", emoji: "📚" },
];

export interface CategoryProductRow {
  no: number;
  name: string;
  emoji: string;
  createdDate: string;
  orders: number;
}

const PRODUCT_ROWS: CategoryProductRow[] = [
  { no: 1, name: "Wireless Bluetooth Headphones", emoji: "🎧", createdDate: "01-01-2025", orders: 25 },
  { no: 2, name: "Men's T-Shirt", emoji: "👕", createdDate: "01-01-2025", orders: 20 },
  { no: 3, name: "Men's Leather Wallet", emoji: "👛", createdDate: "01-01-2025", orders: 35 },
  { no: 4, name: "Memory Foam Pillow", emoji: "🛏️", createdDate: "01-01-2025", orders: 40 },
  { no: 5, name: "Coffee Maker", emoji: "☕", createdDate: "01-01-2025", orders: 45 },
  { no: 6, name: "Casual Baseball Cap", emoji: "🧢", createdDate: "01-01-2025", orders: 55 },
  { no: 7, name: "Full HD Webcam", emoji: "📷", createdDate: "01-01-2025", orders: 20 },
  { no: 8, name: "Smart LED Color Bulb", emoji: "💡", createdDate: "01-01-2025", orders: 16 },
  { no: 9, name: "Men's T-Shirt", emoji: "👕", createdDate: "01-01-2025", orders: 10 },
  { no: 10, name: "Men's Leather Wallet", emoji: "👛", createdDate: "01-01-2025", orders: 35 },
];

export async function listCategoryProducts(): Promise<CategoryProductRow[]> {
  return PRODUCT_ROWS;
}
