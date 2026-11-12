# GroceryBox Merchant

Production Next.js merchant portal for GroceryBox. This application replaces the existing Flutter merchant client while preserving API contracts, validation, and business rules defined by the Go backend.

## Overview

- **Backend:** Go REST API (existing)
- **Database:** PostgreSQL
- **Auth:** Implemented on the backend; client behavior will match the Flutter app
- **Infrastructure:** AWS EC2, S3, CloudFront

This repository currently contains the **application foundation** only (architecture, design tokens, API client shell, layouts, and shared UI). Feature screens are added incrementally from Flutter reference tasks.

## Technology stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router (installed version) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui, Lucide React |
| HTTP | Axios |
| Client state | Zustand |
| Server/async state | TanStack Query |
| Forms | React Hook Form + Zod |

## Installation

```bash
npm install
```

Copy environment template:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_BASE_URL` to your Go API base URL (no trailing slash).

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (Next.js config) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Folder structure

```
src/
  app/                    # App Router routes and route groups
    (auth)/               # Authentication shell
    (onboarding)/         # Onboarding shell
    (dashboard)/          # Dashboard shell
  components/
    ui/                   # shadcn/ui primitives
    shared/               # Loading, error, empty states
    layouts/              # Auth, onboarding, dashboard layouts
    providers/            # React Query, toasts
  features/
    auth/                 # Auth domain (types, services, hooks, schemas)
    onboarding/
    dashboard/
  lib/
    api/                  # Axios client, endpoints, API types
    utils.ts
  stores/                 # Zustand stores
  hooks/
  config/                 # env, theme, routes
  types/
  middleware.ts           # Auth guards (placeholder)
```

## Environment configuration

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes (for API calls) | Base URL for the Go REST API |

Never commit secrets or production URLs in source control. Use `.env.local` for local development.

## API integration architecture

1. **`src/lib/api/client.ts`** — Shared Axios instance with JSON and `multipart/form-data` support, centralized `ApiError` mapping, and an injectable `Authorization` header provider (`setAuthorizationHeaderProvider`).
2. **`src/lib/api/endpoints.ts`** — Endpoint path registry (empty until paths are verified from Flutter).
3. **`src/lib/api/types.ts`** — Response envelopes and error shapes.
4. **Feature `services/`** — Domain-specific API calls (to be added per feature).

Request/response contracts and route paths must be taken from the Flutter implementation; do not invent endpoints in this codebase.

## Authentication (foundation)

Prepared but not implemented:

- Route groups under `(auth)`
- `useAuthStore` (Zustand) for session placeholder state
- `src/middleware.ts` passthrough (guards added after Flutter auth analysis)
- `src/config/routes.ts` for public vs protected path lists

Token storage and login/register/OTP flows will mirror the Flutter app in a later task.

## Design system

Brand tokens live in `src/app/globals.css` (CSS variables) and `src/config/theme.ts` (programmatic access). Light theme only, primary palette centered on `#14532D` / `#16A34A` with accent `#D4FF3F`.

## License

Private — GroceryBox.
# grocerybox-merchant
