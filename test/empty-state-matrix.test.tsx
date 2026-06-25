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
// to appear in these loops (the drift guards pin the 12/13 census).
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

// The EmptyState marker string content sections fall through to at published
// zero (src/lib/empty-state.tsx default heading).
const EMPTY_STATE_MARKER = "Sin elementos";

// Build the FULL block-component census. blocksComponents holds ONLY the two
// shared/global blocks (social-link, store-badge); the other 11 components live
// section-local under sectionBlocksConfig[key].localBlocks[].component. Walking
// blocksComponents alone would cover 2 of 13 — we MUST flatMap localBlocks to
// reach hero-slide, address-card, tool-pill, service-item, promo-banner,
// benefit-card, branch, faq-pill, blog-card, nav-link, footer-column.
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

describe("empty-state matrix — drift guards (census)", () => {
  it("collects exactly 12 sections", () => {
    expect(sectionEntries.length).toBe(12);
  });

  it("collects exactly 13 block components (2 global + 11 section-local)", () => {
    expect(allBlocks.length).toBe(13);
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
