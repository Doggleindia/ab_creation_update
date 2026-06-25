# KT Adhesives

Monorepo for the KT Adhesives platform — a custom apparel/printing e-commerce
storefront, its admin panel, and the shared backend API.

## Structure

```
apps/
├── backend/   Express 5 + MongoDB (Mongoose) REST API
├── web/       Next.js 16 customer storefront
└── admin/     React (CRA) admin dashboard
```

Each app is self-contained with its own `package.json`, build, and deploy
config (Dockerfiles included). They are developed together here but deploy
independently.

## Getting started

Each app reads its config from a local `.env` — copy the example first:

```bash
# Backend API
cd apps/backend
cp .env.example .env      # fill in Mongo, JWT, Razorpay, AWS, etc.
npm install
npm run dev

# Storefront
cd apps/web
cp .env.example .env      # set NEXT_PUBLIC_MAIN_BACKEND
npm install
npm run dev

# Admin panel
cd apps/admin
cp .env.example .env      # set REACT_APP_MAIN_BACKEND
npm install
npm start
```

See each app's required environment variables in its `.env.example`.

### Running from the repo root

Convenience scripts in the root `package.json` delegate to each app (no
workspace hoisting — every app keeps its own `node_modules`):

```bash
npm run install:all     # install deps in all three apps
npm run dev:backend     # start the API (nodemon)
npm run dev:web         # start the storefront (Next.js)
npm run dev:admin       # start the admin panel (CRA)
npm run build:all       # production build of web + admin
```

## Notes

- This monorepo was consolidated from three separate repositories
  (`kt-adhesives-backend`, `kt-adhesives`, `admin-kt-adhesives`); their original
  histories remain on the `Doggleindia` GitHub org as a backup.
