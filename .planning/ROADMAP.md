# Roadmap: FixoCargo Theme

## Overview

FixoCargo reproduces a courier/logistics homepage as 12 responsive, content-editable Theta sections backed by ~13 child block types, built inside the locked `theta-theme-starter` five-map registry contract. The journey is a hard dependency chain followed by mostly parallel section work: first a Foundation phase renames the theme, strips starter examples, lays down brand tokens/fonts, builds the shared UI primitives, codifies responsive + accessibility + registry conventions, and ships the two shared global blocks (`social-link`, `store-badge`) — preventing every conversion pitfall once instead of twelve times. Site Chrome then frames the page and exercises both shared blocks early (so `store-badge` exists before DescargaApp needs it). Three content clusters (Above-the-Fold, Services & App, Info Sections) each deliver working, editable sections end-to-end. A final Hardening phase audits empty-state resilience and responsive fidelity across all twelve sections. Every phase ships sections that render and are editable in the customizer — vertical slices, never horizontal layers.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Rename to fixocargo, brand tokens/fonts, UI primitives, conventions, shared blocks (completed 2026-06-23)
- [ ] **Phase 2: Site Chrome** - AnnouncementBar, SiteHeader, Footer (exercise shared social-link + store-badge)
- [ ] **Phase 3: Above-the-Fold** - Hero, DireccionCards, ToolsBar
- [ ] **Phase 4: Services & App** - Servicios, Beneficios, DescargaApp
- [ ] **Phase 5: Info Sections** - Sucursales, EnviosNacionales, Blogs
- [ ] **Phase 6: Hardening** - Cross-section empty-state and responsive-fidelity audit

## Phase Details

### Phase 1: Foundation

**Goal**: The theme is rebranded to fixocargo with brand tokens, fonts, shared UI primitives, codified conventions, and the two shared global blocks in place — everything later phases depend on exists and the build is green.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, QA-03, QA-04
**Success Criteria** (what must be TRUE):

  1. `yarn build` and `yarn test:contract` pass with the bundle registering under `fixocargo`, starter examples (Hero/Feature/ExampleRef) removed from `src/` and all five registry maps
  2. Brand colors (navy `#121c31`, yellow `#ffd600`/`#f6c016`) and the four fonts render via `:root` CSS variables + Tailwind `@theme` tokens with `font-display: swap` and fallback stacks — no hex literals in components, font licensing confirmed or compliant substitutes wired through the same tokens
  3. Editor can add a `social-link` block (curated `network` select → Lucide glyph, no free upload) and a `store-badge` block (`store` select + `url`); both are reusable global `@theme` blocks and render responsively in the customizer
  4. Shared UI primitives (PillButton, Card, SectionHeading, IconChip) exist in `src/components/ui/`, consume tokens, and are importable (never registered)
  5. A demonstration section renders empty/blank settings with sensible placeholders (no crash, no blank gap) and uses the centered max-width container — proving the responsive/a11y/empty-state conventions

**Plans**: 5/5 plans complete
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton: rename to fixocargo, brand color/font tokens, inline-SVG brand icons, shared social-link + store-badge blocks, atomic registry swap (examples out, _demo in)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — UI primitives (PillButton/Card/SectionHeading/IconChip) + shared empty-state and image-guard helpers

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — _demo full convention sweep + live customizer human-verify (success criterion #5)

**Gap closure** *(UAT Test 2 — zero-blocks blank gap, major)*

- [x] 01-04-PLAN.md — Shared BlocksSlot helper (environment-independent zero-blocks → EmptyState convention, replaces the defeated React.Children.count guard) + higher-contrast ImageGuard placeholder

**Gap closure 2** *(UAT Test 2 re-test — customizer zero-blocks BLOCK affordance still blank, major)*

- [x] 01-05-PLAN.md — BlocksSlot as-is branch owns a visible dashed drop affordance (min-height floor + absolute aria-hidden token-only placeholder beneath the live slot) so the customizer-zero state is no longer a blank gap; folds in code-review WR-01 (empty default parameter)

**UI hint**: yes

### Phase 2: Site Chrome

**Goal**: The page frame is editable — merchants can manage the announcement bar, header navigation, and footer, and the shared-block path (`social-link`, `store-badge`) is validated end-to-end before content sections pile on.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CHR-01, CHR-02, CHR-03
**Success Criteria** (what must be TRUE):

  1. Editor can edit AnnouncementBar `locationLabel`/`changeLabel`/`followLabel` and add/remove/reorder `social-link` child blocks; it renders responsively in the customizer
  2. Editor can edit SiteHeader `logo`/`accountLabel`/`accountUrl` and add/remove/reorder `nav-link` (local) child blocks (`label`/`url`/`hasCaret`); it renders responsively
  3. Editor can edit Footer `logo`/`copyright`/terms & privacy labels+urls, add `footer-column` blocks (flattened fixed link slots, no nested blocks), and add shared `social-link` + `store-badge` blocks; it renders responsively
  4. All three chrome sections register cleanly across the five maps with sensible `maxBlocks` and the contract test stays green

**Plans**: 4 plans
Plans:
- [ ] 02-01-PLAN.md — AnnouncementBar section + render-smoke test + atomic _demo removal from registry
- [ ] 02-02-PLAN.md — SiteHeader section + NavLink local block (CSS-only hamburger via details/summary)
- [ ] 02-03-PLAN.md — Footer section + FooterColumn local block + complete registry finalization
- [ ] 02-04-PLAN.md — Human-verify checkpoint: responsive fidelity + block editing in the customizer

**UI hint**: yes

### Phase 3: Above-the-Fold

**Goal**: The top of the homepage is editable — merchants can manage hero slides, the receiving-address cards, and the action tool pills, each rendering responsively in the customizer.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ATF-01, ATF-02, ATF-03
**Success Criteria** (what must be TRUE):

  1. Editor can add/remove/reorder `hero-slide` blocks (`backgroundImage`/`heading`/`subtitle`/`ctaLabel`/`ctaUrl`); Hero renders responsively with a dark overlay and static (non-autoplay) arrows/dots
  2. Editor can add/remove/reorder `address-card` blocks (`title`/`recipientLine`/`address`/`phone`) in DireccionCards, each rendering a copy button, responsively
  3. Editor can add/remove/reorder `tool-pill` blocks (`label`/`url`/`icon` curated select) in ToolsBar; it renders responsively
  4. Each section handles the zero-child-block and unset-image states with placeholders (no crash, no blank gap)

**Plans**: TBD
**UI hint**: yes

### Phase 4: Services & App

**Goal**: The services and app-download band is editable — merchants can manage service items and promo banners, benefit cards on the dark section, and the app-download section with store badges, all rendering responsively.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2 (shared `store-badge` block)
**Requirements**: SVC-01, SVC-02, SVC-03
**Success Criteria** (what must be TRUE):

  1. Editor can edit Servicios `heading`/`subtitle` and add `service-item` blocks (`title`/`icon`/`body`/`linkUrl`/`isExpanded`) plus `promo-banner` blocks (`backgroundImage`/`kicker`/`headline`/`ctaLabel`/`ctaUrl`); it renders responsively
  2. Editor can edit Beneficios `heading`/`subtitle`/`ctaLabel`/`ctaUrl` and add/remove/reorder `benefit-card` blocks (`icon`/`title`/`body`/`linkUrl`) on the navy dark background; it renders responsively
  3. Editor can edit DescargaApp `backgroundImage`/`heading`/`body`/`phoneImage1`/`phoneImage2` and add shared `store-badge` child blocks; it renders responsively
  4. Curated icon selects on `service-item` and `benefit-card` map to Lucide glyphs (no free upload), and empty/zero-block states render placeholders

**Plans**: TBD
**UI hint**: yes

### Phase 5: Info Sections

**Goal**: The lower-page information sections are editable — merchants can manage branches, national-shipping FAQs, and blog cards, each rendering responsively in the customizer.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: INF-01, INF-02, INF-03
**Success Criteria** (what must be TRUE):

  1. Editor can edit Sucursales `heading`/`subtitle`/`mapImage` and add/remove/reorder `branch` blocks (`name`/`phone`/`email`/`mapUrl`); the search field renders as decorative and the section is responsive
  2. Editor can edit EnviosNacionales `kicker`/`heading`/`body`/`ctaLabel`/`ctaUrl` and add/remove/reorder `faq-pill` blocks on the navy dark background; it renders responsively
  3. Editor can edit Blogs `heading`/`subtitle`/`ctaLabel`/`ctaUrl` and add/remove/reorder `blog-card` blocks (`image`/`tagPrimary`/`date`/`title`/`excerpt`/`linkUrl`); it renders responsively
  4. Each section handles the zero-child-block and unset-image states with placeholders, and registers cleanly across the five maps

**Plans**: TBD
**UI hint**: yes

### Phase 6: Hardening

**Goal**: Every section and block is verified resilient and faithful — the full theme handles empty/blank states without crashing and matches the FixoCargo visual design across mobile, tablet, and desktop.
**Mode:** mvp
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5
**Requirements**: QA-01, QA-02
**Success Criteria** (what must be TRUE):

  1. Every section and block, tested empty AND populated, renders sensible placeholders for blank settings and the zero-child-block state — no crashes, no blank gaps
  2. All 12 sections render faithfully to the FixoCargo design at mobile, tablet, and desktop breakpoints with no absolute 1920px coordinates or horizontal overflow
  3. `yarn build` and `yarn test:contract` pass green with the complete registry (all sections + blocks, keys consistent across all five maps)

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete    | 2026-06-23 |
| 2. Site Chrome | 0/TBD | Not started | - |
| 3. Above-the-Fold | 0/TBD | Not started | - |
| 4. Services & App | 0/TBD | Not started | - |
| 5. Info Sections | 0/TBD | Not started | - |
| 6. Hardening | 0/TBD | Not started | - |
