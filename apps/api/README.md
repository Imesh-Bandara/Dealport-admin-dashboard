# DEALPORT Products API

NestJS + Prisma + PostgreSQL backend for the DEALPORT admin dashboard take-home.
Provides JWT auth and CRUD for products/categories that the `apps/web`
Next.js frontend consumes.

See the [root README](../../README.md) for full setup instructions
(env vars, database creation, migrations, seeding). Quick reference:

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev      # http://localhost:4000/api
```

## Structure

- `src/auth` — login (`POST /auth/login`), JWT strategy/guard, `GET /auth/me`
- `src/products` — controller/service/DTOs for `GET|POST /products`, `GET|PATCH|DELETE /products/:id`, plus `GET /products/top`, `/best-selling`, `/stats`
- `src/categories` — `GET /categories`
- `src/uploads` — `POST /uploads/image`, multipart file upload for product images
- `src/prisma` — `PrismaService`, injected into every module's service layer (controllers never touch Prisma directly)
- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` — data model, committed migrations, and the seed script

## Tests

```bash
npm run test       # unit tests
npm run test:e2e   # e2e tests
```
