<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - III. shadcn/ui-Only Interface System -> III. shadcn/ui and Tailwind Interface System
- Added sections:
  - VII. Tailwind-Only Styling
- Removed sections: None.
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
- Command and runtime guidance review:
  - ✅ reviewed: .agents/skills/speckit-*/SKILL.md; generic guidance has no stale
    agent-specific references.
  - ✅ updated: README.md and docs/SDLC.md
- Follow-up TODOs: Existing nonconforming styles MUST receive a migration task before their
  affected feature is next materially changed.
-->
# CadPro TMMS Frontend Constitution

## Core Principles

### I. Strict Type Safety and Feature Ownership
TypeScript strict mode MUST remain enabled and all application code MUST satisfy it without
disabling strict checks or using broad escape hatches such as unbounded `any`. Feature-specific
components, hooks, types, services, and stores MUST live under `src/features/<feature>/`.
Shared code MAY live outside feature directories only when it has at least two concrete consumers
or is foundational infrastructure. This keeps ownership explicit and makes unsafe contracts visible
at compile time.

### II. Centralized Axios API Boundary
Every HTTP API call MUST use the project's shared Axios instance in `src/helpers/api` or its
documented equivalent. Application and feature code MUST NOT call `fetch` directly or create
independent Axios instances. Cross-cutting behavior such as base URL configuration, authentication,
error normalization, cancellation, and interceptors MUST be implemented at this shared boundary.
This provides one auditable and consistent network contract.

### III. shadcn/ui and Tailwind Interface System
Product UI MUST be composed from shadcn/ui components and project-owned components built on those
primitives. No other UI component library MAY be introduced. Missing patterns MUST be implemented
as local, accessible components consistent with shadcn/ui conventions. This prevents competing
design systems, duplicate dependencies, and inconsistent accessibility behavior.

### IV. Domain-Separated Zustand State
Shared client state MUST use Zustand and MUST be divided into focused domain stores. Server-state
polling and UI interaction state MUST reside in separate stores; a single application-wide store
that combines unrelated domains is prohibited. State that is local to one component SHOULD remain
local rather than being promoted to Zustand. Data fetching MUST use Axios directly and MUST NOT use
TanStack Query. These boundaries keep update frequency, ownership, and lifecycle behavior explicit.

### V. Specification-Driven Delivery
Every feature MUST have an approved `spec.md` before application code is written. Delivery MUST
follow the Spec Kit sequence `specify -> plan -> tasks`; implementation MAY begin only after those
artifacts exist and the plan passes the Constitution Check. Material requirement or architecture
changes MUST be reflected in the relevant artifacts before implementation continues. This creates
traceability from user outcome to design decision and executable task.

### VI. Scalable Realtime and Geospatial Data
Realtime and geospatial features MUST be designed and verified for at least 2,000 devices. Map and
location requests MUST be bounded to the active viewport or an equivalently explicit spatial
window; unbounded full-fleet retrieval for interactive views is prohibited. Polling MUST cancel the
previous in-flight request with `AbortController` before starting a replacement and MUST stop when
the owning view or subscription is disposed. Plans and specs MUST define polling cadence, viewport
change behavior, stale-response handling, and measurable scale targets whenever this principle
applies.

### VII. Tailwind-Only Styling
All product styling MUST use Tailwind CSS utility classes and the Tailwind-compatible styling of
shadcn/ui. New components MUST NOT introduce CSS Modules, feature-specific or other custom CSS
files, inline `style` props, or CSS-in-JS. A third-party-library override, such as Leaflet styling,
is the only exception: it MUST be consolidated in the single global stylesheet, currently
`src/app/globals.css`, and preceded by a comment naming the library and explaining why utilities
cannot express the override. Existing nonconforming styles MUST receive a migration task before the
affected feature is next materially changed. This keeps visual rules discoverable, composable, and
consistent with the project design system.

## Technology and Architecture Constraints

- The frontend stack is Next.js with TypeScript strict mode.
- shadcn/ui is the sole UI component system.
- Tailwind CSS utility classes are the sole product-styling mechanism; custom CSS is limited to the
  documented third-party override exception in `src/app/globals.css`.
- Axios, through the shared API instance, is the sole HTTP data-fetching mechanism.
- TanStack Query and direct `fetch` usage are prohibited.
- Zustand is the shared state-management library, with stores separated by domain and lifecycle.
- Feature code belongs in `src/features/<feature>/`; shared infrastructure MUST have documented
  cross-feature responsibility.
- Realtime and geospatial design decisions MUST include evidence that the 2,000-device scale target
  and request-cancellation requirements are met.

Any exception is a constitution violation. It MUST be documented in the plan's Complexity Tracking
section with the specific need, rejected compliant alternatives, risk, and removal or migration
plan, then explicitly approved before implementation.

## Development Workflow and Quality Gates

1. Run the Spec Kit `specify` workflow and obtain an approved feature specification.
2. Run `plan`; document feature ownership, API boundaries, UI primitives, state domains, and any
   realtime or geospatial scaling strategy.
3. Pass the Constitution Check before research/design proceeds and repeat it after design artifacts
   are complete.
4. Run `tasks`; tasks MUST name exact paths and include all applicable constitution work, including
   shared Axios integration, separated Zustand stores, strict typing, and scalable polling.
5. Implement only from the approved task list. Reviews MUST reject direct `fetch`, extra UI
   libraries, TanStack Query, monolithic stores, misplaced feature code, uncancelled polling, CSS
   Modules, inline styling, CSS-in-JS, or undocumented custom stylesheet rules.
6. Before merge, run the repository's typecheck, lint, and relevant tests. Realtime/geospatial
   work MUST also verify viewport-bounded requests, cancellation, disposal, and the declared scale
   target.

## Governance

This constitution supersedes conflicting conventions, plans, and implementation preferences.
Amendments require a documented proposal, review of affected templates and active feature
artifacts, explicit project-owner approval, and a migration plan for noncompliant code.

Constitution versions follow semantic versioning: MAJOR for incompatible governance changes or
principle removals/redefinitions, MINOR for new principles or materially expanded obligations, and
PATCH for clarifications that do not change obligations. The Last Amended date MUST change whenever
the version changes.

Every feature plan and code review MUST demonstrate compliance. Unjustified violations block
implementation or merge. Approved exceptions MUST be temporary, scoped, recorded in Complexity
Tracking, and reviewed again before release. The constitution MUST be reviewed whenever the core
frontend stack or device-scale requirements change.

**Version**: 1.1.0 | **Ratified**: 2026-09-04 | **Last Amended**: 2026-09-05
