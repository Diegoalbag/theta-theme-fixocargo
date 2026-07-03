---
task: 260703-cpx
title: nosotros-hero optional full-bleed hero background image
status: complete
subsystem: sections
tags: [nosotros-hero, hero, background-image, image-conditional]
key-files:
  modified:
    - src/sections/NosotrosHero/NosotrosHero.tsx
    - test/sections-nosotros.test.tsx
completed: 2026-07-03
---

# Quick 260703-cpx: nosotros-hero optional full-bleed background image

Gave `nosotros-hero` an optional full-bleed background image using the original ATF Hero
slide treatment (full-bleed `object-cover` `<img>` + fixed `bg-black/50` overlay) rendered
BEHIND the existing two-column layout, non-destructive and image-conditional.

## What changed

`src/sections/NosotrosHero/NosotrosHero.tsx`:
- Added `backgroundImage?: { id; url?; alt?; width?; height? }` to `NosotrosHeroProps`
  (distinct from the existing `teamImage` right-column card photo, which is left as-is).
- Added `{ id: "backgroundImage", label: "Imagen de fondo", type: "image_picker", default: undefined }`
  as the FIRST field of `nosotrosHeroSettingsSchema` (schema is now 12 entries).
- `const hasBg = Boolean(backgroundImage?.url)` drives conditional section/container/heading/
  subtitle classNames and conditional rendering of the image + overlay layers.
  - IMAGE MODE: `<section className="relative overflow-hidden section-padding-y">` (drops
    `bg-background`); first children are the `absolute inset-0 h-full w-full object-cover`
    `<img>` and an `aria-hidden absolute inset-0 bg-black/50` overlay; the `.container`
    gains `relative` so content stacks above; heading → `text-white`, subtitle → `text-white/90`.
  - NO-IMAGE MODE: unchanged `<section className="bg-background section-padding-y">` with
    navy heading + muted subtitle.
- ONE reused content block for both modes (two-column flex, team-photo `ImageGuard` card,
  experience badge in normal flow, CTA buttons with empty-label guards). Eyebrow stays
  `text-brand-yellow`; fonts (`font-display italic` heading, `font-gill` subtitle) unchanged.
  Stateless; all text React-escaped JSX.

`test/sections-nosotros.test.tsx`:
- Updated the schema assertion to expect 12 entries with `backgroundImage` first and
  `image_picker` type (legitimately-changed structure).
- Added an image-mode assertion (renders `src`, `object-cover`, `bg-black/50`, `text-white`;
  no `text-brand-navy` / `bg-background`) and a no-image-mode assertion (keeps `bg-background`
  + `text-brand-navy`, no `bg-black/50`).

## Constraints honored

- No hex literals; brand tokens only. No `left-[`/`top-[`/`right-[`/`bottom-[`, no
  `w-[<num>px]`, no `w-screen`/`100vw`. `absolute inset-0` / `object-cover` / `bg-black/50`
  are the allowed forms. Badge stays in normal flow (D-03) — no absolute coordinates.
- `@/` imports only. Stateless (no useState/effects/refs/handlers).

## Verification (full green gate)

- `yarn typecheck` → exit 0
- `yarn build` → exit 0, contract 5/5 passed
- `yarn test` → 16 files / 341 tests passed (was 339; +2 new NosotrosHero tests).
  static-audit, empty-state-matrix, and sections-nosotros all green. Census unchanged 20/17.

## Deviations from plan

None beyond the anticipated test update. The spec's `<verify>` explicitly allowed adjusting
a test that "legitimately asserts changed structure" — the 11→12 schema-length/order
assertion was updated for the new first field.

## Self-Check: PASSED

- FOUND: src/sections/NosotrosHero/NosotrosHero.tsx
- FOUND: test/sections-nosotros.test.tsx
- Commit 058b2f2 present on worktree-agent branch.
