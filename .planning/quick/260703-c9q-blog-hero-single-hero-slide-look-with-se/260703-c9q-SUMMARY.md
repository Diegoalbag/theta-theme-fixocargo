---
task: 260703-c9q
title: blog-hero renders single hero-slide look with a background-image setting
status: complete
subsystem: sections
tags: [blog-hero, hero-slide, image_picker, ui]
key-files:
  modified:
    - src/sections/BlogHero/BlogHero.tsx
commits:
  - f8bbf17: feat(quick-260703-c9q) blog-hero renders single hero-slide look with background-image setting
completed: 2026-07-03
---

# Quick Task 260703-c9q: BlogHero single hero-slide look Summary

Gave the `blog-hero` section an image-conditional hero-slide visual — a full-bleed
background image + fixed 50% dark overlay + LEFT-aligned content column that mirrors
`src/blocks/HeroSlide/HeroSlide.tsx` — while staying a no-block, settings-driven
section. Backward compatible: with no image set, the original `bg-brand-navy` centered
band renders unchanged (byte-for-byte), so the Article/Legal page headers are untouched.

## What Changed

`src/sections/BlogHero/BlogHero.tsx`:

- Added optional `backgroundImage?: { id; url?; alt?; width?; height? }` to `BlogHeroProps`.
- Added `{ id: "backgroundImage", label: "Imagen de fondo", type: "image_picker", default: undefined }`
  as the FIRST field in `blogHeroSettingsSchema`.
- Factored the shared inner content (eyebrow → dark `SectionHeading` → search-pill-OR-date)
  into a local `content` fragment reused by both render branches.
- Branched the render on a defensive `hasImage = Boolean(backgroundImage?.url)` guard
  (treats `{}`/string/falsy `.url` as "no image"):
  - IMAGE MODE: `relative flex items-center overflow-hidden min-h-[30vh] md:min-h-[560px]`
    `<section>`, full-bleed `<img ... className="absolute inset-0 h-full w-full object-cover">`,
    `bg-black/50` overlay `<div aria-hidden>`, then the shared content in a
    LEFT-aligned column (`max-w-3xl flex flex-col items-start`, `container-padding-x`).
    Text stays white; eyebrow stays `text-brand-yellow`.
  - NO-IMAGE MODE: the original `bg-brand-navy section-padding-y` + `text-center` band, unchanged.
- The search pill's centering (`mx-auto`) is applied inline only in no-image mode
  (`searchPillAlign`), preserving the navy-mode class order byte-for-byte.
- Kept all existing props/logic (`showSearch`, `date`, `eyebrow`, defaults) and the
  inert search input (readOnly / aria-hidden / tabIndex=-1). No state/effects/refs/handlers.

## Locked Decisions Honored

1. IMAGE-CONDITIONAL: full-bleed hero-slide look + LEFT alignment when `backgroundImage?.url`
   is truthy; original navy centered band (unchanged) when falsy.
2. KEPT THE SEARCH PILL: the decorative/inert search pill and the date/eyebrow variants
   stay; in image mode they render inside the new left-aligned column.

## Constraints Honored

- No hex color literals — brand tokens only (`bg-brand-navy`, `text-brand-yellow`,
  `text-brand-navy`, `bg-black/50`). No banned coordinate-bound classes; only the
  allowed `absolute inset-0`, `min-h-[30vh]`, `min-h-[560px]`, and existing `h-[60px]`.
- `@/` imports only. Content-only, stateless. Renders under `renderToStaticMarkup`.
- No registry change — census stays 20 sections / 17 blocks.

## Verification (Green Gate)

- `yarn typecheck` → exit 0
- `yarn build` → exit 0 (single-key `fixocargo` contract 5/5)
- `yarn test` → exit 0 (16 files / 339 tests passed, incl. static-audit,
  empty-state-matrix, blog-hero — unchanged no-image path stayed green; no test edits needed)

## Deviations from Plan

None — task executed exactly as specified.

## Self-Check: PASSED

- src/sections/BlogHero/BlogHero.tsx — FOUND
- Commit f8bbf17 — FOUND
