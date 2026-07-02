---
phase: 09-nosotros-page
plan: 02
subsystem: sections-blocks
tags: [nosotros, stats, block-container, blocks-slot, navy-band]
status: complete
requires:
  - src/lib/blocks-slot.tsx
  - src/lib/empty-state.tsx
provides:
  - "nosotros-stats section component (NosotrosStats + nosotrosStatsSettingsSchema)"
  - "stat-item section-local block (StatItem + statItemSettingsSchema)"
affects:
  - src/registry.ts (Plan 05 wires stat-item into sectionBlocksConfig['nosotros-stats'].localBlocks)
tech-stack:
  added: []
  patterns:
    - "BlocksSlot with wrapper-drawn dividers (divide-y mobile / border-l desktop)"
    - "default EmptyState kept for zero-block state (D-04)"
    - "number-as-text stat (text setting, not numeric)"
key-files:
  created:
    - src/blocks/StatItem/StatItem.tsx
    - src/blocks/StatItem/index.ts
    - src/sections/NosotrosStats/NosotrosStats.tsx
    - src/sections/NosotrosStats/index.ts
  modified: []
decisions:
  - "Number field is a text setting so authored values like '50K+' render verbatim"
  - "Dividers drawn on BlocksSlot wrapper children only — no <hr>, no absolute positioning"
  - "Band header (eyebrow/heading) defaults empty to preserve the design's bare navy bar"
metrics:
  duration: ~4m
  completed: 2026-07-02
  tasks: 2
  files: 4
---

# Phase 09 Plan 02: NosotrosStats + StatItem Summary

Built the `nosotros-stats` full-bleed navy stats band and its section-local `stat-item` block (number-as-text + label), with wrapper-drawn dividers and the default EmptyState preserved at zero blocks (D-04). Registry wiring is deferred to Plan 05.

## What Was Built

### Task 1 — StatItem section-local block (NOS-03)
- `src/blocks/StatItem/StatItem.tsx` — stateless leaf block rendering an authored TEXT number (`font-display italic text-brand-yellow text-4xl lg:text-6xl`) over a label (`font-gotham font-bold text-sm text-white`), centered in a `flex flex-col items-center` column.
- `statItemSettingsSchema` — exactly 2 `text` fields: `number` (default "50K+"), `label` (default "Paquetes al mes"). Number is text (never numeric) so "50K+"/"24" render verbatim.
- `src/blocks/StatItem/index.ts` — barrel (`export * from "./StatItem"`).
- Commit: `d893955`

### Task 2 — NosotrosStats block-container section (NOS-03, D-04)
- `src/sections/NosotrosStats/NosotrosStats.tsx` — `section.bg-brand-navy.section-padding-y` → inner `container mx-auto container-padding-x`. Optional guarded band header (eyebrow `<p>` + heading `<h2>`, each omitted when empty). Items wrap `renderBlocks()` in a single `<BlocksSlot>` whose `className` carries the entire divider system: `mt-8 flex flex-col divide-y divide-white/12 sm:flex-row sm:divide-y-0 [&>*:not(:first-child)]:sm:border-l [&>*:not(:first-child)]:sm:border-white/12`.
- Default EmptyState kept (no `empty={null}`) → zero blocks shows "Sin elementos", never a blank navy band.
- `nosotrosStatsSettingsSchema` — exactly 2 `text` fields: `eyebrow` (default ""), `heading` (default ""), preserving the bare bar per the design.
- `src/sections/NosotrosStats/index.ts` — barrel (`export * from "./NosotrosStats"`).
- Commit: `9cfc542`

## Must-Haves Verification
- Merchant can add/remove/reorder `stat-item` blocks inside `nosotros-stats` (section is a block container via BlocksSlot). ✓
- Each `stat-item` shows a text number + label. ✓
- Dividers drawn on the BlocksSlot wrapper (`divide`/`border-l`) — no `<hr>`, no absolute positioning (grep confirms the only `<hr`/`absolute` occurrences are in explanatory comments). ✓
- Zero blocks → default EmptyState ("Sin elementos"), `empty={null}` NOT passed (D-04). ✓

## Verification
- `tsc --noEmit -p tsconfig.json` exits 0 (section + block compile; all `@/` imports resolve).
- Note: `yarn typecheck` could not run inside the isolated worktree because `node_modules` are not installed there; ran the identical `tsc --noEmit` binary from the main repo toolchain against the worktree `tsconfig.json` — exit 0. Behavioral coverage (zero-block EmptyState, divider classes, no-absolute, with-blocks render, schema lengths) is asserted by the Plan 05 smoke-test task once the components are registered.

## Threat Surface
- T-09-03 (Tampering, stat text): number/label rendered as JSX text — React auto-escapes; no `dangerouslySetInnerHTML`. Mitigated.
- T-09-05 (DoS, zero-block layout): default `EmptyState` kept; `empty={null}` not passed. Mitigated.
- No new packages installed (T-09-SC accept).

## Deviations from Plan
None — plan executed exactly as written.

## Known Stubs
None.

## Self-Check: PASSED
- FOUND: src/blocks/StatItem/StatItem.tsx (45 lines)
- FOUND: src/blocks/StatItem/index.ts
- FOUND: src/sections/NosotrosStats/NosotrosStats.tsx (69 lines)
- FOUND: src/sections/NosotrosStats/index.ts
- FOUND commit d893955 (Task 1)
- FOUND commit 9cfc542 (Task 2)
