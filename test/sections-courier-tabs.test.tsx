import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  COURIER_TABS,
  COURIER_TAB_OPTIONS,
  resolveCourierTab,
} from "@/lib/courier-tabs";
import { RateRow, rateRowSettingsSchema } from "@/blocks/RateRow";

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
