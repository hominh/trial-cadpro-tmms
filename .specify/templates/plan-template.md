# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Strict TypeScript**: Confirm strict mode remains enabled and the design introduces no broad
  type-safety bypasses.
- **Feature ownership**: Identify the owning `src/features/<feature>/` directory and justify every
  new shared module by naming its cross-feature consumers.
- **API boundary**: Confirm all HTTP calls use the shared Axios instance in `src/helpers/api` or its
  documented equivalent; no direct `fetch` or feature-local Axios instance is allowed.
- **UI system**: List the shadcn/ui primitives and project-owned components used; no other UI
  library is allowed.
- **Data fetching**: Confirm Axios is used directly and TanStack Query is not introduced.
- **State boundaries**: Classify state as local, UI-domain Zustand, or server-polling Zustand;
  polling and UI state must not share one monolithic store.
- **Spec-driven gate**: Confirm `spec.md` exists and this plan precedes `tasks.md` and implementation.
- **Realtime/geo scale, when applicable**: Define behavior for 2,000+ devices, viewport-bounded
  requests, polling cadence, stale responses, disposal, and cancellation of the prior request with
  `AbortController`.

Any failed gate MUST be resolved before Phase 0 or recorded in Complexity Tracking with explicit
approval and a migration plan.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Use the CadPro TMMS frontend layout below. Expand the owning
  feature with real paths and omit unused optional directories. Any alternative
  structure is a Constitution Check violation and requires Complexity Tracking.
-->

```text
src/
|-- app/                         # Next.js routes and composition
|-- components/ui/               # shadcn/ui primitives
|-- features/<feature>/
|   |-- components/
|   |-- hooks/
|   |-- services/                # Calls shared Axios instance only
|   |-- stores/                  # Focused Zustand stores by domain/lifecycle
|   `-- types/
|-- helpers/api/                 # Shared Axios instance and HTTP behavior
`-- shared/                      # Proven cross-feature code only

tests/ or colocated *.test.* files, according to repository convention
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
