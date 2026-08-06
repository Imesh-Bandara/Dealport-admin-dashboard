import type {
  Category,
  GenerateDescriptionInput,
  GenerateDescriptionResponse,
  LoginResponse,
  PaginatedProducts,
  Product,
  ProductInput,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "dealport_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
    if (!window.location.pathname.startsWith("/login")) {
      // Hard navigation (not router.push) is intentional: this module runs outside
      // React and a full reload guarantees stale in-memory app state is discarded.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),

  categories: () => request<Category[]>("/categories"),

  products: {
    list: (params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      categoryId?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") query.set(key, String(value));
      });
      return request<PaginatedProducts>(`/products?${query.toString()}`);
    },
    get: (id: string) => request<Product>(`/products/${id}`),
    create: (data: ProductInput) =>
      request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ProductInput>) =>
      request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => request<{ id: string; deleted: boolean }>(`/products/${id}`, { method: "DELETE" }),
    top: (limit = 4) => request<Product[]>(`/products/top?limit=${limit}`),
    bestSelling: (limit = 4) => request<Product[]>(`/products/best-selling?limit=${limit}`),
    stats: () => request<{ totalProducts: number; published: number; outOfStock: number }>("/products/stats"),
    generateDescription: (data: GenerateDescriptionInput) =>
      request<GenerateDescriptionResponse>("/products/generate-description", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  uploads: {
    image: async (file: File): Promise<{ url: string }> => {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/uploads/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        let message = res.statusText;
        try {
          const body = await res.json();
          message = Array.isArray(body.message) ? body.message.join(", ") : body.message ?? message;
        } catch {
          // ignore non-JSON error bodies
        }
        throw new ApiError(message, res.status);
      }

      return res.json();
    },
  },
};
