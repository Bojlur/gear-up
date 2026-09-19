# GearUp 🏋️

**Rent Sports & Outdoor Gear Instantly**

A backend API for a sports and outdoor equipment rental service. Customers browse gear and place rental orders, providers manage their inventory and fulfill orders, and admins oversee the platform.

## Live Deployment

- **Live API URL:** https://gear-up-theta.vercel.app
- **API Documentation (Postman):** [`docs/GearUp.postman_collection.json`](./docs/GearUp.postman_collection.json)
- **Demo Video:** _TODO: add link_

Deployed on Vercel as a single bundled serverless function (see [Deploying to Vercel](#deploying-to-vercel) below).

## Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@gearup.com` |
| Password | `Admin@1234` |

(Seeded via `npm run seed` from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` — change these before your final submission and re-seed.)

## Tech Stack

- **Runtime:** Node.js + TypeScript, Express 5
- **Database:** PostgreSQL via Prisma ORM 7 (`@prisma/adapter-pg`)
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Validation:** Zod, applied on every mutating endpoint
- **Payments:** Stripe (Checkout Sessions, one-time payments) with webhook verification
- **API docs:** Postman collection

## Features

**Public**
- Browse all available gear with filters (category, price, brand, availability)
- View gear details and categories

**Customer**
- Register / login (JWT), manage profile
- Place rental orders (multi-item, date-range based), track status, cancel before confirmation
- Pay via Stripe Checkout, view payment history
- Leave reviews after a rental is returned

**Provider**
- Manage gear inventory (add / update / remove, stock tracking)
- View incoming rental orders and update their status (confirm → picked up → returned)

**Admin**
- Manage users (suspend / activate)
- Manage gear categories
- Platform-wide visibility into all gear and rental orders

## Architecture

Modular structure, one folder per domain under `src/modules/`, each with `*.controller.ts`, `*.service.ts`, `*.route.ts`, `*.validation.ts`, and `*.interface.ts`:

```
src/
├── app.ts                  # Express app, middleware, route mounting
├── server.ts                # Entry point
├── config/                  # Env var loading
├── errors/AppError.ts       # Typed operational error
├── lib/                     # Prisma client, Stripe client
├── middlewares/              # auth, validateRequest, error handlers
├── utils/                   # catchAsync, jwt, sendResponse, pick
└── modules/
    ├── auth/                 # register, login, refresh, logout, me
    ├── user/                 # profile update
    ├── category/              # public + admin category CRUD
    ├── gear/                  # public browsing + provider CRUD
    ├── rental/                 # order placement, customer + provider flows
    ├── payment/                # Stripe checkout, confirm, webhook
    ├── review/                 # gear reviews
    └── admin/                  # user/gear/rental oversight
```

## Rental Order Status Flow

```
PLACED ──(provider confirms)──► CONFIRMED ──(Stripe payment)──► PAID
  │                                                                │
  └──(customer cancels)──► CANCELLED               (provider marks picked up)
                                                                    │
                                                                    ▼
                                                               PICKED_UP
                                                                    │
                                                     (provider marks returned)
                                                                    ▼
                                                               RETURNED ──► (customer can review)
```

Cancellation is only allowed while an order is still `PLACED`. Stock (`availableStock`) is reserved on order creation and restored on cancellation or return.

## Error Response Format

Every error returns a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorDetails": { "...": "optional extra context (e.g. validation issues)" }
}
```

Success responses:

```json
{
  "success": true,
  "message": "...",
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 }
}
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default `5000`) |
| `APP_URL` | Base URL of this API, used for CORS + Stripe redirect URLs |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin account |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode: `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Seed the admin account

```bash
npm run seed
```

### 5. Start the dev server

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

### 6. (Payments) Forward Stripe webhooks locally

In a separate terminal, keep this running while testing payments:

```bash
npm run stripe:webhook
```

## Testing the API

Import [`docs/GearUp.postman_collection.json`](./docs/GearUp.postman_collection.json) into Postman. It includes every endpoint, organized by module, with variables that auto-populate as you go (login saves your access token, creating a category/gear item/order saves its id for the next request).

**To test a full payment:** create a rental order → have the provider confirm it → `POST /api/payments/create` → open the returned `paymentUrl` in a browser → pay with Stripe's test card `4242 4242 4242 4242` (any future expiry/CVC) → the webhook (or `POST /api/payments/confirm` as a fallback) marks the order `PAID`.

## Build & Deploy (local server)

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs the compiled server
```

## Deploying to Vercel

This is a plain Express app, deployed to Vercel as a single bundled serverless function rather than via Next.js-style zero-config detection (which mis-handles this project's non-extension relative imports and creates a conflicting implicit route for `/`).

**How it's wired:**
- `src/app.ts` exports the configured Express `app` (no `.listen()` call — that only happens in `src/server.ts`, used for local dev).
- `npm run build:api` (`prisma generate` + `esbuild`) bundles `src/app.ts` and everything it imports — including the generated Prisma client — into a single self-contained `api/index.js`. Only real `node_modules` packages (express, stripe, pg, …) stay external; they're resolved normally at runtime.
- `vercel.json` uses the **legacy `builds`/`routes` config** (not zero-config `rewrites`) to deploy exactly that one file with `@vercel/node` and route every path to it — this is what avoids Vercel's automatic framework detection entirely.
- `api/` is gitignored — it's a build artifact, regenerated fresh before every deploy.

**To redeploy after making changes:**

```bash
npm run build:api        # regenerate the bundled function locally
vercel deploy --prod     # upload + deploy
```

**Environment variables** are set directly on the Vercel project (`vercel env add <NAME> production`) — they are **not** read from your local `.env` file during deployment. If you change a secret locally, update it on Vercel too, then redeploy.

**Stripe webhook for the deployed environment:** the local `stripe listen` secret only works for local forwarding. The deployed instance has its own webhook endpoint registered in Stripe (Dashboard → Developers → Webhooks) pointing at `https://gear-up-theta.vercel.app/api/payments/webhook`, with its own `STRIPE_WEBHOOK_SECRET` set on Vercel.
