---
status: pending
phase: 10-quality-hardening-page-composition-uat
source: [10-VERIFICATION.md]
started: 2026-07-02T20:42:06Z
updated: 2026-07-02T20:42:06Z
---

## Current Test

[not started — run via /gsd-verify-work in the project-theta-fe customizer]

## How to run

This is a **human-run UAT checklist** (QA-06 SC3/SC4), not Claude-driven browser
automation. For each page below:

1. In the `project-theta-fe` customizer, assemble the page using ONLY the registered
   sections listed in its recipe (chrome = `announcement-bar` + `site-header` at the
   top and `footer` at the bottom on every page). Add the child blocks named in each
   recipe (e.g. `_blog-card`, `branch`, `address-card`, `store-badge`).
2. Publish (or use the published preview) and open the page.
3. At each breakpoint width — **375 / 768 / 1280 / 1920** — set the browser/devtools
   viewport to that width and verify BOTH:
   - **Faithful render:** the layout matches the design intent for that page (design
     comp where one exists; ART-03/ART-04 intent where noted).
   - **No horizontal scroll:** the page body does not scroll sideways at that width
     (`document.documentElement.scrollWidth <= window.innerWidth`; no element bleeds
     past the viewport edge).
4. Mark each test `result: pass` / `fail` / `pending`. On `fail`, record the offending
   section/breakpoint and the symptom under `## Gaps`.

Chrome (`announcement-bar` + `site-header` + `footer`) is present on every page, so a
horizontal-scroll regression in chrome is caught on all four pages.

## Tests

### 1. Blog page @ 375 (mobile)
Recipe: `announcement-bar`, `site-header`, `blog-hero` (index variant — eyebrow, heading,
subtitle, decorative search), `blog-list` (featured post + grid of merchant-added
`_blog-card` blocks), `footer`. Design refs: `Blog.dc.html`, `BlogList.dc.html`.
expected: Blog index renders faithfully at 375px — hero stacks, chip/search row wraps,
featured post is single-column, card grid collapses to 1 column; no horizontal scroll.
result: pending

### 2. Blog page @ 768 (tablet)
Recipe: same as test 1.
expected: Blog index renders faithfully at 768px — featured post begins its split layout,
card grid is 2 columns, spacing matches `BlogList.dc.html`; no horizontal scroll.
result: pending

### 3. Blog page @ 1280 (desktop)
Recipe: same as test 1.
expected: Blog index renders faithfully at 1280px — featured `lg:flex-row` split, 3-column
card grid, decorative search aligned per `Blog.dc.html`; no horizontal scroll.
result: pending

### 4. Blog page @ 1920 (wide desktop)
Recipe: same as test 1.
expected: Blog index renders faithfully at 1920px — content stays within the max-width
container (no edge-to-edge stretch), grid and hero remain aligned; no horizontal scroll.
result: pending

### 5. Nosotros page @ 375 (mobile)
Recipe (order per `Nosotros.dc.html`): `announcement-bar`, `site-header`, `nosotros-hero`,
`nosotros-mission`, `nosotros-stats` (with `stat-item` blocks), `nosotros-values` (with
`value-card` blocks), `nosotros-timeline` (with `timeline-item` blocks); branches
("Dónde estamos") via `sucursales` (with `branch` blocks) OR `direccion-cards` (with
`address-card` blocks); CTA stand-in via `descarga-app` (with `store-badge` blocks — see
CTA stand-in note in Gaps); `footer`.
expected: Nosotros renders faithfully at 375px — hero, mission, stats, values, timeline,
branches and the `descarga-app` CTA band all stack single-column and read top-to-bottom
in the `Nosotros.dc.html` order; no horizontal scroll.
result: pending

### 6. Nosotros page @ 768 (tablet)
Recipe: same as test 5.
expected: Nosotros renders faithfully at 768px — stats/values/branches move to 2-up grids,
timeline aligns per design intent, `descarga-app` CTA band is full-width; no horizontal scroll.
result: pending

### 7. Nosotros page @ 1280 (desktop)
Recipe: same as test 5.
expected: Nosotros renders faithfully at 1280px — full multi-column stats/values/branches,
timeline horizontal/aligned per `Nosotros.dc.html`, CTA band matches the yellow
"¿Listo para enviar?" intent via `descarga-app`; no horizontal scroll.
result: pending

### 8. Nosotros page @ 1920 (wide desktop)
Recipe: same as test 5.
expected: Nosotros renders faithfully at 1920px — all sections stay within the max-width
container, no edge-to-edge stretch on stats/values/timeline/CTA; no horizontal scroll.
result: pending

### 9. Legal / policies page @ 375 (mobile)
Recipe (NO dedicated design comp — verify against ART-03/ART-04 intent): `announcement-bar`,
`site-header`, `blog-hero` in **article-header variant** (search hidden/disabled),
`article-body` (richtext policy body), `footer`.
expected: Legal page renders faithfully at 375px — article-header shows title without the
decorative search, richtext policy body is single-column and readable, lists/headings wrap
cleanly; no horizontal scroll.
result: pending

### 10. Legal / policies page @ 768 (tablet)
Recipe: same as test 9.
expected: Legal page renders faithfully at 768px — article-header and article-body respect
the reading-width container, no long-line overflow; no horizontal scroll.
result: pending

### 11. Legal / policies page @ 1280 (desktop)
Recipe: same as test 9.
expected: Legal page renders faithfully at 1280px — article-body stays within its centered
reading column, article-header variant hides search; no horizontal scroll.
result: pending

### 12. Legal / policies page @ 1920 (wide desktop)
Recipe: same as test 9.
expected: Legal page renders faithfully at 1920px — reading column does not stretch
edge-to-edge, chrome stays contained; no horizontal scroll.
result: pending

### 13. Blog-article page @ 375 (mobile)
Recipe (NO dedicated design comp — verify against ART-03/ART-04 intent): `announcement-bar`,
`site-header`, `blog-hero` article-header variant (optional date), `article-body` (post
body), `footer`.
expected: Blog-article renders faithfully at 375px — article-header shows title/optional
date, post body (richtext, including any embedded images) is single-column and readable;
no horizontal scroll.
result: pending

### 14. Blog-article page @ 768 (tablet)
Recipe: same as test 13.
expected: Blog-article renders faithfully at 768px — post body respects the reading-width
container, embedded media scales within the column; no horizontal scroll.
result: pending

### 15. Blog-article page @ 1280 (desktop)
Recipe: same as test 13.
expected: Blog-article renders faithfully at 1280px — centered reading column, article-header
variant with optional date; no horizontal scroll.
result: pending

### 16. Blog-article page @ 1920 (wide desktop)
Recipe: same as test 13.
expected: Blog-article renders faithfully at 1920px — reading column does not stretch
edge-to-edge, chrome stays contained; no horizontal scroll.
result: pending

### 17. Manual XSS paste on the published article-body (D-03 manual half, QA-06 SC4)
Target: the `article-body` richtext on the **Blog-article** page (test 13's page).
Steps:
1. In the customizer, edit the `article-body` richtext and paste hostile payloads,
   e.g. `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` (optionally also
   `<a href="javascript:alert(1)">x</a>` and `<svg onload=alert(1)>`).
2. Save and open the **PUBLISHED** render of the Blog-article page.
expected: On the published render, NO alert fires and NO script executes — the hostile
markup is stripped/neutralized by the single DOMPurify sink (`src/lib/rich-text.tsx`).
The `<script>` is removed, the `onerror`/`onload` handlers are stripped, and any
`javascript:` href is neutralized. This is the human-verified half of D-03 (the automated
jsdom vector suite is `test/richtext-xss.test.tsx`, plan 10-02).
result: pending

## Summary

total: 17
passed: 0
issues: 0
pending: 17
skipped: 0
blocked: 0

## Gaps

- **CTA stand-in substitution (RESEARCH A1 — confirm at UAT):** the Nosotros
  "¿Listo para enviar?" CTA is verified using the registered `descarga-app` section (the
  yellow app-download band), **NOT** `promo-banner`. `promo-banner` is a DEPRECATED block
  that lives only in `servicios.localBlocks`, is absent from every `blocks` array, and
  therefore cannot be added to a new page in the customizer. Record whether `descarga-app`
  is a faithful-enough stand-in; if not, this rolls into the deferred `NosotrosCTA` item below.
- **Deferred — `NosotrosCTA` yellow "¿Listo para enviar?" banner** (carried from Phase 9,
  D-05): NOT built this phase. If `descarga-app` is not faithful enough at UAT, build a
  bespoke CTA section in a future phase. Does not block Phase 10.
- **Deferred — bespoke "Dónde estamos" branches section** (carried from Phase 9, D-05):
  composed here from the existing registered `sucursales` / `direccion-cards` sections; a
  dedicated branches section is a future-phase option only if fidelity requires it. Does not
  block Phase 10.
- **No design comp for Legal & Blog-article pages** (VERIFIED absent): these two pages have
  no dedicated page-composition design source and are verified against the ART-03/ART-04
  intent (`blog-hero` article-header variant + `article-body` richtext), not a pixel reference.
- **Any real coordinate/hex/overflow violation surfaced during UAT** that is larger than a
  quick fix: capture as a deferred follow-up rather than expanding this hardening phase.
