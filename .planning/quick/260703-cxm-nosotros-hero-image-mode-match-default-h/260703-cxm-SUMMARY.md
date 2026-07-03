---
task: 260703-cxm
title: nosotros-hero IMAGE mode matches default hero height + heading/subtitle typography
status: complete
follows_up: 260703-cpx
key-files:
  modified:
    - src/sections/NosotrosHero/NosotrosHero.tsx
    - test/sections-nosotros.test.tsx
---

# Quick 260703-cxm: NosotrosHero IMAGE mode matches default hero height + text

Aligned `nosotros-hero`'s IMAGE mode (the `hasBg` branch) with the default hero
(`HeroSlide`) on HEIGHT and HEADING/SUBTITLE typography. NO-IMAGE mode is
untouched.

## Changes

`src/sections/NosotrosHero/NosotrosHero.tsx` — image-mode branch only:

1. **Height:** section wrapper (image mode) gains
   `min-h-[30vh] md:min-h-[560px] flex items-center` (was `relative overflow-hidden section-padding-y`).
   The absolute full-bleed `<img>` + `bg-black/50` overlay layers are unaffected;
   the `.container` becomes the vertically-centered flex child. NO-IMAGE mode
   keeps `bg-background section-padding-y` with no min-height/flex.
2. **Heading:** image mode now uses the default hero classes
   `font-aku font-bold text-white text-4xl md:text-6xl lg:text-8xl`
   (was `font-display italic text-white text-3xl lg:text-5xl leading-tight`).
   NO-IMAGE mode keeps `font-display italic text-brand-navy text-3xl lg:text-5xl leading-tight`.
3. **Subtitle:** image mode now uses `font-gill text-white text-lg md:text-2xl`
   (was `font-gill text-lg text-white/90 max-w-xl` — `max-w-xl` dropped in image
   mode). NO-IMAGE mode unchanged.

Eyebrow (`text-brand-yellow`), the two CTA buttons + guards, the team-photo
`ImageGuard` card, and the normal-flow experience badge are unchanged in both
modes. Stateless; renders under `renderToStaticMarkup`.

`test/sections-nosotros.test.tsx` — strengthened the existing image-mode
assertion (no weakening): added positive asserts for `min-h-[30vh]`,
`md:min-h-[560px]`, `font-aku`, `lg:text-8xl`, `font-gill`, `md:text-2xl`. The
no-image assertions and negative image-mode asserts (`not text-brand-navy`,
`not bg-background`) are retained.

## Constraints honored

- No hex literals; brand tokens only. New arbitrary utilities
  (`min-h-[30vh]`, `md:min-h-[560px]`, `text-8xl`, `font-aku`) are on the
  static-audit allow-list — audit passes.
- `@/` imports only. No registry change (census 20/17).

## Verification

| Gate | Command | Exit | Result |
|------|---------|------|--------|
| Typecheck | `yarn typecheck` | 0 | clean |
| Build | `yarn build` | 0 | contract 5/5 (theme.bundle.js 145.05 kB) |
| Tests | `yarn test` | 0 | 16 files / 341 passed (incl. static-audit, empty-state-matrix, sections-nosotros) |

## Self-Check: PASSED
- src/sections/NosotrosHero/NosotrosHero.tsx — modified (verified in git status)
- test/sections-nosotros.test.tsx — modified (verified in git status)
- Full gate green.
