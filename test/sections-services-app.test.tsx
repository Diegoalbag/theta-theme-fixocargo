import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Servicios, serviciosSettingsSchema } from "@/sections/Servicios";
import { ServiceItem, serviceItemSettingsSchema } from "@/blocks/ServiceItem";
import { PromoBanner, promoBannerSettingsSchema } from "@/blocks/PromoBanner";
import { sectionBlocksConfig } from "@/registry";

// Render-smoke tests for the Phase 4 Servicios-app sections/blocks.
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert on the returned HTML string. These tests
// prove the components render without crashing and emit the correct structure —
// not that they look correct visually. Waves 2-3 (plans 04-02 / 04-03) APPEND
// their own describe blocks to this file.

describe("Servicios", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<Servicios />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading", () => {
    const html = renderToStaticMarkup(<Servicios />);
    expect(html).toContain("Nuestros Servicios");
  });

  it("renders the default EmptyState when zero blocks (D-07)", () => {
    const html = renderToStaticMarkup(<Servicios />);
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside a responsive grid wrapper", () => {
    const html = renderToStaticMarkup(
      <Servicios renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("child");
  });

  it("serviciosSettingsSchema has exactly 2 entries [heading,subtitle]", () => {
    expect(serviciosSettingsSchema).toHaveLength(2);
    const ids = serviciosSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "subtitle"]);
  });
});

describe("ServiceItem", () => {
  it("renders without crash with empty props (default title)", () => {
    const html = renderToStaticMarkup(<ServiceItem />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Envíos Nacionales");
  });

  it("emits a native details element", () => {
    const html = renderToStaticMarkup(<ServiceItem />);
    expect(html).toContain("<details");
  });

  it("emits the open attribute only when isExpanded is true", () => {
    // Match the boolean attribute on the <details> element precisely — a bare
    // "open" substring would collide with the `group-open:` utility class that
    // drives the chevron rotation, so assert on `<details open` / `open=""`.
    const expanded = renderToStaticMarkup(<ServiceItem isExpanded />);
    expect(expanded).toContain("<details");
    expect(/<details[^>]*\sopen(=""|\s|>)/.test(expanded)).toBe(true);

    const collapsed = renderToStaticMarkup(<ServiceItem />);
    expect(/<details[^>]*\sopen(=""|\s|>)/.test(collapsed)).toBe(false);
  });

  it("resolves a known icon to an svg glyph", () => {
    const html = renderToStaticMarkup(<ServiceItem icon="truck" />);
    expect(html).toContain("<svg");
  });

  it("falls back without throwing on an unknown icon value (QA-03)", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<ServiceItem icon="totally-unknown" />);
    }).not.toThrow();
    expect(html).toContain("<svg");
  });

  it("renders a 'Conoce más' link as a real anchor with href", () => {
    const html = renderToStaticMarkup(<ServiceItem linkUrl="/servicio" />);
    expect(html).toContain("Conoce más");
    expect(html).toContain("<a");
    expect(html).toContain('href="/servicio"');
  });

  it("serviceItemSettingsSchema has 5 entries [title,icon,body,linkUrl,isExpanded] with icon as select", () => {
    expect(serviceItemSettingsSchema).toHaveLength(5);
    const ids = serviceItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["title", "icon", "body", "linkUrl", "isExpanded"]);
    const iconSetting = serviceItemSettingsSchema.find((s) => s.id === "icon");
    expect(iconSetting?.type).toBe("select");
    const isExpandedSetting = serviceItemSettingsSchema.find(
      (s) => s.id === "isExpanded",
    );
    expect(isExpandedSetting?.type).toBe("checkbox");
  });
});

describe("PromoBanner", () => {
  it("renders without crash with empty props (default CTA label)", () => {
    const html = renderToStaticMarkup(<PromoBanner />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Haz clic aquí");
  });

  it("renders a navy placeholder and no img when bg is unset", () => {
    const html = renderToStaticMarkup(<PromoBanner />);
    expect(html).toContain("bg-brand-navy");
    expect(html).not.toContain("<img");
  });

  it("renders an object-cover img when bg is set", () => {
    const html = renderToStaticMarkup(
      <PromoBanner backgroundImage={{ id: "x", url: "https://e/x.jpg" }} />,
    );
    expect(html).toContain("<img");
    expect(html).toContain("object-cover");
    expect(html).toContain("https://e/x.jpg");
  });

  it("renders the CTA as a real anchor with href", () => {
    const html = renderToStaticMarkup(<PromoBanner ctaUrl="/promo" />);
    expect(html).toContain("<a");
    expect(html).toContain('href="/promo"');
  });

  it("promoBannerSettingsSchema has 5 entries [backgroundImage,kicker,headline,ctaLabel,ctaUrl]", () => {
    expect(promoBannerSettingsSchema).toHaveLength(5);
    const ids = promoBannerSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "backgroundImage",
      "kicker",
      "headline",
      "ctaLabel",
      "ctaUrl",
    ]);
  });
});

describe("Servicios registry", () => {
  it("servicios slot exposes both block types in ONE blocks array (D-02/D-03)", () => {
    const cfg = sectionBlocksConfig.servicios;
    expect(cfg.blocks).toHaveLength(2);
    expect(cfg.blocks).toContainEqual({ type: "service-item" });
    expect(cfg.blocks).toContainEqual({ type: "promo-banner" });
  });

  it("servicios registers TWO section-local blocks (D-06)", () => {
    const cfg = sectionBlocksConfig.servicios;
    expect(cfg.localBlocks).toHaveLength(2);
    const types = cfg.localBlocks?.map((b) => b.type);
    expect(types).toContain("service-item");
    expect(types).toContain("promo-banner");
  });
});
