---
description: "Dependency-ordered implementation tasks for device management and PTZ calibration"
---

# Tasks: Quản lý thiết bị và hiệu chỉnh camera

**Input**: Design documents from `/specs/002-device-management/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/device-management.openapi.yaml`, `quickstart.md`

**Tests**: Included because the specification defines independently testable acceptance scenarios, atomic audit/approval invariants, accessibility requirements and measurable scale outcomes. Within each story, write and observe tests failing before implementation.

**Organization**: Tasks are grouped by user story so each increment can be implemented and demonstrated independently after the shared foundation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: May run in parallel after prerequisites because it targets different files.
- **[US1]**, **[US2]**, **[US3]**: Maps the task to a user story from `spec.md`.
- Every task has an exact file path and an observable completion condition.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing Next.js application for the new feature without changing the completed realtime-map boundary.

- [X] T001 Add the shadcn/Radix dependencies needed for AlertDialog, Dialog, Tabs, Table, Textarea, Label and Switch while preserving the existing UI-only policy in `./package.json` and `./package-lock.json`
- [X] T002 Create the planned feature directories and public export boundary in `src/features/device-management/index.ts`, `src/features/device-management/components/`, `src/features/device-management/hooks/`, `src/features/device-management/services/`, `src/features/device-management/stores/`, `src/features/device-management/types/`, and `src/features/device-management/utils/`
- [X] T003 [P] Configure MSW browser startup and device-management test reset support in `public/mockServiceWorker.js`, `src/test/setup.ts`, and `src/test/device-management-test-utils.tsx`
- [X] T004 Add shadcn-compatible AlertDialog, Dialog, Tabs, Table, Textarea, Label and Switch primitives under `src/components/ui/`
- [X] T005 [P] Document device-management API/mock environment switches without secrets in `./.env.example`
- [X] T006 Add accessible navigation entry points and empty server route shells in `src/app/page.tsx`, `src/app/devices/page.tsx`, and `src/app/devices/[deviceId]/page.tsx`

**Checkpoint**: The existing application builds, the new route shells resolve, and the feature has an empty ownership boundary.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish strict contracts, bounded request behavior, catalogs, deterministic mocks and the real-provider gate shared by all stories.

**⚠️ CRITICAL**: T007–T014 and T016–T018 block user-story implementation. T015 is not a development blocker when the conformant MSW server is available, but it remains a blocking gate for provider-backed checkpoints and release.

- [X] T007 Define strict opaque IDs, recursive `JsonValue`, page/cursor, problem, actor, permission/session context, catalog, object, device, feature/approval opaque ETags, history, preset and GeoJSON types from the OpenAPI contract in `src/features/device-management/types/device-management.types.ts`
- [X] T008 [P] Write failing tests for bounded limits, normalized combined filters, case-insensitive search normalization, opaque cursor handling and stable query keys in `src/features/device-management/utils/device-query.test.ts`
- [X] T009 Implement bounded query normalization and stable query keys to satisfy T008 in `src/features/device-management/utils/device-query.ts`
- [X] T010 [P] Extend normalized shared API errors with field violations and stable 409/412 problem codes without creating another Axios instance in `src/helpers/api/client.ts` and `src/helpers/api/client.test.ts`
- [X] T011 [P] Write failing fake-timer tests for debounce, abort-before-replace, generation/query-key guards, disposal and idempotency-key reuse on safe retry in `src/features/device-management/hooks/use-abortable-request.test.tsx`
- [X] T012 Implement the reusable feature-local request coordinator satisfying T011 in `src/features/device-management/hooks/use-abortable-request.ts`
- [X] T013 [P] Create deterministic catalogs, session actors/permissions, 2.000/10.000-device pages, object/device, opaque ETags, conflict, duplicate, audit-failure, approval and polygon fixtures in `tests/fixtures/device-management/device-management.fixtures.ts`
- [X] T014 Implement OpenAPI-conformant Node/browser MSW handlers including session-context authorization variants, mutable in-memory scenario state and reset helpers in `tests/mocks/device-management/handlers.ts`, `tests/mocks/device-management/browser.ts`, and `tests/mocks/device-management/server.ts`
- [ ] T015 Validate `specs/002-device-management/contracts/device-management.openapi.yaml` against the real backend with provider tests for all 23 operations, session actor/permissions, bounded cursors, feature/approval item ETags and If-Match, idempotency on every POST/PUT/DELETE mutation, atomic feature/history writes, enforcement separation/self-approval, soft-delete retention, global code uniqueness, duplicate preset constraints and geometry/calibration in `tests/contract/device-management-provider.contract.spec.ts`; keep this task open until the suite passes against the real provider
- [X] T016 [P] Write failing catalog/session-context service and separate catalog/access-store tests for capability completeness, PTZ constraints, current actor, permission variants and malformed responses in `src/features/device-management/services/catalog-api.test.ts`, `src/features/device-management/stores/device-catalog-store.test.ts`, and `src/features/device-management/stores/device-management-access-store.test.ts`
- [X] T017 Implement catalog and session-context loading through the shared Axios client plus isolated immutable catalog/access state to satisfy T016 in `src/features/device-management/services/catalog-api.ts`, `src/features/device-management/stores/device-catalog-store.ts`, and `src/features/device-management/stores/device-management-access-store.ts`
- [X] T018 [P] Add test factories for separated Zustand store resets, session-context authorization identities/permissions, opaque ETags and retained form drafts in `src/test/device-management-test-utils.tsx`

**Checkpoint**: Shared DTOs, request lifecycle, catalogs and MSW contract are ready; only a real-backend pass closes T015 and release integration gates.

---

## Phase 3: User Story 1 — Quản lý danh mục vị trí và thiết bị (Priority: P1) 🎯 MVP

**Goal**: Deliver bounded device discovery plus create/edit/soft-delete flows for objects and devices, including JSON config, point selection and conflict-safe mutations.

**Independent Test**: From an empty tenant, create an object by map/coordinate entry, create a device attached to it, find/filter/edit it, exercise malformed JSON and stale ETag errors, then soft delete it while retaining related data.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementing the story.

- [X] T019 [P] [US1] Write Axios service tests for object/device list/detail/create/full-replacement PUT/delete, cursor/limit, combined filters, ETag/If-Match, idempotency on all mutations, duplicate and 412 mapping in `src/features/device-management/services/device-catalog-api.test.ts`
- [X] T020 [P] [US1] Write catalog-store tests for bounded pages, append/replace behavior, abort/generation races, selection reconciliation, mutation refresh and preserved conflict drafts in `src/features/device-management/stores/device-catalog-store.test.ts`
- [X] T021 [P] [US1] Write JSON validation tests for recursive values, syntax line/column, format preservation and object-only payloads for both `object.attrs` and `device.config` in `src/features/device-management/utils/json-config.test.ts`
- [ ] T022 [P] [US1] Write accessible component tests for combined filters, table pagination, object picker, `object.attrs`/`device.config` JSON errors, permission-hidden actions, point coordinate entry, create/edit conflicts and soft-delete confirmation in `src/features/device-management/components/device-catalog.test.tsx`
- [ ] T023 [P] [US1] Author and pass the MSW-backed P1 browser acceptance flow for 10.000-device bounded filtering, abort races, object/device creation, invalid attrs/config drafts, ETag conflict and soft delete; run one warm-up plus at least 20 independent valid create-object/device flows, require 100% completion and p95 <=3 minutes in `tests/e2e/device-management-us1.spec.ts`

### Implementation for User Story 1

- [X] T024 [US1] Implement typed object/device list, detail, create, full-replacement PUT and soft-delete services through the shared Axios instance with cursor, AbortSignal, ETag, If-Match and idempotency on every mutation in `src/features/device-management/services/device-catalog-api.ts`
- [X] T025 [US1] Implement immutable bounded catalog pages, request generations, selected summaries, mutation refresh, loading/error and conflict state in `src/features/device-management/stores/device-catalog-store.ts`
- [X] T026 [P] [US1] Implement filter, cursor-stack, selection and modal UI state separately from server data in `src/features/device-management/stores/device-management-ui-store.ts`
- [X] T027 [P] [US1] Implement recursive JSON parsing, pretty formatting and line/column diagnostics without `any` in `src/features/device-management/utils/json-config.ts`
- [X] T028 [US1] Implement the debounced combined-filter toolbar, bounded object search and abortable device list orchestration in `src/features/device-management/components/device-list/device-filters.tsx` and `src/features/device-management/hooks/use-device-list.ts`
- [X] T029 [P] [US1] Implement the accessible shadcn Table with object/type/status/last-seen columns, loading/empty/error states and cursor navigation in `src/features/device-management/components/device-list/device-table.tsx`
- [X] T030 [P] [US1] Implement a reusable raw JSON object editor for `object.attrs` and `device.config` that retains invalid drafts and announces line/column errors in `src/features/device-management/components/device-form/json-object-editor.tsx`
- [X] T031 [P] [US1] Implement a client-only Leaflet object point picker with synchronized keyboard coordinate inputs in `src/features/device-management/components/device-form/object-point-picker.tsx` and `src/features/device-management/components/device-form/object-point-picker-loader.tsx`
- [X] T032 [US1] Implement object create/edit validation including `attrs` through the reusable JSON object editor, point selection, ETag conflicts and active-device delete guidance in `src/features/device-management/components/device-form/object-form.tsx`
- [X] T033 [US1] Implement bounded object picker plus device create/edit validation, `config` through the reusable JSON object editor, capability-safe type changes and ETag conflict preservation in `src/features/device-management/components/device-form/device-form.tsx` and `src/features/device-management/components/device-form/object-picker.tsx`
- [X] T034 [US1] Implement explicit shadcn conflict/soft-delete dialogs and compose the device catalog/detail shell in `src/features/device-management/components/device-form/version-conflict-dialog.tsx`, `src/features/device-management/components/device-form/soft-delete-dialog.tsx`, `src/features/device-management/components/device-management-page.tsx`, `src/app/devices/page.tsx`, `src/app/devices/[deviceId]/page.tsx`, and `src/features/device-management/index.ts`
- [ ] T035 [US1] After T015, run the US1 acceptance scenarios against the real provider and record bounded query, attrs/config, full-replacement PUT, conflict and soft-delete request/response evidence in `specs/002-device-management/checklists/provider-integration.md`; keep this provider-backed checkpoint open until the evidence passes

**Checkpoint**: US1 is a usable catalog-management MVP against MSW; real-provider acceptance still requires T015.

---

## Phase 4: User Story 2 — Quản lý feature và lịch sử audit (Priority: P2)

**Goal**: Show all hardware capabilities, update ordinary features atomically with history, and operate a separated enforcement request/approval workflow.

**Independent Test**: On a fixture device, toggle/configure a normal feature, verify ordered immutable history, request enforcement enable with reason, prove it remains disabled pending approval, reject once and approve once using a different authorized actor.

### Tests for User Story 2

> Write these tests first and confirm they fail before implementing the story.

- [ ] T036 [P] [US2] Write service tests for feature capability projection with opaque item ETags, direct toggle, history cursors, enforcement request/decision, self-approval, session permissions, duplicate pending, idempotency and audit failure in `src/features/device-management/services/device-feature-api.test.ts`
- [ ] T037 [P] [US2] Write store tests for capability-complete rows, effective-versus-pending state, immutable history order, approval queue reconciliation and domain-isolated updates in `src/features/device-management/stores/device-feature-store.test.ts`
- [ ] T038 [P] [US2] Write accessible component tests using the access store for normal toggle, enforcement warning/reason, pending badge, append-only history, approval queue, approve/reject confirmation and permission-hidden actions in `src/features/device-management/components/feature-management/device-features.test.tsx`
- [ ] T039 [P] [US2] Author and pass the MSW-backed P2 browser flow for atomic normal toggles, forced audit failure, pending enforcement, self-approval denial, different-user approve/reject and deleted-device history in `tests/e2e/device-management-us2.spec.ts`

### Implementation for User Story 2

- [X] T040 [US2] Implement typed feature, history and enforcement approval services that consume opaque feature/request `etag` fields for If-Match, apply idempotency to every mutation and map stable problem codes in `src/features/device-management/services/device-feature-api.ts`
- [X] T041 [US2] Implement the focused feature/history/approval Zustand store with effective and pending state kept distinct in `src/features/device-management/stores/device-feature-store.ts`
- [X] T042 [P] [US2] Implement capability-complete feature rows, ordinary feature toggle/config behavior and enforcement status labels in `src/features/device-management/components/feature-management/device-feature-list.tsx`
- [X] T043 [P] [US2] Implement read-only cursor-paginated history ordered by `valid_from DESC` with before/after and actor/approval context in `src/features/device-management/components/feature-management/feature-history.tsx`
- [X] T044 [US2] Implement the mandatory-reason enforcement request dialog that never optimistically enables the feature in `src/features/device-management/components/feature-management/enforcement-request-dialog.tsx`
- [X] T045 [P] [US2] Implement the bounded pending-approval queue using current actor/permissions from `device-management-access-store.ts` for action and requester visibility in `src/features/device-management/components/feature-management/enforcement-approval-queue.tsx`
- [X] T046 [US2] Implement approve/reject confirmation using the request's opaque ETag, current-actor self-approval guard, terminal-state handling and atomic result reconciliation in `src/features/device-management/components/feature-management/enforcement-decision-dialog.tsx`
- [X] T047 [US2] Integrate feature, history and enforcement tabs into the independently loadable device detail in `src/features/device-management/components/device-detail.tsx`
- [X] T048 [US2] Add an authorization-aware approval route shell driven by the session-context access store and public export in `src/app/devices/approvals/page.tsx` and `src/features/device-management/index.ts`
- [ ] T049 [US2] After T015, run the full US2 acceptance scenarios against the real provider without weakening atomic/history assertions and record transaction/authorization evidence in `specs/002-device-management/checklists/provider-integration.md`; keep this provider-backed checkpoint open until the evidence passes

**Checkpoint**: US2 works independently with fixture device identity and proves pending is never effective; provider transaction guarantees still require T015.

---

## Phase 5: User Story 3 — Hiệu chỉnh preset camera PTZ (Priority: P3)

**Goal**: Manage camera presets, edit PTZ values within device metadata and create accessible valid enforcement polygons with server-derived calibration.

**Independent Test**: Save a draft preset, complete PTZ and polygon calibration using pointer and coordinate table, verify calibrated metadata, return it to draft by removing required data, reject duplicates/invalid geometry, and soft delete the preset.

### Tests for User Story 3

> Write these tests first and confirm they fail before implementing the story.

- [X] T050 [P] [US3] Write geometry tests for CRS84 coordinate order, closed ring normalization, 3..500 distinct vertices, range, positive area, self-intersection and antimeridian rejection in `src/features/device-management/utils/polygon.test.ts`
- [ ] T051 [P] [US3] Write preset-service tests for capability gates, bounded list, create/update/delete, duplicate number, PTZ constraints, ETag conflict and server-derived calibration in `src/features/device-management/services/device-preset-api.test.ts`
- [ ] T052 [P] [US3] Write preset-store tests for page reconciliation, selected draft retention, mutation refresh, conflict state and calibrated-to-draft transitions in `src/features/device-management/stores/device-preset-store.test.ts`
- [ ] T053 [P] [US3] Write accessible component tests for preset list/form, map/table synchronization, keyboard vertex operations, error announcements, PTZ limits, undo/reset and soft delete in `src/features/device-management/components/preset-calibration/preset-calibration.test.tsx`
- [ ] T054 [P] [US3] Author and pass the MSW-backed P3 browser acceptance flow for draft/calibrated transitions, pointer/keyboard polygon edits, 501-vertex rejection with draft retention, duplicate preset number, invalid geometry, ETag conflict and soft delete; run one warm-up plus at least 20 independent valid calibration flows, require 100% completion and p95 <=5 minutes in `tests/e2e/device-management-us3.spec.ts`

### Implementation for User Story 3

- [X] T055 [US3] Implement typed polygon normalization, area, segment intersection, antimeridian and validation helpers to satisfy T050 in `src/features/device-management/utils/polygon.ts`
- [X] T056 [US3] Implement typed bounded preset create/full-replacement PUT/soft-delete services with capability, ETag/If-Match, idempotency on every mutation and field-error mapping in `src/features/device-management/services/device-preset-api.ts`
- [X] T057 [US3] Implement focused preset page/detail/mutation/conflict state without mixing UI drafts in `src/features/device-management/stores/device-preset-store.ts`
- [X] T058 [P] [US3] Implement the client-only Leaflet polygon editor loader and fixed-size loading fallback without server-graph Leaflet imports in `src/features/device-management/components/preset-calibration/polygon-editor-loader.tsx`
- [X] T059 [US3] Implement project-owned Leaflet add/drag/remove/reorder rendering with undo/reset and no third-party drawing UI in `src/features/device-management/components/preset-calibration/polygon-editor.tsx`
- [X] T060 [P] [US3] Implement the synchronized accessible coordinate table with keyboard add/remove/reorder and field-linked geometry errors in `src/features/device-management/components/preset-calibration/polygon-coordinate-table.tsx`
- [X] T061 [US3] Implement PTZ metadata constraints, draft preservation, server-authoritative calibration display and JSON/geometry field errors in `src/features/device-management/components/preset-calibration/preset-form.tsx`
- [X] T062 [P] [US3] Implement bounded preset list, calibrated/draft badges, duplicate guidance and soft-delete confirmation in `src/features/device-management/components/preset-calibration/preset-list.tsx`
- [X] T063 [US3] Integrate the capability-gated preset tab into device detail and hide it for unsupported device types in `src/features/device-management/components/device-detail.tsx`
- [ ] T064 [US3] After T015, run the full US3 acceptance scenarios against the real provider without trusting client-derived calibration and record geometry/calibration evidence in `specs/002-device-management/checklists/provider-integration.md`; keep this provider-backed checkpoint open until the evidence passes

**Checkpoint**: US3 supports accessible draft/calibration workflows against MSW; backend geometry and calibration authority still require T015.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove scale, accessibility, contract fidelity, architecture compliance and release readiness across all stories.

- [X] T065 [P] Add fixed-seed 2.000/10.000-device, 500/501-vertex polygon and multi-actor approval fixture generators in `tests/fixtures/device-management/generate-device-management-fixtures.ts`
- [ ] T066 On a fixed 4 vCPU/8 GB runner with Chromium headless, Fast 3G/4G throttle and deterministic seed, automate one warm-up plus three measured runs with at least 100 list/filter/page/select operations per run; require the median of the three run-level p95 values <=2 seconds and capture page-size bounds, cancellation races, 500-vertex polygon FPS/interaction and memory in `tests/performance/device-management.performance.spec.ts` and `playwright.performance.config.ts`
- [ ] T067 [P] Add the combined quickstart browser flow for create/edit, conflict, soft delete, atomic audit, pending approval, calibration and authorization in `tests/e2e/device-management.spec.ts`
- [ ] T068 [P] Add automated keyboard, focus restoration, accessible name/error/status, non-color cues and tablet touch checks for tables, dialogs and map alternatives in `tests/e2e/device-management-accessibility.spec.ts`
- [X] T069 Extend architecture validation for the new feature to reject server-graph Leaflet, direct fetch, feature-local Axios, TanStack Query, extra UI libraries, unbounded list requests and mixed Zustand domains in `scripts/validate-sdlc.ps1`
- [X] T070 [P] Document `/devices`, MSW mode, environment variables, provider gate, authorization assumptions, pagination, geometry limits and troubleshooting in `README.md` and `docs/SDLC.md`
- [ ] T071 Run every scenario in `specs/002-device-management/quickstart.md` and record implementation-specific evidence links and remaining external gates in `specs/002-device-management/quickstart.md`
- [ ] T072 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`, and `scripts/validate-sdlc.ps1`, then record FR/SC traceability and provider/performance status in `specs/002-device-management/checklists/implementation.md`

**Checkpoint**: All local gates pass, evidence is retained, and release status accurately reflects the real-provider contract gate.

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 Setup
    |
    v
Phase 2 Foundation + provisional MSW contract
    |
    +----------> US1 / P1 Catalog CRUD (MVP)
    |
    +----------> US2 / P2 Feature + Approval
    |
    +----------> US3 / P3 Preset Calibration
    |                 |
    +-----------------+
              |
              v
Phase 6 Polish + real-provider release gate
```

- Setup is sequential where dependency/package changes are required; T003 and T005 can proceed in parallel with feature scaffolding.
- T007–T014 and T016–T018 block all stories. T008, T010, T011, T013, T016 and T018 target separate files and may proceed after relevant setup.
- T014 provides provisional MSW development. T015 is the real-provider release gate and may remain open while UI stories are developed.
- US1, US2 and US3 can be developed after Foundation with fixture identities, but `device-detail.tsx` integration is ordered T047 before T063 if implemented in one worktree.
- T023, T039 and T054 are MSW-backed acceptance author/pass tasks and may finish before the backend. T035, T049 and T064 are distinct real-provider evidence checkpoints, depend on T015, and cannot be Done until their recorded provider scenarios pass.
- Phase 6 depends on all desired stories; T071 and final release readiness depend on real-provider and prescribed performance evidence.

### Within-story ordering

- Tests are written and observed failing before implementation.
- Typed services and stores precede UI orchestration.
- Forms retain drafts across validation, network and version-conflict errors.
- No enforcement UI may optimistically set `is_enabled=true`; only the decision response changes effective state.
- Client geometry validation improves feedback, but only the provider response determines calibration.

## Parallel Execution Examples

### User Story 1

```text
Parallel test batch: T019, T020, T021, T022, T023
After T024/T025: T026, T027, T029, T030, T031
Then integrate locally: T028 -> T032 -> T033 -> T034; after T015, close provider checkpoint T035
```

### User Story 2

```text
Parallel test batch: T036, T037, T038, T039
After T040/T041: T042, T043, T045
Then integrate: T044 -> T046 -> T047 -> T048 -> T049
```

### User Story 3

```text
Parallel test batch: T050, T051, T052, T053, T054
After T055/T056/T057: T058, T060, T062
Then integrate: T059 -> T061 -> T063 -> T064
```

## Implementation Strategy

### MVP first

1. Complete Setup and Foundation.
2. Complete US1 through T034 using the OpenAPI-conformant MSW server; close T035 only after T015 and
   the real-provider US1 evidence pass.
3. Stop and validate bounded list/search, object/device creation, JSON/point editing, concurrency and soft delete independently.
4. Treat the result as a development MVP; do not call it provider-integrated until T015 passes.

### Incremental delivery

1. **Catalog MVP**: US1 establishes trusted object/device administration.
2. **Capability increment**: US2 adds atomic feature history and separated enforcement approval.
3. **Calibration increment**: US3 adds PTZ preset and accessible polygon editing.
4. **Release gate**: Phase 6 proves scale, accessibility, architecture and provider fidelity.

### Parallel team strategy

After Foundation, separate owners may work on US1, US2 and US3 using deterministic fixtures and isolated files. Coordinate only shared `device-detail.tsx`, `index.ts`, shadcn primitives and test setup; integrate those files in dependency order rather than editing them concurrently.

## Notes

### Styling amendment — 2026-09-05

- [X] T073 Migrate catalog/forms/JSON and preset editors under
  `src/features/device-management/components/` to Tailwind utilities, remove inline style, and
  verify standalone Leaflet form layout and responsive behavior in
  `tests/e2e/tailwind-styling.spec.ts`. Evidence: `docs/styling-migration.md`.

- `[P]` never authorizes parallel edits to the same file.
- Cursor/page size MUST remain bounded; do not materialize 10.000 rows in the DOM.
- ETag conflicts preserve user drafts; idempotency keys are reused only for retrying the same logical mutation.
- History has no update/delete path. Forced audit failure must leave effective feature state unchanged.
- Enforcement pending is not enabled. Approver differs from requester.
- Leaflet is client-only; coordinate table is a required equivalent interaction, not optional polish.
- Mock success permits parallel development but cannot close the real-provider gate.
