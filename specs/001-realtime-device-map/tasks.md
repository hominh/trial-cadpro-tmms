---
description: "Dependency-ordered implementation tasks for the realtime device map"
---

# Tasks: Bản đồ thiết bị realtime

**Input**: Design documents from `/specs/001-realtime-device-map/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/device-map.openapi.yaml`, `quickstart.md`

**Tests**: Included because the specification defines explicit acceptance scenarios and measurable
performance/correctness outcomes. Within each story, test tasks are written and observed failing
before implementation tasks begin.

**Organization**: Tasks are grouped by user story so each increment can be demonstrated and tested
at its checkpoint.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: May run in parallel after its listed prerequisites because it targets different files.
- **[US1]**, **[US2]**, **[US3]**: Maps the task to a user story from `spec.md`.
- Every task names the exact file or directory it changes.

## Phase 1: Setup (Project Initialization)

**Purpose**: Create the greenfield Next.js application and quality toolchain required by every
story. Tasks in this phase run in order unless marked `[P]`.

- [ ] T001 Initialize the Next.js App Router application with Node.js 22 and strict TypeScript in `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, and `src/app/page.tsx`
- [ ] T002 Add Axios, Zustand, Leaflet, react-leaflet, and required type packages plus `lint`, `typecheck`, `test`, `test:e2e`, and `build` scripts in `package.json` and `package-lock.json`
- [ ] T003 Configure Vitest, React Testing Library, jsdom, and Playwright in `vitest.config.ts`, `playwright.config.ts`, and `src/test/setup.ts`
- [ ] T004 [P] Configure shadcn/ui and global Leaflet-compatible styling in `components.json`, `postcss.config.mjs`, and `src/app/globals.css`
- [ ] T005 [P] Document the public API base URL and map tile configuration without secrets in `.env.example`
- [ ] T006 Create the planned feature directory boundaries and public export surface in `src/features/realtime-device-map/index.ts`, `src/features/realtime-device-map/components/`, `src/features/realtime-device-map/hooks/`, `src/features/realtime-device-map/services/`, `src/features/realtime-device-map/stores/`, `src/features/realtime-device-map/types/`, and `src/features/realtime-device-map/utils/`

**Checkpoint**: The application installs, starts, typechecks, and exposes an empty feature boundary.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared types, geometry rules, HTTP boundary, fixtures, and shadcn primitives
needed by all user stories.

**⚠️ CRITICAL**: No user story implementation begins until this phase is complete.

- [ ] T007 Define strict `DeviceId`, `GeoPoint`, `ViewportBounds`, `DeviceMapFilters`, `DeviceState`, `DeviceMapSnapshot`, and problem response types from the OpenAPI contract in `src/features/realtime-device-map/types/device-map.types.ts`
- [ ] T008 [P] Write failing tests for bbox validation, CRS84 serialization, normalized query keys, filter normalization, and dateline rejection in `src/features/realtime-device-map/utils/bbox.test.ts`
- [ ] T009 Implement bbox validation, CRS84 serialization, normalized query keys, and filter normalization to satisfy T008 in `src/features/realtime-device-map/utils/bbox.ts`
- [ ] T010 [P] Create the sole shared Axios instance with base URL, credentials policy, timeout, normalized errors, and AbortSignal support in `src/helpers/api/client.ts`
- [ ] T011 [P] Create deterministic fixed/mobile/void/offline/unknown-type snapshot factories, including 2.000- and 5.001-device generators, in `tests/fixtures/device-map/device-map.fixtures.ts`
- [ ] T012 [P] Create Zustand reset helpers, fake clock controls, and map-safe component render utilities in `src/test/device-map-test-utils.tsx`
- [ ] T013 Add the required shadcn/ui Button, Input, Select, Badge, Tooltip, Sheet, Drawer, Popover, Skeleton, and Alert primitives under `src/components/ui/`

**Checkpoint**: Contracts are typed, network calls have one boundary, geometry rules pass, and test
fixtures can exercise all planned states.

---

## Phase 3: User Story 1 — Quan sát trạng thái toàn mạng lưới (Priority: P1) 🎯 MVP

**Goal**: Show a viewport-bounded, refreshable map of fixed and mobile device positions with type and
online/offline status, while retaining a stale snapshot on recoverable failure.

**Independent Test**: Open `/map` against a fixture containing camera, bus, sensor, and controller
devices; verify correct canonical positions/icons/status, fixed markers remain stable, pan/zoom sends
only the new bbox, and network failure preserves the last valid snapshot.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementing the story.

- [ ] T014 [P] [US1] Write Axios service contract tests for bbox/filter encoding, ETag, 200/304, 400, 422, 429, and malformed snapshots in `src/features/realtime-device-map/services/device-map-api.test.ts`
- [ ] T015 [P] [US1] Write store tests for one-clone snapshot apply, `stateVersion` ordering, stable unchanged references, membership reconciliation, 304 freshness, stale retention, and too-dense state in `src/features/realtime-device-map/stores/device-state-store.test.ts`
- [ ] T016 [P] [US1] Write fake-timer and Strict Mode tests for immediate polling, one interval, abort-before-replace, generation/query guards, viewport changes, 429 delay, cancellation handling, and unmount cleanup in `src/features/realtime-device-map/hooks/use-device-polling.test.tsx`
- [ ] T017 [P] [US1] Write component tests for initial skeleton, `moveend` bbox publication, fixed marker stability, type/status icons, unknown fallback, loading/stale/error/too-dense overlays, and non-color status text in `src/features/realtime-device-map/components/device-map.test.tsx`
- [ ] T018 [P] [US1] Write the failing P1 browser acceptance scenario for initial viewport, fixed-device jitter, offline threshold, pan/zoom, and request scoping in `tests/e2e/device-map-us1.spec.ts`

### Implementation for User Story 1

- [ ] T019 [US1] Implement the typed viewport snapshot request, ETag cache per normalized query, status/problem mapping, and AbortSignal forwarding through the shared client in `src/features/realtime-device-map/services/device-map-api.ts`
- [ ] T020 [US1] Implement immutable `Map<DeviceId, DeviceState>` snapshot upsert/reconcile, version guards, visible IDs, freshness, stale/error, 304, and too-dense actions in `src/features/realtime-device-map/stores/device-state-store.ts`
- [ ] T021 [US1] Implement immediate four-second single-flight polling with `setInterval`, AbortController replacement, generation/query guards, Retry-After handling, and idempotent cleanup in `src/features/realtime-device-map/hooks/use-device-polling.ts`
- [ ] T022 [P] [US1] Implement the trusted cached `L.divIcon` registry for `lpr_camera`, `bus_gps`, `env_multi`, `signal_ctrl`, unknown type, connectivity, alert, and selection variants in `src/features/realtime-device-map/utils/device-icon.ts`
- [ ] T023 [P] [US1] Implement the client-only dynamic Leaflet loader with a fixed-size skeleton and `ssr: false` in `src/features/realtime-device-map/components/map-client-loader.tsx`
- [ ] T024 [US1] Implement `MapContainer`, Leaflet CSS boundary, initial bounds, normalized `moveend` viewport publication, and polling composition in `src/features/realtime-device-map/components/device-map.tsx`
- [ ] T025 [US1] Implement imperative marker registry reconciliation for complete snapshots, fixed canonical positions, stable keys/refs, cached icons, and marker removal in `src/features/realtime-device-map/components/device-marker-layer.tsx`
- [ ] T026 [P] [US1] Implement loading, empty, stale with last-success, error, unlocated count, and `VIEWPORT_TOO_DENSE` guidance states in `src/features/realtime-device-map/components/map-status-overlay.tsx`
- [ ] T027 [US1] Compose the server route shell and client loader, export the feature entry point, and make the P1 acceptance test pass in `src/app/map/page.tsx` and `src/features/realtime-device-map/index.ts`

**Checkpoint**: User Story 1 is deployable as the MVP and independently passes its component,
contract, store, polling, and browser acceptance tests.

---

## Phase 4: User Story 2 — Theo dõi thiết bị di động mượt và chính xác (Priority: P2)

**Goal**: Animate visible moving vehicles smoothly between valid confirmed fixes without jitter,
void-fix movement, stale overwrites, or per-frame store updates.

**Independent Test**: Feed one moving bus a sequence of valid fixes with a void fix and an out-of-order
response between them; verify smooth retargeting, heading, static/zero-speed behavior, reduced motion,
and that the final marker remains at the newest valid confirmed position.

### Tests for User Story 2

> Write these tests first and confirm they fail before implementing the story.

- [ ] T028 [P] [US2] Write motion math tests for coordinate interpolation, duration caps, plausibility limits, zero speed, and shortest-angle heading rotation in `src/features/realtime-device-map/utils/motion.test.ts`
- [ ] T029 [P] [US2] Write fake-rAF tests for a single scheduler, retargeting from displayed position, valid-fix versioning, background resume, reduced motion, disposal, and no Zustand frame commits in `src/features/realtime-device-map/hooks/use-marker-motion.test.tsx`
- [ ] T030 [P] [US2] Write marker integration tests for mobile movement, fixed/static hold, GPS `V`, invalid coordinates, zero speed, heading rotation, and marker deduplication in `src/features/realtime-device-map/components/device-marker-layer.motion.test.tsx`

### Implementation for User Story 2

- [ ] T031 [US2] Implement interpolation, duration, distance/plausibility, coordinate validation, and shortest-angle helpers to satisfy T028 in `src/features/realtime-device-map/utils/motion.ts`
- [ ] T032 [US2] Implement one shared `requestAnimationFrame` motion registry with retarget, clamped completion, background/reduced-motion handling, and cleanup in `src/features/realtime-device-map/hooks/use-marker-motion.ts`
- [ ] T033 [US2] Add defensive GPS `V`, invalid-position, `positionVersion`, and `isStatic` merge guards without discarding valid non-position metadata in `src/features/realtime-device-map/stores/device-state-store.ts`
- [ ] T034 [US2] Connect visible mobile marker refs to the shared motion controller, rotate only the trusted icon inner element, and preserve Leaflet outer transforms in `src/features/realtime-device-map/components/device-marker-layer.tsx`
- [ ] T035 [US2] Add shallow marker DOM, heading/status classes, animation containment, and `prefers-reduced-motion` behavior in `src/app/globals.css`

**Checkpoint**: User Stories 1 and 2 pass independently; no invalid or obsolete fix can move a marker.

---

## Phase 5: User Story 3 — Tìm và kiểm tra chi tiết thiết bị (Priority: P3)

**Goal**: Let operators filter/search devices, select overlapping or individual markers, and inspect
the required device details with keyboard, pointer, and touch input.

**Independent Test**: Filter a mixed viewport by type/status, search by device code, select a result
and inspect every required field; then remove it from the next complete snapshot and verify selection
clears with accessible focus/status behavior.

### Tests for User Story 3

> Write these tests first and confirm they fail before implementing the story.

- [ ] T036 [P] [US3] Write UI store tests for normalized viewport, type/status/query filters, selected device, panel state, and selection cleanup after reconciliation in `src/features/realtime-device-map/stores/map-ui-store.test.ts`
- [ ] T037 [P] [US3] Write accessible component tests for filter controls, zero results, detail fields, fixed/mobile variants, overlapping-device chooser, keyboard focus, and touch-sized controls in `src/features/realtime-device-map/components/device-map-controls.test.tsx`
- [ ] T038 [P] [US3] Write the failing P3 browser acceptance flow for filter, search, marker selection, detail inspection, snapshot removal, keyboard navigation, and touch viewport in `tests/e2e/device-map-us3.spec.ts`

### Implementation for User Story 3

- [ ] T039 [US3] Implement the independent viewport/filter/selection/panel Zustand domain with narrow selectors and reset actions in `src/features/realtime-device-map/stores/map-ui-store.ts`
- [ ] T040 [P] [US3] Implement debounced code/name search plus type and online/offline shadcn controls with explicit empty-filter semantics in `src/features/realtime-device-map/components/device-map-filters.tsx`
- [ ] T041 [P] [US3] Implement responsive shadcn Sheet/Drawer details for name, code, type, last seen, alert, active preset, preset source, speed, heading, and offline text in `src/features/realtime-device-map/components/device-detail-panel.tsx`
- [ ] T042 [US3] Implement trusted grouped selection for collocated markers using a shadcn Popover/list and route selection to a single device ID in `src/features/realtime-device-map/components/device-marker-layer.tsx`
- [ ] T043 [US3] Integrate filters, selection, detail panel, focus restoration, query changes, and missing-selected-device cleanup in `src/features/realtime-device-map/components/device-map.tsx`

**Checkpoint**: All three user stories are functional, independently testable, and satisfy their
acceptance scenarios.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove scale, accessibility, architecture compliance, and release readiness across all
stories.

- [ ] T044 [P] Generate deterministic 2.000-device, 5.000-device, mixed-motion, and 5.001-device density fixtures with documented seeds in `tests/fixtures/device-map/generate-device-map-fixtures.ts`
- [ ] T045 Run and automate initial display, interaction latency, frame-rate, Map-clone/store-commit, DOM-depth, and memory assertions for 2.000–5.000 devices in `tests/performance/device-map.performance.test.ts`
- [ ] T046 [P] Add the combined quickstart browser flow for cancellation races, ETag/304, stale recovery, 30-second offline transition, filters, detail, and density guard in `tests/e2e/device-map.spec.ts`
- [ ] T047 [P] Add automated keyboard, focus, accessible-name, non-color status, reduced-motion, and tablet touch checks in `tests/e2e/device-map-accessibility.spec.ts`
- [ ] T048 Extend architecture validation to reject server-graph Leaflet imports, direct `fetch`, feature-local Axios instances, TanStack Query, extra UI libraries, and mixed Zustand domains in `scripts/validate-sdlc.ps1`
- [ ] T049 [P] Document map environment variables, tile attribution, local mock setup, validation commands, known density behavior, and troubleshooting in `README.md` and `docs/SDLC.md`
- [ ] T050 Run every scenario in `specs/001-realtime-device-map/quickstart.md` and record implementation-specific evidence links in `specs/001-realtime-device-map/quickstart.md`
- [ ] T051 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`, and `scripts/validate-sdlc.ps1`, then record final requirement traceability in `specs/001-realtime-device-map/checklists/implementation.md`

**Checkpoint**: The feature meets all success criteria and is ready for review.

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 Setup
    |
    v
Phase 2 Foundation
    |
    v
US1 / P1 MVP
    |
    +-----------> US2 / P2 Motion
    |
    +-----------> US3 / P3 Search & Detail
                       |
US2 ------------------+
    |
    v
Phase 6 Polish and release validation
```

- Phase 1 is sequential at T001–T003; T004 and T005 may run after T001 while T006 follows T001.
- Phase 2 depends on Setup. T008, T010, T011, and T012 may run after T007/T003 as applicable; T009
  follows T008; T013 follows shadcn setup.
- US1 depends on all foundational tasks and is the independently deployable MVP.
- US2 depends on the US1 marker registry and server snapshot store, but not on US3.
- US3 depends on the US1 map/snapshot baseline, but not on US2 motion.
- US2 and US3 may run in parallel after US1; Phase 6 depends on both.

### Within-story ordering

- Tests for a story are created first and confirmed failing.
- Services/stores precede hooks; hooks and utilities precede component integration.
- A complete snapshot is the atomic server-state unit; never ship blind merge without reconciliation.
- Motion state remains outside Zustand and is integrated only after version/validity tests exist.
- Story checkpoint validation must pass before work is considered complete.

## Parallel Execution Examples

### User Story 1

```text
Parallel test batch after Foundation: T014, T015, T016, T017, T018
Parallel implementation after T019–T021 prerequisites: T022, T023, T026
Then integrate sequentially: T024 -> T025 -> T027
```

### User Story 2

```text
Parallel test batch: T028, T029, T030
After T031 and T032: T033 and T035 may proceed on separate files
Then integrate: T034
```

### User Story 3

```text
Parallel test batch: T036, T037, T038
After T039: T040 and T041 may proceed in parallel
Then integrate: T042 -> T043
```

## Implementation Strategy

### MVP first

1. Complete Setup and Foundation.
2. Complete US1 and stop at its checkpoint.
3. Demonstrate viewport-only loading, fixed marker stability, status handling, cancellation, stale
   retention, and 2.000-device correctness before adding motion or details.

### Incremental delivery

1. **MVP**: US1 provides a trustworthy operational map.
2. **Motion increment**: US2 adds smooth mobile tracking without changing snapshot authority.
3. **Operator workflow increment**: US3 adds search, filters, collocated selection, and detail.
4. **Release gate**: Phase 6 proves performance, accessibility, architecture, and end-to-end behavior.

## Notes

- `[P]` never authorizes parallel edits to the same file.
- `gps_status=V` may update allowed non-position metadata but never canonical position/version.
- `isStatic` pauses animation and is not a substitute for `mobility`.
- A `422 VIEWPORT_TOO_DENSE` response is rendered as guidance; partial snapshots are never accepted.
- If 2.000-marker tests fail after imperative layer/icon optimization, clustering/canvas/WebGL requires
  a spec and plan amendment before implementation.
