# Implementation Traceability: Realtime Device Map

**Reviewed**: 2026-09-04  
**Status**: Provisionally implemented; release is blocked by the real-provider contract gate and the prescribed hardware/network performance run.

## Automated validation

- [x] `npm run lint` exits 0.
- [x] `npm run typecheck` exits 0 with strict TypeScript settings.
- [x] `npm test` passes 28 tests; the three real-provider cases are explicitly skipped without `PROVIDER_CONTRACT_BASE_URL`.
- [x] `npm run test:e2e` passes all 5 Chromium scenarios against the deterministic API fixture.
- [x] `npm run build` produces the `/` and `/map` production routes.
- [x] `powershell -ExecutionPolicy Bypass -File scripts/validate-sdlc.ps1` exits 0.

## Requirement evidence

| Requirement | Evidence | Result |
|---|---|---|
| FR-001, FR-006, FR-007 | `device-map-api.ts`, `use-device-polling.ts`, `device-map.spec.ts` | Pass with mock; real provider pending |
| FR-002, FR-003, FR-005 | `device-state-store.ts`, `device-marker-layer.motion.test.tsx` | Pass |
| FR-004 | `motion.ts`, `use-marker-motion.ts`, associated tests | Pass |
| FR-008 | API representation tests and 30-second MSW transition | Pass with mock; real provider pending |
| FR-009, FR-010 | marker layer/detail panel and component/E2E tests | Pass |
| FR-011 | filters plus case-insensitive partial code/name component and E2E tests | Pass |
| SC-005 | exact linear duration and exclusive 120 km/h / 8 second snap tests | Pass |
| SC-007 | 20 measured Playwright samples after one warm-up; automated p95 assertion <= 10 seconds | Pass locally |
| Architecture | `scripts/validate-sdlc.ps1` | Pass |

## Open release gates

- [ ] Run `tests/contract/device-map-provider.contract.spec.ts` against the real backend and prove shape, ETag/304, dense viewport 422, and the time-driven online-to-offline ETag change.
- [ ] Run the performance profile on a controlled 4 vCPU/8 GB runner with Chromium headless, Fast 3G/4G throttling, one warm-up, and three measured runs; retain the median report.
- [ ] Attach the real-provider and controlled-performance evidence before declaring the US1 checkpoint or feature release-ready.
