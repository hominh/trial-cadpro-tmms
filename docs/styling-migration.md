# Tailwind styling migration

Scope approved on 2026-09-05: migrate application styling to Tailwind utilities without changing
data flow, business behavior, geometry, dimensions, colors or responsive breakpoints.

- Shared shadcn primitives, landing page, realtime map and device-management editors use Tailwind
  utilities, including arbitrary values where necessary to retain the exact previous dimensions.
- Existing semantic class names remain as DOM/test identifiers; they have no custom CSS definitions.
- `src/app/globals.css` is the only application CSS file. It imports Tailwind and the required
  Leaflet vendor stylesheet, with a comment explaining Leaflet-owned layout. The shimmer keyframes
  are a Tailwind theme animation token, preserving the previous duration and reduced-motion variant.
- Marker heading uses an SVG transform attribute around the existing marker content. The shared
  animation scheduler and angle interpolation are unchanged; no application inline style is written.
- No changes are made to backend/provider acceptance gates.

Validation: unit suite, complete Playwright suite, production build, lint and strict typecheck.
The additional `tests/e2e/tailwind-styling.spec.ts` checks offline/alert marker appearance, exact
marker/button dimensions, 760/940px breakpoints and Leaflet initialization in standalone forms.

Results (2026-09-05): 44 unit tests passed; 4 existing provider tests skipped pending a real backend.
All 12 Playwright E2E tests passed, including the two styling regression tests. Production build
passed with `NEXT_DIST_DIR=.next-tailwind` to isolate output from the running development server.
Lint, strict typecheck and SDLC validation passed. Source audit found no inline styles or additional
application stylesheets. Vendor-generated Leaflet style attributes remain owned by Leaflet.
