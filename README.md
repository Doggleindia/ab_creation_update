# AB Creation

Monorepo for the AB Creation platform — a custom apparel/printing e-commerce
storefront, its admin panel, and the shared backend API.

## Structure

```
apps/
├── backend/   Express 5 + MongoDB (Mongoose) REST API
├── web/       Next.js 16 customer storefront
└── admin/     React + Vite admin dashboard
packages/
└── types/     @ab-creation/types — shared TypeScript domain types
```

This is an **npm workspaces** monorepo: a single `npm install` at the root
installs every app and links the shared `@ab-creation/types` package. Each app still has
its own build and deploy config (Dockerfiles included) and deploys independently.

## Getting started

Install everything once from the repo root (npm workspaces):

```bash
npm install
```

Then copy each app's env file and fill it in:

```bash
cp apps/backend/.env.example apps/backend/.env   # Mongo, JWT, Razorpay, AWS, etc.
cp apps/web/.env.example     apps/web/.env       # NEXT_PUBLIC_MAIN_BACKEND
cp apps/admin/.env.example   apps/admin/.env     # VITE_MAIN_BACKEND
```

### Running from the repo root

You can start all three applications simultaneously (concurrently) with one command:

```bash
npm run dev             # Start backend, web storefront, and admin panel at once
```

Alternatively, on Windows, you can double-click or run the batch script:

```bash
run-all.bat
```

Or run individual apps separately:

```bash
npm run dev:backend     # start the API (nodemon)
npm run dev:web         # start the storefront (Next.js)
npm run dev:admin       # start the admin panel (Vite)
npm run build:all       # production build of web + admin
```

## Notes

- This monorepo was consolidated from three separate repositories
  (`kt-adhesives-backend`, `kt-adhesives`, `admin-kt-adhesives`); their original
  histories remain on the `Doggleindia` GitHub org as a backup.
