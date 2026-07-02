---
phase: 10-quality-hardening-page-composition-uat
plan: 01
subsystem: testing
tags: [vitest, static-audit, tailwind, coordinate-free, registry-driven, qa]

# Dependency graph
requires:
  - phase: 09-nosotros-page
    provides: 5 new nosotros sections (registry at 20 sections) that the audit auto-enrolls
  - phase: 07-shared-richtext-foundation
    provides: readFileSync source-scan precedent (test/richtext-sink-audit.test.ts)
provides:
  - Registry-driven cross-section static audit (test/static-audit.test.tsx)
  - Machine-checked QA-06 automated half — coordinate-free/hex-free/overflow-free guarantee
affects: [future-sections, quality-hardening, uat, plan-10-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Registry-driven source-text static audit — iterate Object.keys(sectionsComponents), map kebab key to PascalCase source, comment-strip, regex-scan"
    - "kebab-key -> PascalCase -> src/sections/<Pascal>/<Pascal>.tsx source-path convention (readFileSync throw pins naming)"

key-files:
  created:
    - test/static-audit.test.tsx
  modified: []

key-decisions:
  - "Forbid bracketed pixel offsets (left-[/top-[), not bare Tailwind-scale absolute — 5 shipped sections use legitimate absolute positioning"
  - "Omit blanket h-[ ban (deferred to per-section render tests + UAT per A3) — regex cannot distinguish heading from search bar"
  - "Comment-strip source before scanning — codebase's own comments contain the forbidden words and would self-false-positive"

patterns-established:
  - "Pattern 1: Registry-driven totality — future sections auto-enroll with no per-name allowlist"
  - "Pattern 2: Precisely-scoped forbidden regexes that pass GREEN on the unmodified tree (a red first run signals mis-scoping, not a real violation)"

requirements-completed: [QA-06]

coverage:
  - id: D1
    description: "Registry-driven static audit fails any registered section on bracketed pixel offsets, oversized fixed widths, w-screen/100vw, or hex literals; auto-covers future sections"
    requirement: "QA-06"
    verification:
      - kind: unit
        ref: "test/static-audit.test.tsx#static audit — every registered section is coordinate-free & hex-free (QA-06, D-01)"
        status: pass
    human_judgment: false

# Metrics
duration: ~8min
completed: 2026-07-02
status: complete
---

# Phase 10 Plan 01: Registry-Driven Cross-Section Static Audit Summary

**A single registry-driven Vitest guard (`test/static-audit.test.tsx`) that comment-strips each of the 20 registered sections' source and fails on bracketed pixel offsets, oversized fixed widths, `w-screen`/`100vw`, or hex literals — GREEN on the current tree and auto-enrolling any future section.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-07-02T20:03:00Z
- **Completed:** 2026-07-02T20:05:49Z
- **Tasks:** 1
- **Files modified:** 1 (created)

## Accomplishments
- Authored the unified QA-06 automated half: one cross-section coordinate/overflow/hex drift-guard replacing scattered per-section intent with a single source of truth.
- Registry-driven totality: the audit iterates `Object.keys(sectionsComponents)` and maps each kebab key to its PascalCase source file, so a future section is under the guard the moment it lands in the registry — no per-name allowlist.
- Precisely scoped to the real anti-pattern (Figma-export bracketed pixel coordinates), so it passes GREEN on the unmodified `src/` tree (20/20 sections) without red-lining the 5 sections that use legitimate Tailwind-scale `absolute` positioning.
- Mandatory comment-strip prevents the codebase's own explanatory comments ("absolute coordinates", "no hex literals") from self-false-positiving.

## Task Commits

Each task was committed atomically:

1. **Task 1: Registry-driven cross-section static audit (D-01, QA-06)** - `00522d2` (test)

## Files Created/Modified
- `test/static-audit.test.tsx` - Registry-driven cross-section coordinate/overflow/hex static audit (20 section cases via `it.each`), reads + comment-strips source, asserts 4 precise forbidden patterns.

## Decisions Made
- **Bracketed offsets, not bare `absolute`:** the four rules target `left-[`/`top-[`/`right-[`/`bottom-[` bracketed pixel offsets, `w-[####px]` (4+ digit), `w-screen`/`100vw`, and `#rgb`/`#rrggbb` hex — all grep-verified 0 today. A blanket `absolute` ban would red-line Hero carousel arrows, SiteHeader dropdown, Sucursales map overlay, BlogList badge, and `absolute inset-0` overlays.
- **`h-[` deferred (A3):** no automated `h-[`-on-text rule — a regex cannot distinguish a heading from a search bar/logo/iframe; delegated to per-section render tests + the UAT checklist.
- **Kept existing per-section guards:** the narrower rendered-className `not.toContain("absolute")` assertions in `test/sections-*.test.tsx` remain — they pin a stronger per-section invariant. Reconcile, do not delete.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The worktree had no `node_modules` (main repo uses the node-modules linker). Symlinked the main repo's gitignored `node_modules` into the worktree so Vitest/tsc/Vite could run. This is a local, gitignored artifact — not committed and not a code change.
- `test/registration-contract.test.ts` initially failed because `dist/theme.bundle.js` was absent in the fresh worktree; running `yarn build` (which builds the bundle then runs the contract test) produced the artifact and the contract test passed. Not related to this plan's change.

## Verification
- `yarn vitest run test/static-audit.test.tsx` → 1 file / 20 tests pass (one case per registered section).
- `yarn typecheck` (`tsc --noEmit`) → clean.
- `yarn build` → bundle built + `test:contract` 5/5 pass (single-key `fixocargo`).
- `yarn test` (full suite) → 15 files / 332 tests pass; all existing per-section coordinate-free guards remain green.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- QA-06 automated half is complete and green; sibling plans 10-02 (jsdom DOMPurify XSS test) and 10-03 (empty-state reconcile + UAT checklist) are unblocked.
- The audit will automatically cover any section added in future phases.

---
*Phase: 10-quality-hardening-page-composition-uat*
*Completed: 2026-07-02*
