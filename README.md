# Tax Jiffy Frontend

Production-ready **Vite + React + TypeScript** SaaS frontend with a scalable feature-sliced architecture.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript only |

## Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full folder map, naming conventions, and rules for where code belongs.

### Stack

- **Vite 6** — fast dev & builds
- **React 19** + **TypeScript** (strict)
- **React Router 7** — routing & layouts
- **TanStack Query** — server state
- **Axios** — HTTP client with interceptors
- **Zod** — env & form validation

### Highlights

- `@/` path alias everywhere
- Feature modules with public `index.ts` barrels
- Thin pages, fat features
- Centralized routes and API client
- CSS modules + design tokens (Tailwind-ready)

## Project structure (summary)

```
src/
├── app/          → providers, router
├── components/   → shared UI primitives
├── config/       → env, routes
├── features/     → domain modules (auth, …)
├── layouts/      → LandingLayout, AuthLayout, SignupLayout
├── lib/          → api client, query client
├── pages/        → route-level page compositions
├── services/     → cross-cutting services
├── styles/       → global CSS
├── types/        → shared types
└── utils/        → pure helpers
```

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_APP_NAME` | Display name |
| `VITE_API_BASE_URL` | Backend API base URL |
