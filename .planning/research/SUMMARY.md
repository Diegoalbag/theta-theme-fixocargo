# Project Research Summary

**Project:** FixoCargo Theme
**Domain:** Theta-platform courier/logistics website theme — a section/block library inside the `theta-theme-starter` five-map registry contract
**Researched:** 2026-06-23
**Confidence:** HIGH

## Executive Summary

FixoCargo is a brownfield Theta theme that reproduces a courier/logistics homepage as 12 fully responsive, content-editable sections backed by ~13 child block types. The entire macro-architecture is *already fixed* by the starter (React 19 + TypeScript 5 + Tailwind v4, single IIFE bundle, five-map registry, externalized React/cva/clsx/tw-merge/lucide-react, stateless components, contract test gating the build). Research therefore did not re-litigate the stack — it answered the narrower question of *how to fill the contract well*: which techniques to use for fonts/carousel/responsive/icons, which content to expose as settings vs. fix in CSS, how to organize shared vs. local blocks, and what conversion mistakes to avoid.

The recommended approach is deliberately additive-light and convention-driven. **Add no new runtime dependencies**: fonts are self-hosted `.woff2` registered via Tailwind v4 `@theme` tokens (zero JS), the Hero "carousel" is static slide blocks (autoplay is out of scope and would violate the stateless-component rule), responsive layout uses native Tailwind utilities and `<img>`, and icons come from the already-externalized `lucide-react` plus hand-authored inline SVG. Brand tokens (navy `#121c31`, yellow `#ffd600`/`#f6c016`, the four brand fonts) live once in `src/index.css`; components consume semantic utilities (`bg-primary`, `heading-lg`) and never hardcode hex. Shared UI primitives (PillButton, Card, SectionHeading, IconChip) are built once and imported (never registered) to prevent copy-paste drift. Only `social-link` and `store-badge` are shared global blocks (reused by 2+ sections); every other block is section-local.

The dominant risk is **conversion fidelity, not technology**. The `design/*.dc.html` files are absolutely-positioned 1920px captures; porting their `absolute left/top` coordinates verbatim yields a page that breaks at every other width. The mitigation is a strong foundation phase that establishes responsive/grid conventions, empty-state and `image_picker`-guard helpers, semantic+a11y rules, the brand-token/font layer (with a font-licensing checkpoint for Gill Sans/Gotham/Aku Kamu), purity (no `useState`, no cross-imports), and a registry key-consistency discipline — all enforced per section thereafter. Get the foundation right and the 12 sections become largely parallel, mechanical builds.

## Key Findings

### Recommended Stack

The locked starter stack is unchanged. Within it, the rule that governs every decision is: the theme ships as one IIFE + one stylesheet, so **any non-externalized `import` bundles into every page** — default answer to "add a library?" is no. All four research areas resolve to CSS/native/externalized solutions with **zero new dependencies**.

**Core technologies (additions to the locked starter):**
- Self-hosted `.woff2` + Tailwind v4 `@theme --font-*` tokens — brand fonts, zero JS; design already uses matching `font-display`/`font-gill`/`font-gotham` class names
- Static slide blocks + (optional future) CSS scroll-snap — Hero "carousel" is a layout, not behavior; keeps components stateless
- Tailwind responsive utilities + native `<img loading="lazy">` + CSS `background-image` — responsive rebuild; image optimization is the platform/CDN's job
- `lucide-react` (externalized, free) + inline SVG for brand marks — design SVGs use Lucide's 24×24 `currentColor` grid, so most map 1:1

### Expected Features

The feature set is the editable-settings landscape for each section/block, derived directly from the 13 design files and the `CLAUDE.md` setting-type contract.

**Must have (table stakes):**
- All visible copy editable (`text`/`textarea`), every CTA a `label`+`url` pair, all imagery via `image_picker` (with `alt`)
- Repeating content as add/remove/reorder child blocks across all 12 sections (~13 block types)
- `footer-column` links *flattened* to fixed link slots (resolves the no-nested-blocks conflict)
- Curated icon `select` enums (social/tool/service/benefit) and shared global `store-badge`

**Should have (competitive):**
- `showX` visibility toggles (arrows, dots, search, account, copy button)
- Hero `overlayOpacity` range, `branch.address`/`contactUrl`, `store-badge.topLabel` overrides

**Defer (v2+):**
- Live behavior (carousel autoplay, real tracking/calculator, map interactivity) — out of scope
- `metaobject_ref`-backed branches/blogs, structured nav dropdowns, `columns` layout selectors
- **Never (anti-features):** color/font pickers, free image upload for icons, `richtext`/`html` for body copy

### Architecture Approach

The starter dictates the architecture; FixoCargo only fills it in. Organize by a clear seam: design tokens in `index.css` → unregistered UI primitives in `components/ui/` → sections (`renderBlocks()` callers, owning static chrome + own settings) → blocks (repeating leaf units, shared `@theme` only if reused by 2+ sections, else inline `localBlocks`) → the five-map registry. Reuse-count is the deciding rule for block placement; only `social-link` and `store-badge` are shared.

**Major components:**
1. Design tokens (`src/index.css`) — brand colors/fonts/helper classes consumed by every section
2. Shared UI primitives (`components/ui/`) — PillButton, Card, SectionHeading, IconChip (imported, never registered)
3. Sections (`src/sections/`) — 12 page-level containers; the only components that call `renderBlocks()`
4. Blocks (`src/blocks/` shared; inline `localBlocks` otherwise) — repeating leaf content
5. Registry (`src/registry.ts`) — five maps with keys that must match across all of them

### Critical Pitfalls

1. **Porting absolute pixel coords** — treat `.dc.html` as visual reference only; rebuild with centered max-width container + responsive grid/flex; no `absolute left/top` or `w-[1920px]` in `src/`
2. **Registry key drift across the five maps** — define each key once as a const, add incrementally, run `yarn test:contract`/`yarn build` after every section/block
3. **Missing empty/placeholder states** — guard every optional element; placeholder for unset `image_picker` (`{id:null,url:null}`); test each component empty AND populated
4. **`image_picker` value-shape mishandling** — destructure defensively, render `<img>` only when `url` truthy, always provide an `alt` fallback
5. **Component state / cross-imports** — no `useState`/`useEffect`; render statically; children only via `renderBlocks()`; never import a block into a section
6. **Font CLS/FOIT/licensing** — self-host subsetted WOFF2 with `font-display: swap` + fallback metrics; confirm Gill Sans/Gotham/Aku Kamu web licenses or ship documented free substitutes (Open Sans is the only unambiguously safe one)

## Implications for Roadmap

The combined research points to a hard foundation-first dependency chain, then mostly parallel section work. This mirrors the ARCHITECTURE build order (A→B→C/D/E) and the PITFALLS phase mapping (foundation establishes conventions enforced per section).

### Phase 1: Foundation — Rename, Tokens, Primitives, Conventions
**Rationale:** Everything depends on it; it is where every critical pitfall is prevented once instead of 12 times.
**Delivers:** Theme renamed to `fixocargo` (via `__THEME_NAME__`), starter examples removed, empty registry passing the contract test; brand color/font tokens + `@font-face` (with `font-display: swap`, fallback metrics, licensing decision) in `index.css`; UI primitives (PillButton, Card, SectionHeading, IconChip); shared helpers for responsive layout, empty-state placeholders, and guarded `image_picker` rendering; codified purity + semantic/a11y + key-consistency conventions.
**Addresses:** Brand tokens, UI primitives (table-stakes enablers).
**Avoids:** Pitfalls 1, 2, 3, 4, 5, 6, 7, 8 — all are designed to be prevented here.

### Phase 2: Chrome + Shared Blocks (AnnouncementBar, SiteHeader, Footer)
**Rationale:** Frames every other section and exercises both shared blocks (`social-link`, `store-badge`) once before content sections pile on; `store-badge` must exist before DescargaApp consumes it.
**Delivers:** Shared `SocialLink` + `StoreBadge` global blocks; AnnouncementBar, SiteHeader (local `nav-link`), Footer (local `footer-column` flattened, shared social-link + store-badge).
**Uses:** lucide-react `select`-driven icons; flattened footer-column link slots.
**Implements:** Registry shared-block (`@theme`) wiring; the no-nested-blocks resolution.

### Phase 3: Above-the-Fold (Hero, DireccionCards, ToolsBar)
**Rationale:** Top of page; each owns independent local blocks; depends only on Phase 1 primitives.
**Delivers:** Hero (static `hero-slide` blocks, arrows/dots decorative), DireccionCards (`address-card`), ToolsBar (`tool-pill`).
**Avoids:** Pitfall 5 (Hero carousel as state) — slides are static blocks.

### Phase 4: Content Sections (Servicios, Beneficios, DescargaApp)
**Rationale:** Depends on Phase 1 primitives and Phase 2's `store-badge` (DescargaApp).
**Delivers:** Servicios (`service-item`, `promo-banner`), Beneficios (`benefit-card`), DescargaApp (shared `store-badge`, phone images).

### Phase 5: Remaining Content (Sucursales, EnviosNacionales, Blogs)
**Rationale:** Mutually independent; depend on Phase 1 only.
**Delivers:** Sucursales (`branch` + map image, decorative search), EnviosNacionales (`faq-pill`), Blogs (`blog-card`).

### Phase Ordering Rationale
- Foundation is a hard prerequisite for everything (tokens → primitives → blocks → sections).
- Chrome precedes content sections so the shared-block path (`social-link`, `store-badge`) is validated early and `store-badge` exists before DescargaApp needs it.
- Phases 3–5 sections each own their local blocks and are mutually independent — candidates for parallelization once 1+2 land.
- This sequencing front-loads all pitfall prevention into Foundation, making later phases mechanical.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** font *licensing* is a business/legal gate (Gill Sans, Gotham, Aku Kamu are not confirmed redistributable as web fonts) — needs a confirm-or-substitute decision, not code research. Font subsetting/fallback-metric tuning may warrant a brief look.

Phases with standard patterns (skip research-phase):
- **Phases 2–5 (all sections/blocks):** well-documented starter patterns; each is a repetition of Foundation conventions against a known design file. Standard build, no research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against locked starter config (externals, `cssCodeSplit:false`, `copyPublicDir:true`) and Tailwind v4 docs; design uses matching class names. Font *licensing* is MEDIUM (legal, not technical). |
| Features | HIGH | Derived directly from the 13 design files + `CLAUDE.md` setting-type contract; no external sources needed. |
| Architecture | HIGH | Internal analysis against authoritative starter source and `.planning/codebase/` docs; shared-block reuse confirmed in design files. |
| Pitfalls | HIGH | Derived from actual design source, starter anti-patterns, the contract, and current font-performance best practice. |

**Overall confidence:** HIGH

### Gaps to Address
- **Font licensing** (MEDIUM): Confirm/obtain web licenses for Aku Kamu, Gill Sans, Gotham before self-hosting binaries. Handle in Phase 1 as a gating decision; if unavailable, wire the metric-compatible fallback stacks (e.g., Montserrat for Gotham) through the same `--font-*` tokens so a later swap is one-file, CSS-only.
- **Exact `image_picker` `srcset`/variant support** (LOW): Only emit `srcset` if the platform supplies variants; otherwise rely on native attributes. Verify during the first image-bearing block.
- **Dropdown submenu affordance** (LOW): SiteHeader caret is decorative for v1; revisit as a structured value only if real flyouts are required.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` — this milestone's research
- `design/*.dc.html` (13 files) — content, `sc-for` loops, font stacks, SVG grid — source of truth
- `CLAUDE.md` — setting types, registry/`@theme` contract, `image_picker`/`metaobject_ref` shapes
- `.planning/PROJECT.md` — scope, constraints, key decisions
- `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONCERNS.md`, `src/index.css`, `src/registry.ts`, `vite.config.ts` — live starter contract
- [Tailwind CSS v4 — font-family](https://tailwindcss.com/docs/font-family)

### Secondary (MEDIUM confidence)
- [web.dev — Best practices for fonts](https://web.dev/articles/font-best-practices); [DebugBear — font layout shift](https://www.debugbear.com/blog/web-font-layout-shift)
- [Aku & Kamu font licensing — CDNFonts](https://www.cdnfonts.com/aku-kamu.font) — donationware, commercial use needs designer permission

### Tertiary (LOW confidence)
- Platform `srcset`/image-variant support — verify during first image-bearing block

---
*Research completed: 2026-06-23*
*Ready for roadmap: yes*
