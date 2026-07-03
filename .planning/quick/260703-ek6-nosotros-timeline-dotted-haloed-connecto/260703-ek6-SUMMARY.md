---
task: 260703-ek6
title: nosotros-timeline dotted haloed connector + 2-column image banner
status: complete
subsystem: sections/NosotrosTimeline, blocks/TimelineItem
key-files:
  modified:
    - src/sections/NosotrosTimeline/NosotrosTimeline.tsx
    - src/blocks/TimelineItem/TimelineItem.tsx
    - test/sections-nosotros.test.tsx
completed: 2026-07-03
---

# Quick 260703-ek6: nosotros-timeline dotted haloed connector + 2-column image banner Summary

Reshaped the `nosotros-timeline` HISTORY band to match the FixoCargo screenshot: a
DOTTED yellow connector with haloed dots over white cards, in a responsive
2-column layout (timeline LEFT, tall rounded image banner RIGHT). Implemented
coordinate-free (borders / rings / flex / fractions / brand tokens only) — no
absolute positioning, no bracketed coordinates, no hex literals ported from the
design HTML.

## What changed

1. **Dotted connector** — `NosotrosTimeline.tsx`: the BlocksSlot rail wrapper
   went from `border-l-2 border-brand-yellow` (solid) to
   `border-l-2 border-dotted border-brand-yellow`. Still a wrapper border, never
   an absolute line. Kept the `pl-6 flex flex-col gap-4` shape.

2. **Haloed dot** — `TimelineItem.tsx`: the dot span gained `ring-4 ring-muted`
   (band color = `bg-muted`) so it punches over the dotted line. Kept the
   coordinate-free `-ms-6` pull onto the rail; no absolute, no bracketed offsets.

3. **2-column layout + image banner** — `NosotrosTimeline.tsx`:
   - Added `bannerImage?` prop and an `image_picker` schema field
     ("Imagen lateral", default undefined) appended after `heading`.
   - Wrapped content below the centered header in
     `mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12`.
     LEFT = `lg:w-3/5` div with the existing BlocksSlot (dotted connector,
     default EmptyState kept — no `empty={null}`). The `mt-8` moved off the
     BlocksSlot onto the row.
     RIGHT = `lg:w-2/5` div with
     `<div className="overflow-hidden rounded-3xl bg-card shadow-lg"><ImageGuard url={bannerImage?.url} alt={bannerImage?.alt} ratio={760/900} /></div>`.
   - Mobile stacks (`flex-col`) timeline-then-banner; nothing hidden.
     `w-3/5`/`w-2/5` are fraction utilities (allowed); `ratio` is a numeric prop.

4. **Tests** — `test/sections-nosotros.test.tsx`: updated NosotrosTimeline
   assertions to the new intent — `border-dotted` on the connector, the
   `lg:flex-row` / `lg:w-3/5` / `lg:w-2/5` 2-column wrapper, the banner ImageGuard
   (placeholder when unset, real `src` when set), and schema now 3 entries
   `[eyebrow, heading, bannerImage]` with `bannerImage` typed `image_picker`.
   Kept the zero-block EmptyState ("Sin elementos") assertion.

## Deviations from Plan

**1. [Rule 3 - Blocking] Removed the section-level `not.toContain("absolute")`
assertion on the timeline rail render test.**
- **Issue:** The spec directs embedding an `ImageGuard` banner in the section.
  `ImageGuard` renders the sanctioned `absolute inset-0` overlay (explicitly on
  the static-audit allow-list). Once the banner is part of the section render,
  the whole-section "absolute never appears" assertion is factually impossible.
- **Fix:** Relocated the coordinate-free proof rather than weakening it: the
  connector rail is still asserted border/flex-only (`border-l-2 border-dotted`),
  the `TimelineItem` block test still bans `absolute` on the dot/rail item, and
  `static-audit.test.tsx` still bans bracketed offsets/hex on the section source.
  Replaced the removed line with an explanatory comment documenting why.
- **Files modified:** test/sections-nosotros.test.tsx

## Verification (full gate)

| Gate | Result |
|------|--------|
| `yarn typecheck` | exit 0 |
| `yarn build` (contract) | exit 0; contract test 5/5 passed; bundle emitted |
| `yarn test` (full suite) | 16 files, 343 tests, all passed |

Confirmed static-audit still passes on both timeline files (no coordinate/hex
regression — the implementation uses `border-dotted`, `ring-4 ring-muted`,
fraction widths, and the numeric `ratio` prop only). Census stays 20/17
(empty-state-matrix green) — no sections or blocks were added, only a settings
field and layout classes; the zero-block EmptyState is kept.

## Self-Check: PASSED
- src/sections/NosotrosTimeline/NosotrosTimeline.tsx — modified (dotted connector, 2-col row, ImageGuard banner, bannerImage schema)
- src/blocks/TimelineItem/TimelineItem.tsx — modified (ring-4 ring-muted halo)
- test/sections-nosotros.test.tsx — modified (new intent assertions)
- Full suite green; commit hash recorded below.
