# FixoCargo Theme

## What This Is

A Theta platform theme that reproduces the FixoCargo courier/logistics website design as a set of fully responsive, content-editable sections and blocks. It is built on the `theta-theme-starter` (IIFE bundle, five-map registry) and lets non-technical merchants edit the FixoCargo homepage — headlines, imagery, links, navigation, services, branches, FAQs, and blog cards — through the Theta customizer in `project-theta-fe`.

## Core Value

Every part of the FixoCargo design renders faithfully in the customizer and is editable by a non-technical merchant — repeating content (nav, services, branches, FAQs, blogs) can be added, removed, and reordered as child blocks.

## Requirements

### Validated

<!-- Inferred from existing starter codebase — proven and relied upon. -->

- ✓ Theme registers on `window.__THETA_THEMES__[themeName]` via build-time name injection — existing
- ✓ Five-map registry contract (sections, blocks, settings, block config) — existing
- ✓ IIFE bundle build with externalized React/cva/clsx/twMerge/lucide-react — existing
- ✓ Registration contract test gates the build (`yarn test:contract`) — existing
- ✓ Defensive `metaobject_ref` rendering pattern (string/missing/resolved) — existing

### Active

<!-- FixoCargo theme scope. Hypotheses until shipped. -->

- [ ] Theme renamed to `fixocargo`; starter example components (Hero, Feature, ExampleRef) removed
- [ ] FixoCargo brand design tokens (navy `#121c31`, yellow `#ffd600`/`#f6c016`, fonts Aku Kamu / Gill Sans / Gotham / Open Sans) defined in theme CSS
- [ ] AnnouncementBar section — country selector text + social links (social-link blocks)
- [ ] SiteHeader section — logo, nav menu (nav-link blocks), account button
- [ ] Hero section — background image, headline, subtitle, CTA; carousel slides as hero-slide blocks
- [ ] DireccionCards section — address cards (address-card blocks) with label, address, phone, copy action
- [ ] ToolsBar section — action pills (tool-pill blocks: Rastrea, Calcula, Sucursales)
- [ ] Servicios section — heading, service list (service-item blocks), promo banners (promo-banner blocks)
- [ ] Beneficios section — dark section, heading, CTA, benefit cards (benefit-card blocks)
- [ ] DescargaApp section — headline, copy, app store badges (store-badge blocks), phone images
- [ ] Sucursales section — heading, search field, branch list (branch blocks), map image with popup
- [ ] EnviosNacionales section — dark section, heading, CTA, FAQ pills (faq-pill blocks)
- [ ] Blogs section — heading, CTA, blog cards (blog-card blocks)
- [ ] Footer section — logo, store badges, link columns (footer-column blocks), legal line
- [ ] Every section is fully responsive (mobile / tablet / desktop) matching the visual design
- [ ] Content (text, images, links) editable via settings; brand colors/fonts fixed in CSS
- [ ] All sections + blocks registered and passing the registration contract test

### Out of Scope

- Brand color / font editing in the customizer — kept fixed in theme CSS for visual consistency (Editability decision)
- CMS metaobject-backed content (branches/blogs from Strapi) — using editor child blocks instead; can revisit if merchants need shared data sources
- Live behavior (working carousel autoplay, real tracking/calculator, branch map interactivity, form submission) — sections render the design; dynamic behavior is platform/integration concern
- Internal/non-homepage pages (product, account, blog detail) — this milestone covers the homepage section library
- Backend / API work in `project-theta-fe` or `project-theta-strapi` — this project produces the theme bundle only

## Context

- **Brownfield starter**: Built on `theta-theme-starter`. Full architecture mapped in `.planning/codebase/` (ARCHITECTURE.md, STACK.md, STRUCTURE.md, CONVENTIONS.md, etc.). Stack: React 19, TypeScript 5, Tailwind CSS 4, Vite 7 (IIFE), Vitest 4, Yarn 3.
- **Source design**: `design/*.dc.html` — fixed-width (1920px), absolutely-positioned exports from a design-capture tool (`support.js` / `x-dc` framework). These are visual references to be re-implemented as responsive Tailwind components, NOT shipped as-is. Reference images live in `design/assets/`.
- **Domain**: FixoCargo is an international courier (Dominican Republic base; Miami & Madrid receiving addresses; Spanish-language UI).
- **Repeating content** in the design uses `sc-for` loops — these map directly to Theta child blocks.
- **Consumer**: The Theta customizer at `/Users/diegoalba/Documents/project-theta-fe` renders these sections/blocks; settings `id`s become component props.
- **Contract**: Theme conventions in project `CLAUDE.md` (registry structure, setting types, injected props, `@theme` block wildcard, defensive `metaobject_ref`).

## Constraints

- **Tech stack**: React 19 + TypeScript + Tailwind CSS 4, bundled as a single IIFE — must match starter build; React/cva/clsx/twMerge/lucide-react stay externalized (never bundled).
- **Contract**: Keys must be consistent across all five registry maps; bundle must register under the `package.json` name only (contract test enforces).
- **Component purity**: Sections/blocks are stateless; all data arrives as props from the platform — no `useState`, no local state.
- **Block hierarchy**: Only sections render blocks (via `renderBlocks()`); blocks cannot contain blocks.
- **Editability**: Content-only — text/images/links editable; brand colors and fonts fixed in `src/index.css`.
- **Fidelity**: Responsive implementation should faithfully match the FixoCargo visual design across breakpoints.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Content-only editability (colors/fonts fixed in CSS) | Keeps editor clean and brand consistent; merchants edit copy/images/links, not visual design | — Pending |
| Repeating content as editor child blocks (not CMS metaobjects) | Self-contained, no Strapi dependency; merchants add/remove/reorder items directly | — Pending |
| Fully responsive rebuild (not pixel-match desktop) | Production-ready theme must work on mobile/tablet; design files are desktop-only references | — Pending |
| Replace starter examples & rename theme to `fixocargo` | This is a dedicated FixoCargo theme, not a starter; avoids dead example code | — Pending |
| Re-implement `.dc.html` as responsive Tailwind, not ported as-is | Source files are absolutely-positioned 1920px captures, unsuitable for production | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-23 after initialization*
