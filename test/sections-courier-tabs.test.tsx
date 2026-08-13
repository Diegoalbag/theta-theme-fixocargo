import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  COURIER_TABS,
  COURIER_TAB_OPTIONS,
  resolveCourierTab,
} from "@/lib/courier-tabs";
import { RateRow, rateRowSettingsSchema } from "@/blocks/RateRow";
import {
  CourierTabs,
  courierTabsSettingsSchema,
} from "@/sections/CourierTabs";

const countMatches = (html: string, needle: string): number =>
  html.split(needle).length - 1;

// Behavioral contract for the Phase 11 courier-tabs tracer slice (CUR-01/02/03).
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert only on the returned HTML string. These
// prove the components render without crashing and emit the exact routing tags
// that the scoped `.courier-tabs` CSS block in src/index.css matches on — the
// registry-driven empty-state matrix pins the census; this file locks the
// per-component behavior that the matrix cannot express.

describe("resolveCourierTab", () => {
  it("returns a recognized tab key unchanged", () => {
    expect(resolveCourierTab("europa")).toBe("europa");
    expect(resolveCourierTab("estados-unidos")).toBe("estados-unidos");
    expect(resolveCourierTab("china")).toBe("china");
    expect(resolveCourierTab("exportacion")).toBe("exportacion");
  });

  it("degrades an arbitrary/attacker-controlled value to estados-unidos (T-11-01)", () => {
    expect(resolveCourierTab("'; drop--")).toBe("estados-unidos");
    expect(resolveCourierTab('" ]')).toBe("estados-unidos");
    expect(resolveCourierTab("")).toBe("estados-unidos");
  });

  it("degrades undefined to estados-unidos", () => {
    expect(resolveCourierTab(undefined)).toBe("estados-unidos");
    expect(resolveCourierTab()).toBe("estados-unidos");
  });

  it("exposes exactly 4 keys and 4 matching select options in the same order", () => {
    expect(COURIER_TABS.length).toBe(4);
    expect([...COURIER_TABS]).toEqual([
      "estados-unidos",
      "europa",
      "china",
      "exportacion",
    ]);
    expect(COURIER_TAB_OPTIONS.length).toBe(4);
    expect(COURIER_TAB_OPTIONS.map((o) => o.value)).toEqual([...COURIER_TABS]);
    COURIER_TAB_OPTIONS.forEach((o) => {
      expect(typeof o.label).toBe("string");
      expect(o.label.length).toBeGreaterThan(0);
    });
  });
});

describe("RateRow", () => {
  it("renders with no props at all and emits the default routing tag", () => {
    const html = renderToStaticMarkup(<RateRow />);
    expect(html).toContain('data-courier-row="estados-unidos"');
  });

  it("emits the routing tag for every recognized tab key", () => {
    COURIER_TABS.forEach((key) => {
      const html = renderToStaticMarkup(<RateRow tab={key} />);
      expect(html).toContain(`data-courier-row="${key}"`);
    });
  });

  it("renders both the weight and rate text values", () => {
    const html = renderToStaticMarkup(
      <RateRow tab="china" weight="1 lb" rate="US$ 5" />,
    );
    expect(html).toContain('data-courier-row="china"');
    expect(html).toContain("1 lb");
    expect(html).toContain("US$ 5");
  });

  it("degrades an unknown tab to estados-unidos — never empty, absent or verbatim", () => {
    const html = renderToStaticMarkup(<RateRow tab="not-a-tab" />);
    expect(html).toContain('data-courier-row="estados-unidos"');
    expect(html).not.toContain("not-a-tab");
    expect(html).not.toContain('data-courier-row=""');
  });

  it("never writes an attacker-controlled tab value into the DOM (T-11-01)", () => {
    const html = renderToStaticMarkup(<RateRow tab='" ]:has(' />);
    expect(html).toContain('data-courier-row="estados-unidos"');
    expect(html).not.toContain(":has(");
  });

  it("omits an empty weight or rate rather than rendering a blank cell", () => {
    const html = renderToStaticMarkup(<RateRow tab="europa" />);
    expect(html).not.toContain("<span");
  });

  it("exposes exactly 3 editable fields with the expected ids", () => {
    expect(rateRowSettingsSchema.length).toBe(3);
    expect(rateRowSettingsSchema.map((s) => s.id)).toEqual([
      "tab",
      "weight",
      "rate",
    ]);
  });

  it("declares `tab` as a curated 4-option select matching COURIER_TABS", () => {
    const tabSetting = rateRowSettingsSchema.find((s) => s.id === "tab");
    expect(tabSetting).toBeDefined();
    expect(tabSetting?.type).toBe("select");
    expect(tabSetting?.default).toBe("estados-unidos");
    expect(tabSetting?.options?.length).toBe(4);
    expect(tabSetting?.options?.map((o) => o.value)).toEqual([...COURIER_TABS]);
  });

  it("keeps weight/rate defaults empty — tarifa values are customizer content", () => {
    const weight = rateRowSettingsSchema.find((s) => s.id === "weight");
    const rate = rateRowSettingsSchema.find((s) => s.id === "rate");
    expect(weight?.type).toBe("text");
    expect(weight?.default).toBe("");
    expect(rate?.type).toBe("text");
    expect(rate?.default).toBe("");
  });
});

describe("CourierTabs", () => {
  it("renders all four default tab labels", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(html).toContain("Estados Unidos");
    expect(html).toContain("Europa");
    expect(html).toContain("China");
    expect(html).toContain("Exportación a EE.UU.");
  });

  // WR-01. A cleared panel title is the only text field in this section that
  // may NOT render empty: it is the accessible name of both the sr-only radio
  // (<label htmlFor>) and the role="region" panel (aria-label). Empty means an
  // unnamed control and an unnamed landmark, plus a visibly blank pill.
  it("falls back to the canonical panel name when a tab title is cleared (WR-01)", () => {
    const html = renderToStaticMarkup(
      <CourierTabs tab1Label="" tab2Label="" tab3Label="" tab4Label="" />,
    );
    COURIER_TAB_OPTIONS.forEach((option) => {
      expect(html).toContain(`aria-label="${option.label}"`);
    });
    // No empty accessible name anywhere in the strip or the panels.
    expect(html).not.toContain('aria-label=""');
    expect(html).not.toMatch(/<label[^>]*><\/label>/);
  });

  it("still prefers a merchant-supplied tab title over the fallback", () => {
    const html = renderToStaticMarkup(<CourierTabs tab3Label="Asia" />);
    expect(html).toContain('aria-label="Asia"');
    expect(html).not.toContain('aria-label="China"');
  });

  it("emits exactly 4 tab inputs and 4 panels keyed by COURIER_TABS", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(countMatches(html, "data-courier-input=")).toBe(4);
    expect(countMatches(html, "data-courier-panel=")).toBe(4);
    COURIER_TABS.forEach((key) => {
      expect(html).toContain(`data-courier-input="${key}"`);
      expect(html).toContain(`data-courier-panel="${key}"`);
    });
  });

  it("pre-selects exactly one tab", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(countMatches(html, 'checked=""')).toBe(1);
  });

  it("keeps every radio sr-only (focusable) and never `hidden`", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(countMatches(html, 'class="sr-only"')).toBe(4);
    expect(html).not.toContain('type="radio" hidden');
    expect(html).not.toContain("hidden=");
  });

  it("scopes the radio group per instance so two sections cannot blank each other", () => {
    const html = renderToStaticMarkup(
      <>
        <CourierTabs />
        <CourierTabs />
      </>,
    );
    const names = [...html.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
    expect(names.length).toBe(8);
    expect(new Set(names).size).toBe(2);
  });

  it("renders NOTHING for a blank panel body — never the sink's placeholder", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(html).not.toContain("Sin contenido");
    expect(html).not.toContain("article-body");
  });

  it("renders a filled panel body through the RichText sink", () => {
    const html = renderToStaticMarkup(<CourierTabs tab1Body="<p>Hola</p>" />);
    expect(html).toContain("Hola");
    expect(html).toContain("article-body");
    expect(html).not.toContain("Sin contenido");
  });

  it("shows the EmptyState marker when it has zero rate-row blocks", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(html).toContain("Sin elementos");
  });

  it("renders the rate-row blocks it is given inside the courier-rates slot", () => {
    const html = renderToStaticMarkup(
      <CourierTabs
        renderBlocks={() => [
          <RateRow key="a" tab="europa" weight="1 lb" rate="US$ 5" />,
        ]}
      />,
    );
    expect(html).toContain("courier-rates");
    expect(html).toContain('data-courier-row="europa"');
    expect(html).not.toContain("Sin elementos");
  });

  it("announces one radiogroup and never the JS-only WAI-ARIA tab roles", () => {
    const html = renderToStaticMarkup(<CourierTabs />);
    expect(countMatches(html, 'role="radiogroup"')).toBe(1);
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('role="tablist"');
  });

  it("exposes exactly 10 editable fields with the expected ids", () => {
    expect(courierTabsSettingsSchema.length).toBe(10);
    expect(courierTabsSettingsSchema.map((s) => s.id)).toEqual([
      "eyebrow",
      "heading",
      "tab1Label",
      "tab1Body",
      "tab2Label",
      "tab2Body",
      "tab3Label",
      "tab3Body",
      "tab4Label",
      "tab4Body",
    ]);
  });

  it("declares every panel body as richtext with an empty default", () => {
    const bodies = courierTabsSettingsSchema.filter((s) =>
      /^tab\d+Body$/.test(s.id),
    );
    expect(bodies.length).toBe(4);
    bodies.forEach((entry) => {
      expect(entry.type).toBe("richtext");
      expect(entry.default).toBe("");
    });
  });
});

describe("courier-tabs scoped CSS (src/index.css)", () => {
  const css = readFileSync(
    resolve(process.cwd(), "src/index.css"),
    "utf8",
  );

  it("ships a .courier-tabs rule block covering all four tab keys", () => {
    expect(css).toContain(".courier-tabs");
    COURIER_TABS.forEach((key) => {
      expect(css).toContain(`[data-courier-input="${key}"]:checked`);
      expect(css).toContain(`[data-courier-panel]:not([data-courier-panel="${key}"])`);
      expect(css).toContain(`[data-courier-row]:not([data-courier-row="${key}"])`);
    });
  });

  it("collapses the customizer per-block wrapper once per tab", () => {
    expect(countMatches(css, "*:has(> [data-courier-row])")).toBe(4);
  });

  // CR-01 safety property. The wrapper-collapse selector MUST be written in the
  // contains-NO-match form. The earlier contains-A-non-match form
  // (`*:has(> [data-courier-row]:not([data-courier-row="KEY"]))`) fires on any
  // element holding at least one non-matching row, so a container holding rows
  // for several tabs — the host's `display: contents` slot wrapper, or any
  // future grouping element — would be hidden together with the selected tab's
  // rows inside it. Pin the guard itself, not just the selector's shape: no unit
  // test in this repo evaluates CSS, so this string is the only automated sensor
  // standing between that regression and a published preview.
  it("guards the wrapper-collapse rule so it can never hide a container holding the selected tab's rows", () => {
    COURIER_TABS.forEach((key) => {
      expect(css).toContain(
        `*:has(> [data-courier-row]):not(:has(> [data-courier-row="${key}"]))`,
      );
    });
    // The unbounded form must never come back.
    expect(css).not.toContain("*:has(> [data-courier-row]:not(");
  });

  it("drives the visible label from the sr-only radio via the sibling combinator", () => {
    expect(css).toContain(".courier-tabs [data-courier-input]:checked + label");
    expect(css).toContain(
      ".courier-tabs [data-courier-input]:focus-visible + label",
    );
  });
});
