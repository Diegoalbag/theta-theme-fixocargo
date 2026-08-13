import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { RateCard, rateCardSettingsSchema } from "@/blocks/RateCard";
import {
  CargaAereaRates,
  cargaAereaRatesSettingsSchema,
} from "@/sections/CargaAereaRates";

// Behavioral contract for RAT-01 (plan 11-03) — the Carga Aérea rate
// presentation: a `carga-aerea-rates` content section hosting merchant-editable
// `rate-card` blocks. The vitest environment is `node` (no global document), so
// we render DOM-free with renderToStaticMarkup and assert only on the returned
// HTML string.
//
// This file is deliberately SEPARATE from test/sections-courier-tabs.test.tsx
// so the tracer slice (11-01) and this expansion plan never contend for the
// same test file.

describe("RateCard", () => {
  it("renders without throwing and emits non-empty markup with no props", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<RateCard />);
    }).not.toThrow();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders all four values when every field is filled", () => {
    const html = renderToStaticMarkup(
      <RateCard
        route="Miami — Santo Domingo"
        perKg="US$ 2.50 / kg"
        localCharges="US$ 75"
        breakdown="AWB US$ 45 + THC US$ 30"
      />,
    );
    expect(html).toContain("Miami — Santo Domingo");
    expect(html).toContain("US$ 2.50 / kg");
    expect(html).toContain("US$ 75");
    expect(html).toContain("AWB US$ 45 + THC US$ 30");
  });

  it("renders the per-kg qualifier note as its own independently clearable field", () => {
    const withNote = renderToStaticMarkup(
      <RateCard perKg="US$ 2.50 / kg" perKgNote="mín. 100 kg" />,
    );
    expect(withNote).toContain("US$ 2.50 / kg");
    expect(withNote).toContain("mín. 100 kg");

    const withoutNote = renderToStaticMarkup(<RateCard perKg="US$ 2.50 / kg" />);
    expect(withoutNote).toContain("US$ 2.50 / kg");
    expect(withoutNote).not.toContain("mín. 100 kg");
  });

  it("renders the breakdown sub-line inside an <em> element", () => {
    const html = renderToStaticMarkup(
      <RateCard localCharges="US$ 75" breakdown="AWB US$ 45 + THC US$ 30" />,
    );
    expect(html).toContain("<em");
    // The breakdown is visually subordinate to the local-charges line: it is
    // rendered AFTER it in document order.
    expect(html.indexOf("US$ 75")).toBeLessThan(
      html.indexOf("AWB US$ 45 + THC US$ 30"),
    );
  });

  it("routes the breakdown through plain JSX, never a second HTML sink", () => {
    const html = renderToStaticMarkup(
      <RateCard breakdown="<script>alert(1)</script>" />,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders only the filled field and no orphaned label or separator", () => {
    const html = renderToStaticMarkup(<RateCard route="Ruta" />);
    expect(html).toContain("Ruta");
    // No per-kg line, no local-charges line, no breakdown sub-line.
    expect(html).not.toContain("<p");
    expect(html).not.toContain("<em");
    expect(html).not.toContain("<span");
  });

  // WR-04. Guarding only the fields still left the ROOT painting an empty
  // p-8 rounded-2xl bg-card shadow panel for a freshly added card. The root
  // element must stay (the empty-state matrix requires non-empty markup with
  // blank props, and the customizer anchors its per-block wrapper to it); only
  // its chrome may go.
  it("drops its own chrome when every field is blank (WR-04)", () => {
    const html = renderToStaticMarkup(<RateCard />);
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toContain("p-8");
    expect(html).not.toContain("rounded-2xl");
    expect(html).not.toContain("shadow");
    expect(html).not.toContain("bg-card");
  });

  it("keeps its chrome as soon as any single field is filled (WR-04)", () => {
    (
      [
        { route: "Ruta" },
        { perKg: "US$ 2.50 / kg" },
        { perKgNote: "mín. 100 kg" },
        { localCharges: "US$ 75" },
        { breakdown: "AWB US$ 45" },
      ] as const
    ).forEach((props) => {
      const html = renderToStaticMarkup(<RateCard {...props} />);
      expect(html).toContain("p-8");
      expect(html).toContain("rounded-2xl");
      expect(html).toContain("shadow");
    });
  });

  it("stretches to full grid-item height (customizer wrapper safety)", () => {
    const html = renderToStaticMarkup(<RateCard route="Ruta" />);
    expect(html).toContain("h-full");
  });

  it("exposes exactly 5 editable fields with the agreed ids", () => {
    expect(rateCardSettingsSchema).toHaveLength(5);
    expect(rateCardSettingsSchema.map((s) => s.id)).toEqual([
      "route",
      "perKg",
      "perKgNote",
      "localCharges",
      "breakdown",
    ]);
  });

  it("hard-codes no tarifa content as a schema default", () => {
    for (const setting of rateCardSettingsSchema) {
      expect(setting.default).toBe("");
    }
  });
});

describe("CargaAereaRates", () => {
  it("renders its default eyebrow and heading", () => {
    const html = renderToStaticMarkup(<CargaAereaRates />);
    expect(html).toContain("Carga Aérea");
    expect(html).toContain("Tarifas por ruta");
  });

  it("renders merchant-supplied eyebrow and heading over the defaults", () => {
    const html = renderToStaticMarkup(
      <CargaAereaRates eyebrow="Tarifas" heading="Rutas disponibles" />,
    );
    expect(html).toContain("Tarifas");
    expect(html).toContain("Rutas disponibles");
    expect(html).not.toContain("Tarifas por ruta");
  });

  it("shows the EmptyState marker with zero rate cards (never a blank gap)", () => {
    const html = renderToStaticMarkup(<CargaAereaRates />);
    expect(html).toContain("Sin elementos");
  });

  it("shows the EmptyState marker when renderBlocks returns an empty array", () => {
    const html = renderToStaticMarkup(<CargaAereaRates renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders its child blocks and drops the EmptyState marker", () => {
    const html = renderToStaticMarkup(
      <CargaAereaRates renderBlocks={() => [<div key="a">CARD</div>]} />,
    );
    expect(html).toContain("CARD");
    expect(html).not.toContain("Sin elementos");
  });

  it("lays the cards out as a responsive grid on the wrapper, never the slot", () => {
    const html = renderToStaticMarkup(
      <CargaAereaRates renderBlocks={() => [<div key="a">CARD</div>]} />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("exposes exactly 2 editable fields with the agreed ids", () => {
    expect(cargaAereaRatesSettingsSchema).toHaveLength(2);
    expect(cargaAereaRatesSettingsSchema.map((s) => s.id)).toEqual([
      "eyebrow",
      "heading",
    ]);
  });
});
