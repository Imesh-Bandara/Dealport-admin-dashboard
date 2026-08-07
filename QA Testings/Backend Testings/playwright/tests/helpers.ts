import type { APIRequestContext } from "@playwright/test";

// Defaults match the seeded production admin (see apps/api/prisma/seed.ts
// and the SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD set on Render). Override
// via env vars if the target environment uses different seed credentials.
export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@dealport.dev";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

export async function login(request: APIRequestContext): Promise<string> {
  const res = await request.post("auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`Login failed during test setup: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.accessToken as string;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
