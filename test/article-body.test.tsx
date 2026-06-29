import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  ArticleBody,
  articleBodySettingsSchema,
} from "@/sections/ArticleBody";

// ---------------------------------------------------------------------------
// ArticleBody section (ART-01, ART-02, ART-03).
//
// The shared richtext section: an OPTIONAL <h1> heading, an OPTIONAL free-text
// date line, and the richtext body routed THROUGH the single audited RichText
// sink (`@/lib/rich-text`). It introduces NO new dangerouslySetInnerHTML — the
// 07-02 sink audit must stay at exactly 1.
//
// The vitest env is `node` (no window/document); the section is stateless and
// renders under renderToStaticMarkup without throwing.
// ---------------------------------------------------------------------------

describe("ArticleBody — optional heading", () => {
  it("renders the heading inside an <h1> when non-empty", () => {
    const html = renderToStaticMarkup(<ArticleBody heading="Aviso legal" />);
    expect(html).toContain("Aviso legal");
    expect(html).toMatch(/<h1[^>]*>[^<]*Aviso legal/);
  });

  it("omits the <h1> entirely when heading is empty/undefined", () => {
    const html = renderToStaticMarkup(<ArticleBody />);
    expect(html).not.toContain("<h1");
  });
});

describe("ArticleBody — optional date line", () => {
  it("renders the free-text date line when lastUpdated is non-empty", () => {
    const html = renderToStaticMarkup(
      <ArticleBody lastUpdated="Actualizado: 28/06/2026" />,
    );
    expect(html).toContain("Actualizado: 28/06/2026");
  });

  it("omits the date line when lastUpdated is empty/undefined", () => {
    const html = renderToStaticMarkup(<ArticleBody body="<p>Hola</p>" />);
    expect(html).not.toContain("Actualizado");
  });
});

describe("ArticleBody — richtext body through the single sink", () => {
  it("renders the sanitized body inside the .article-body wrapper", () => {
    const html = renderToStaticMarkup(<ArticleBody body="<p>Hola</p>" />);
    expect(html).toContain("Hola");
    expect(html).toContain('class="article-body');
  });

  it("delegates the empty body to the RichText 'Sin contenido' placeholder", () => {
    const html = renderToStaticMarkup(<ArticleBody />);
    expect(html).toContain("Sin contenido");
  });

  it("renders under renderToStaticMarkup with fully blank props without throwing", () => {
    expect(() => renderToStaticMarkup(<ArticleBody />)).not.toThrow();
  });
});

describe("ArticleBody — settings schema", () => {
  it("exposes a richtext body field (richtext over raw html, D-08)", () => {
    const body = articleBodySettingsSchema.find((s) => s.id === "body");
    expect(body?.type).toBe("richtext");
  });

  it("exposes optional text heading + lastUpdated fields", () => {
    const heading = articleBodySettingsSchema.find((s) => s.id === "heading");
    const lastUpdated = articleBodySettingsSchema.find(
      (s) => s.id === "lastUpdated",
    );
    expect(heading?.type).toBe("text");
    expect(lastUpdated?.type).toBe("text");
  });
});
