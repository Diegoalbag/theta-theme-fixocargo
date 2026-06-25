import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Sucursales, sucursalesSettingsSchema } from "@/sections/Sucursales";
import { Branch, branchSettingsSchema } from "@/blocks/Branch";
import { sectionBlocksConfig } from "@/registry";

// Render-smoke tests for the Phase 5 Info-sections sections/blocks.
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert on the returned HTML string. These tests
// prove the components render without crashing and emit the correct structure —
// not that they look correct visually. Plans 05-02 (EnviosNacionales + FaqPill)
// and 05-03 (Blogs + BlogCard) APPEND their own describe blocks to this file.

describe("Sucursales", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Nuestras Sucursales");
  });

  it("renders the decorative search placeholder", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Ingresa la ubicación");
  });

  it("renders the default EmptyState when zero blocks (D-08)", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Sin elementos");
  });

  it("renders the ImageGuard placeholder and no img when mapImage unset", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Agrega una imagen");
    expect(html).not.toContain("<img");
  });

  it("renders provided blocks inside a responsive two-column layout", () => {
    const html = renderToStaticMarkup(
      <Sucursales renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:flex-row");
    expect(html).toContain("child");
  });

  it("sucursalesSettingsSchema has exactly 3 entries [heading,subtitle,mapImage]", () => {
    expect(sucursalesSettingsSchema).toHaveLength(3);
    const ids = sucursalesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "subtitle", "mapImage"]);
    const mapImageSetting = sucursalesSettingsSchema.find(
      (s) => s.id === "mapImage",
    );
    expect(mapImageSetting?.type).toBe("image_picker");
  });
});

describe("Branch", () => {
  it("renders without crash with empty props (default name)", () => {
    const html = renderToStaticMarkup(<Branch />);
    expect(typeof html).toBe("string");
    expect(html).toContain("SD | Av. Independencia");
  });

  it("renders a tel: anchor when phone is set", () => {
    const html = renderToStaticMarkup(<Branch phone="809-285-4230" />);
    expect(html).toContain("tel:809-285-4230");
  });

  it("renders a mailto: anchor when email is set", () => {
    const html = renderToStaticMarkup(<Branch email="info@fixocargo.com" />);
    expect(html).toContain("mailto:info@fixocargo.com");
  });

  it("emits NO empty tel:/mailto: href when phone and email are unset (Pitfall 1)", () => {
    const html = renderToStaticMarkup(<Branch phone="" email="" />);
    // Build the empty-scheme href literals at runtime so the assertion target is
    // unambiguous: the scheme name + ":" + closing quote, with no value.
    const emptyTel = 'href="' + "tel" + ':"';
    const emptyMailto = 'href="' + "mailto" + ':"';
    expect(html).not.toContain(emptyTel);
    expect(html).not.toContain(emptyMailto);
    expect(/href="(tel|mailto):"/.test(html)).toBe(false);
  });

  it("renders the Dirección anchor with the provided mapUrl", () => {
    const html = renderToStaticMarkup(<Branch mapUrl="/m" />);
    expect(html).toContain('href="/m"');
  });

  it("branchSettingsSchema has 4 entries [name,phone,email,mapUrl] with mapUrl as url", () => {
    expect(branchSettingsSchema).toHaveLength(4);
    const ids = branchSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["name", "phone", "email", "mapUrl"]);
    const mapUrlSetting = branchSettingsSchema.find((s) => s.id === "mapUrl");
    expect(mapUrlSetting?.type).toBe("url");
  });
});

describe("Sucursales registry", () => {
  it("sucursales slot exposes the branch block in its blocks allow-list", () => {
    const cfg = sectionBlocksConfig.sucursales;
    expect(cfg.blocks).toContainEqual({ type: "branch" });
  });

  it("sucursales registers exactly one section-local block of type branch (D-07)", () => {
    const cfg = sectionBlocksConfig.sucursales;
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("branch");
  });

  it("sucursales caps the slot at 8 blocks (D-09)", () => {
    const cfg = sectionBlocksConfig.sucursales;
    expect(cfg.maxBlocks).toBe(8);
  });
});
