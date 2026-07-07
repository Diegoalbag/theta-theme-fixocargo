import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  sectionsComponents,
  blocksComponents,
  sectionBlocksConfig,
} from "@/registry";

// ---------------------------------------------------------------------------
// Registry-driven empty-state regression matrix (QA-01, D-02).
//
// This file is the PERMANENT automated half of the empty-state guarantee: it
// walks the live registry and renders every section (blank props AND the
// explicit zero-child-block state) and every block component (blank props),
// asserting no throw and no blank gap. It supersedes the one-time manual
// empty-state pass — future edits cannot silently reintroduce a crash-on-blank
// or blank-gap bug without turning this suite red.
//
// The vitest environment is `node` (no global document / JSDOM is banned by
// D-01), so we render DOM-free with renderToStaticMarkup and assert only on the
// returned HTML string. Coverage is registry-driven on purpose: components are
// never imported by name here, so any future section/block addition is forced
// to appear in these loops (the drift guards pin the 20/17 census).
// ---------------------------------------------------------------------------

// The three CHROME sections pass `empty={null}` to BlocksSlot, so their
// zero-child-block slot intentionally renders nothing (no "Sin elementos"
// marker). They still paint their surrounding chrome markup, so the no-throw +
// non-empty-string assertions still apply — only the EmptyState marker is
// branched off. Confirmed by grep of `empty={null}` in src/sections this
// session: announcement-bar, site-header, footer.
const CHROME_NULL_EMPTY = new Set<string>([
  "announcement-bar",
  "site-header",
  "footer",
]);

// The two no-block sections (07-04) accept NO child blocks (Pattern 4 — they
// have no sectionBlocksConfig entry), so they NEVER render the default
// EmptyState ("Sin elementos") in the zero-block loop. `article-body` delegates
// its own empty case to RichText's "Sin contenido" placeholder; `blog-hero`
// paints its header/search chrome. They still keep the no-throw + non-empty
// markup assertions above the guard — only the EmptyState-marker assertion is
// exempted, mirroring CHROME_NULL_EMPTY. Do NOT weaken the marker for the
// existing content sections.
const NO_BLOCK_SECTIONS = new Set<string>([
  "article-body",
  "blog-hero",
  // The two Phase 9 About-page content sections (09-01/09-02) accept NO child
  // blocks (Pattern 4 — no sectionBlocksConfig entry). nosotros-hero paints its
  // hero chrome; nosotros-mission delegates its empty case to RichText's "Sin
  // contenido" placeholder. Exempt the EmptyState marker, not the no-throw.
  "nosotros-hero",
  "nosotros-mission",
  // plan-referimiento (quick task 260706-qqi) has no child-block slot at all
  // (Pattern 4 — no sectionBlocksConfig entry): a fixed 2-card, settings-only
  // layout. It never renders the default EmptyState marker.
  "plan-referimiento",
  // servicios-hero and servicios-cta (quick task 260707-etz) have no
  // child-block slot at all (Pattern 4 — no sectionBlocksConfig entry):
  // servicios-hero's 4 icon tiles are fixed decorative JSX, servicios-cta's
  // 2 promo banners are settings-driven via the reused PromoBanner block.
  // Neither ever renders the default EmptyState marker.
  "servicios-hero",
  "servicios-cta",
]);

// The EmptyState marker string content sections fall through to at published
// zero (src/lib/empty-state.tsx default heading).
const EMPTY_STATE_MARKER = "Sin elementos";

// Build the FULL block-component census. blocksComponents now holds FOUR
// shared/global blocks (social-link, store-badge, _blog-card, benefit-card);
// the rest live section-local under sectionBlocksConfig[key].localBlocks[].
// component. Walking blocksComponents alone would miss most of them — we MUST
// flatMap localBlocks to reach hero-slide, address-card, tool-pill,
// service-item, promo-banner, branch, faq-pill, blog-card, nav-link,
// footer-column, stat-item, value-card, timeline-item, faq-item,
// app-feature-item, gift-step, service-card, process-step.
// (promo-banner is DEPRECATED — Servicios no longer OFFERS it and drives the
// right rail via section settings — but its localBlock config is retained for
// back-compat with legacy instances, so it is still in this census.
// blog-card was PROMOTED (08-02) to the private global `_blog-card`, so the
// same component now appears once in blocksComponents (as `_blog-card`) AND
// once section-local in blogs.localBlocks (the deprecated `blog-card`
// back-compat alias) — net +1 block versus the pre-promotion census.
// benefit-card was PROMOTED (quick task 260706-qqi) to the true global
// `benefit-card` (no `_` prefix — it is a normal, freely-offerable content
// block); Beneficios' section-local declaration was removed, so unlike
// blog-card there is no local back-compat alias left for it.)
const localBlockEntries: Array<
  [string, React.ComponentType<Record<string, unknown>>]
> = Object.values(sectionBlocksConfig).flatMap((cfg) =>
  (cfg.localBlocks ?? [])
    .filter((b) => typeof b.component === "function")
    .map(
      (b) =>
        [b.type, b.component] as [
          string,
          React.ComponentType<Record<string, unknown>>,
        ],
    ),
);

const allBlocks: Array<
  [string, React.ComponentType<Record<string, unknown>>]
> = [
  ...Object.entries(blocksComponents).filter(
    ([, Comp]) => typeof Comp === "function",
  ),
  ...localBlockEntries,
];

const sectionEntries = Object.entries(sectionsComponents);

// Census reconciled for Phase 10 (QA-07): Phase 10 is quality hardening and adds
// NO sections/blocks. The 20/17 baseline absorbs every Phase 7–9 addition,
// registry-driven (no per-name imports):
//   Phase 7 sections: article-body, blog-hero (both NO_BLOCK_SECTIONS).
//   Phase 8 section:  blog-list; block: _blog-card (global) + blog-card (legacy
//                     local alias) → both counted in the 17.
//   Phase 9 sections: nosotros-hero, nosotros-mission (both NO_BLOCK_SECTIONS),
//                     nosotros-stats, nosotros-values, nosotros-timeline;
//         blocks:     stat-item, value-card, timeline-item (section-local).
// Quick task 260706-h3w (+1/+1): adds the `faq` content section and its
// section-local `faq-item` accordion block → 21 sections / 18 blocks. `faq` is a
// normal content section (NOT chrome, NOT no-block), so it stays OUT of
// CHROME_NULL_EMPTY and NO_BLOCK_SECTIONS and MUST fall through to the "Sin
// elementos" assertion in the zero-block loop (Faq keeps the default EmptyState).
// Quick task 260706-qqi (+4 sections / +2 net blocks): adds the FixoCargo
// "Beneficios" page — beneficiosGrid, appFeatures, planReferimiento,
// listaRegalos → 25 sections. beneficios-grid, app-features, and
// lista-regalos are normal content sections (NOT chrome, NOT no-block) and
// fall through to the "Sin elementos" assertion; plan-referimiento has no
// child-block slot at all and is added to NO_BLOCK_SECTIONS. On the block
// side, `benefit-card` is PROMOTED from section-local (beneficios) to a true
// global (blocksComponents now holds 4: social-link, store-badge,
// _blog-card, benefit-card) — Beneficios' own local declaration is removed
// (-1 local), while app-feature-item and gift-step are added as new
// section-local blocks (+2 local) → net local 15-1+2=16, plus the 4 global =
// 20 total blocks.
// Quick task 260707-etz (+4 sections / +2 local blocks): adds the FixoCargo
// "Servicios" page bundle — servicios-hero, servicios-list, proceso-envio,
// servicios-cta → 29 sections. servicios-list and proceso-envio are normal
// content sections (NOT chrome, NOT no-block) and fall through to the "Sin
// elementos" assertion; servicios-hero and servicios-cta have no
// child-block slot at all and are added to NO_BLOCK_SECTIONS. On the block
// side, service-card (servicios-list) and process-step (proceso-envio) are
// new section-local-only blocks (never promoted to the global maps) → net
// local 16+2=18, plus the 4 global = 22 total blocks.
//
// If the live registry ever diverges from 29/22, reconcile these guards to the
// TRUE count with a comment — never delete a guard, never weaken a loop.
describe("empty-state matrix — drift guards (census)", () => {
  it("collects exactly 29 sections", () => {
    expect(sectionEntries.length).toBe(29);
  });

  it("collects exactly 22 block components (4 global + 18 section-local)", () => {
    expect(allBlocks.length).toBe(22);
  });
});

describe("empty-state matrix — sections render blank props (totality)", () => {
  it.each(sectionEntries)(
    "section %s renders without throwing and emits non-empty markup with blank props",
    (_key, Section) => {
      let html = "";
      expect(() => {
        html = renderToStaticMarkup(<Section />);
      }).not.toThrow();
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(0);
    },
  );
});

describe("empty-state matrix — sections render the zero-child-block state (no blank gap)", () => {
  it.each(sectionEntries)(
    "section %s renders the zero-block state without a blank gap",
    (key, Section) => {
      let html = "";
      expect(() => {
        html = renderToStaticMarkup(<Section renderBlocks={() => []} />);
      }).not.toThrow();
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(0);
      if (CHROME_NULL_EMPTY.has(key)) {
        // Chrome sections pass empty={null}: the slot renders nothing, but the
        // surrounding chrome markup is still painted (asserted above). Do NOT
        // require the EmptyState marker.
        return;
      }
      if (NO_BLOCK_SECTIONS.has(key)) {
        // No-block sections (article-body, blog-hero) have no child-block slot,
        // so there is no zero-block EmptyState to assert — they paint their own
        // content/chrome (asserted above) and delegate any empty case elsewhere
        // (RichText's "Sin contenido"). Exempt the marker, not the no-throw.
        return;
      }
      // Content sections fall through to the default EmptyState ("Sin
      // elementos") — proving no blank gap at published zero.
      expect(html).toContain(EMPTY_STATE_MARKER);
    },
  );
});

describe("empty-state matrix — block components render blank props (totality)", () => {
  it.each(allBlocks)(
    "block %s renders without throwing and emits non-empty markup with blank props",
    (_key, Block) => {
      let html = "";
      expect(() => {
        html = renderToStaticMarkup(<Block />);
      }).not.toThrow();
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(0);
    },
  );
});
