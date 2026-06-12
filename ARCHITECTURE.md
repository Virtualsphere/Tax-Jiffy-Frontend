# Architecture Guide

This project uses a **feature-sliced + layered** architecture optimized for SaaS scale.

## Directory map

```
src/
├── app/                    # Application shell (bootstrap only)
│   ├── providers/          # Global React context providers
│   └── router/             # Route definitions & RouterProvider
├── assets/                 # Static images, fonts, icons
├── components/             # Shared, cross-feature UI (PeriodSelector, Sidebar)
├── config/                 # App-wide config (env, routes)
├── context/                # Global React contexts (PeriodContext)
├── features/               # Business domains (primary code organization)
│   └── [feature]/
│       ├── api/            # Feature HTTP endpoints
│       ├── components/     # Feature-only UI
│       ├── hooks/          # Feature data/state hooks
│       ├── lib/            # Feature business logic & validators
│       ├── pages/          # Feature-owned route pages (when coupled)
│       ├── types/          # Feature TypeScript types
│       └── index.ts        # Public API barrel (import boundary)
├── hooks/                  # Shared cross-feature hooks
├── layouts/                # Route shell layouts (landing, dashboard, signup)
├── lib/                    # Infrastructure (api client, query client)
├── pages/                  # Thin route pages that compose features
│   └── dashboard/
│       └── [module]/
│           ├── data/       # Mock data / data helpers
│           ├── hooks/      # Module-specific hooks
│           ├── tabs/       # Tab sub-components (e.g. GSTR1 tabs)
│           └── types/      # Module-specific types
├── services/               # Cross-cutting app services (error handling)
├── styles/                 # Global CSS, tokens, reset
└── types/                  # Shared global TypeScript types
```

## Where does code go?

| You are building… | Put it in… |
|-------------------|------------|
| Reusable button, input, modal | `src/components/` |
| Login form, invoice table | `src/features/[name]/components/` |
| `useLogin`, `useInvoices` | `src/features/[name]/hooks/` |
| `GET /invoices` API call | `src/features/[name]/api/` |
| Validation, calculations, mappers | `src/features/[name]/lib/` |
| Login screen (owned by auth) | `src/features/auth/pages/` |
| Landing page composition | `src/pages/landing/` |
| Axios instance, React Query client | `src/lib/` |
| API error normalizer | `src/services/` |
| Utility helpers | `src/utils/` |
| Route paths, env vars | `src/config/` |
| `ApiResponse`, shared API types | `src/types/` or feature `types/` |

## Feature module rules

1. **Colocate by domain** — everything for "billing" lives under `features/billing/`.
2. **Public API** — other features import only from `features/billing/index.ts`.
3. **No cross-feature deep imports** — e.g. never `import x from '@/features/auth/lib/...'` from another feature.
4. **Pages stay thin** — pages wire hooks + components; business logic stays in `lib/` or hooks.

## Naming conventions

| Kind | Convention | Example |
|------|------------|---------|
| Components | PascalCase folder + file | `LoginForm/LoginForm.tsx` |
| Hooks | camelCase, `use` prefix | `useLogin.ts` |
| API modules | camelCase + `.api` suffix | `auth.api.ts` |
| Types | PascalCase + `.types` suffix | `auth.types.ts` |
| CSS modules | `ComponentName.module.css` | `LoginForm.module.css` |
| Barrels | `index.ts` per folder | `features/auth/index.ts` |

## Adding a new feature

```bash
src/features/invoices/
├── api/invoices.api.ts
├── components/InvoiceTable/
├── hooks/useInvoices.ts
├── lib/invoice-filters.ts
├── types/invoice.types.ts
└── index.ts
```

Then register routes in `src/app/router/routes.tsx`.

## Import aliases

Use `@/` for all internal imports:

```ts
import { Button } from '@/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
```
