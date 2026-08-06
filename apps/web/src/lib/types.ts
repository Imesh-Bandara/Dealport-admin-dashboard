export type ProductStatus = "DRAFT" | "PUBLISHED";
export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  discountPrice: string | null;
  expirationStart: string | null;
  expirationEnd: string | null;
  taxIncluded: boolean;
  stockQuantity: number;
  stockUnlimited: boolean;
  stockStatus: StockStatus;
  status: ProductStatus;
  featured: boolean;
  imageUrl: string | null;
  images: string[];
  color: string | null;
  totalOrders: number;
  categoryId: string | null;
  category: Category | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface GenerateDescriptionInput {
  name: string;
  category?: string;
  price?: number;
}

export interface GenerateDescriptionResponse {
  description: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  expirationStart?: string;
  expirationEnd?: string;
  taxIncluded?: boolean;
  stockQuantity?: number;
  stockUnlimited?: boolean;
  stockStatus?: StockStatus;
  status?: ProductStatus;
  featured?: boolean;
  imageUrl?: string;
  images?: string[];
  color?: string;
  categoryId?: string;
  tags?: string[];
}
