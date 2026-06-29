import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { BlogHero, blogHeroSettingsSchema } from "@/sections/BlogHero";

// ---------------------------------------------------------------------------
// BlogHero section (BLG-01, ART-04).
//
// One reusable navy header that serves the Blog index (search ON) and the
// Blog-article / Legal headers (search OFF → article-header date line) from a
// single stateless section. The `showSearch` toggle switches between a
// decorative (inert) search pill and a date line. No state, no handlers — the
// search input is readOnly/aria-hidden/tabIndex=-1 (Sucursales precedent).
//
// The vitest env is `node`; the section renders under renderToStaticMarkup.
// ---------------------------------------------------------------------------

describe("BlogHero — search ON (showSearch=true, default)", () => {
  it("renders the decorative inert search pill and no date line", () => {
    const html = renderToStaticMarkup(
      <BlogHero
        showSearch={true}
        searchPlaceholder="Buscar artículos…"
        searchButtonLabel="Buscar"
        date="Publicado: 28/06/2026"
      />,
    );
    expect(html).toContain("<input");
    expect(html).toContain("Buscar");
    expect(html).toContain("Buscar artículos…");
    // inert control attributes (renderToStaticMarkup emits the camelCase
    // boolean attr `readOnly=""`; match case-insensitively for the inert intent)
    expect(html).toMatch(/readonly/i);
    expect(html).toContain('tabindex="-1"');
    // no interactivity, no date line in the search variant
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("Publicado: 28/06/2026");
  });

  it("defaults showSearch to true (renders the search input)", () => {
    const html = renderToStaticMarkup(<BlogHero searchButtonLabel="Buscar" />);
    expect(html).toContain("<input");
  });
});

describe("BlogHero — search OFF (showSearch=false, article-header variant)", () => {
  it("hides the search and renders the date line when date is non-empty", () => {
    const html = renderToStaticMarkup(
      <BlogHero showSearch={false} date="Publicado: 28/06/2026" />,
    );
    expect(html).toContain("Publicado: 28/06/2026");
    expect(html).not.toContain("<input");
  });

  it("renders neither search nor date when date is empty", () => {
    const html = renderToStaticMarkup(<BlogHero showSearch={false} />);
    expect(html).not.toContain("<input");
    expect(html).not.toContain("Publicado");
  });
});

describe("BlogHero — optional header fields", () => {
  it("renders eyebrow/heading/subtitle when non-empty", () => {
    const html = renderToStaticMarkup(
      <BlogHero
        eyebrow="Novedades"
        heading="BLOG"
        subtitle="Guías de envío"
        showSearch={false}
      />,
    );
    expect(html).toContain("Novedades");
    expect(html).toContain("BLOG");
    expect(html).toContain("Guías de envío");
  });

  it("omits eyebrow/heading/subtitle when empty", () => {
    const html = renderToStaticMarkup(
      <BlogHero eyebrow="" heading="" subtitle="" showSearch={false} />,
    );
    expect(html).not.toContain("<h2");
    expect(html).not.toContain("<h1");
  });

  it("renders under renderToStaticMarkup with blank props without throwing", () => {
    expect(() => renderToStaticMarkup(<BlogHero />)).not.toThrow();
  });
});

describe("BlogHero — settings schema", () => {
  it("exposes a showSearch checkbox defaulting to true", () => {
    const showSearch = blogHeroSettingsSchema.find(
      (s) => s.id === "showSearch",
    );
    expect(showSearch?.type).toBe("checkbox");
    expect(showSearch?.default).toBe(true);
  });

  it("exposes the documented Spanish text fields", () => {
    const ids = blogHeroSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "eyebrow",
        "heading",
        "subtitle",
        "showSearch",
        "searchPlaceholder",
        "searchButtonLabel",
        "date",
      ]),
    );
  });
});
