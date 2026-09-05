# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Requires Node.js >= 22 (see `.nvmrc`). Copy `.env.example` to `.env.local` before running.

```bash
npm ci
npm run dev              # next dev (default http://localhost:3000)
npm run build            # next build (honors NEXT_DIST_DIR if set; .next-device-management for isolated build)
npm run start            # next start
npm run lint             # eslint . --max-warnings=0
npm run typecheck        # tsc --noEmit (strict mode)
npm test                 # vitest run (jsdom, excludes tests/e2e)
npm run test:watch       # vitest watch mode
npm test -- <path>       # single file: npm test -- src/features/realtime-device-map/hooks/use-device-polling.test.tsx
npm run test:contract    # vitest run tests/contract
npm run test:e2e         # build + next start -p 3107 + playwright (see scripts/run-e2e.mjs)
npm run format           # prettier --write "src/**/*.{ts,tsx,js,jsx,json,css}"
npm run format:check     # prettier --check
# SDLC/architecture guard (PowerShell):
powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1
pwsh -File scripts/validate-sdlc.ps1  # PowerShell 7 / macOS/Linux
```

Playwright directly: `npx playwright test` (baseURL `http://127.0.0.1:3107`, `PLAYWRIGHT_EXTERNAL_SERVER=1` to reuse a running server).

## Environment Variables

Defined in `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` — backend base URL (default `http://localhost:8080`)
- `NEXT_PUBLIC_USE_MOCK_API` — `true` uses local mock; when unset, `development` defaults to mock
- `NEXT_PUBLIC_DEVICE_MANAGEMENT_USE_MOCK` — device-management MSW toggle
- `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` — Leaflet tile provider
- `NEXT_PUBLIC_DEVICE_MAP_POLL_MS` — polling interval, clamped 3000–5000 ms
- `NEXT_DIST_DIR` — overrides Next.js `distDir` (used for parallel builds)
- `PROVIDER_CONTRACT_BASE_URL` — real backend URL for provider-contract gate (tests/contract)

## Architecture

**Stack**: Next.js 15 (App Router, `reactStrictMode: true`), React 19, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`, etc.), Tailwind CSS 4 + shadcn/ui (style `new-york`, `baseColor: slate`, `src/app/globals.css`), Axios (single shared instance), Zustand (domain-separated stores), Leaflet + react-leaflet, Vitest + Testing Library + MSW, Playwright.

**Path alias**: `@/*` maps to `src/*` (see `tsconfig.json` and `vitest.config.ts`).

**Routes** (`src/app`):
- `/` — `src/app/page.tsx`
- `/map` — `src/app/map/page.tsx` composes `src/features/realtime-device-map/components/map-client-loader.tsx` (dynamic `ssr:false` for Leaflet; never import `leaflet`/`react-leaflet` outside a `"use client"` boundary)
- `/devices`, `/devices/[deviceId]`, `/devices/approvals` — device management pages under `src/app/devices/`
- `src/app/api/v1/map/device-states/route.ts` — local mock API (120 devices, bus GPS moves per poll tick; used when `NEXT_PUBLIC_USE_MOCK_API=true`)

**Feature modules** (`src/features/<feature>/` per Constitution principle I). Each feature owns its `components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`:

- `realtime-device-map` — viewport-bounded polling via `useDevicePolling` (AbortController cancellation, stale-response guard, 2000+ device target), `device-state-store` (server state) vs `map-ui-store` (UI state), services through `src/helpers/api/client.ts`, bbox/motion utils, Leaflet marker layer.
- `device-management` — catalog/device/feature/preset APIs (`services/device-*-api.ts` + `api-mappers.ts`), stores `device-catalog-store`, `device-feature-store`, `device-preset-store`, `device-management-access-store`, `device-management-ui-store` (UI-only), form/list/feature-management/preset-calibration components, `mock-browser.ts` / `tests/mocks/device-management/` MSW handlers.

**Shared API boundary** (`src/helpers/api/client.ts`): single `axios.create` instance; all feature code must use it. No `fetch`, no extra Axios instances, no TanStack Query. `normalizeApiError` handles `AxiosError`, `field_errors`, and `Retry-After`. Validated by `scripts/validate-sdlc.ps1`.

**State**: Zustand only, split by domain/lifecycle. Polling/server state and UI interaction state must live in separate stores (enforced by the validator — e.g., `device-state-store` must not contain `selectedDeviceId`/`viewportBounds`, `map-ui-store` must not contain `devicesById`/`AbortController`).

**Styling**: Tailwind utility classes + shadcn/ui only. No CSS Modules, no inline `style`, no CSS-in-JS. Third-party overrides (Leaflet) are consolidated in `src/app/globals.css` with a library-named comment.

**UI primitives**: `src/components/ui/` (shadcn), `src/lib/utils.ts` (`cn` helper via `clsx` + `tailwind-merge`).

**Testing**:
- Unit/integration: `vitest.config.ts` (jsdom, `src/test/setup.ts` starts device-management MSW server + `matchMedia` stub; `src/test/device-*-test-utils.tsx` helpers).
- Contract: `tests/contract/device-*-provider.contract.spec.ts` — require real backend via `PROVIDER_CONTRACT_BASE_URL` to close the gate (ETag/304, 422 VIEWPORT_TOO_DENSE, 30s offline transition, idempotency/audit).
- E2E: `playwright.config.ts` (`tests/e2e/`, Chromium only, 2 workers), `tests/mocks/device-*/` MSW handlers, fixtures in `tests/fixtures/` with deterministic seed generators.
- Performance: `tests/performance/` (fixed 4 vCPU/8GB, headless Chromium, Fast 3G/4G, fixed seeds — 5000/10000 devices).

**Quality gates & workflow**: Spec Kit sequence `specify -> clarify -> plan -> tasks -> implement -> analyze -> PR` is mandatory. `specs/001-realtime-device-map/` and `specs/002-device-management/` hold `spec.md`/`plan.md`/`tasks.md`/`contracts/*.openapi.yaml`. Constitution is at `.specify/memory/constitution.md` (v1.1.0) and SDLC at `docs/SDLC.md`. `scripts/validate-sdlc.ps1` checks for banned deps (`@tanstack/react-query`, MUI/Antd/etc.), strict TS, direct `fetch`, stray Axios instances, mixed stores, and missing spec artifacts. CI (` .github/workflows/ci.yml`) runs `SDLC / validate`, lint, typecheck, tests, and build. Branch naming: `feat/###-name`, `fix/###-name`, etc. (see `docs/SDLC.md`); use Conventional Commits; PRs are squash-merged.
