import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { RichText, RICHTEXT_CONFIG } from "@/lib/rich-text";

// ---------------------------------------------------------------------------
// RichText sink behavior (ART-01, ART-05; T-07-01..T-07-06).
//
// RichText is the theme's FIRST and ONLY HTML-injection sink. The platform
// stores merchant richtext HTML raw (ZERO sanitization), so this helper is the
// sole sanitization layer before that HTML reaches a visitor.
//
// The vitest environment is `node` (no global `window`/`document`), so these
// tests exercise the NO-DOM branch: `stringStrip`, the portable regex baseline.
// In this branch DOMPurify is intentionally never reached (Pitfall 1 / D-02) —
// the browser DOMPurify path is verified manually in Phase 10 UAT. We assert on
// the `renderToStaticMarkup` HTML string only.
// ---------------------------------------------------------------------------

describe("RichText sink — hostile payload neutralization (node/stringStrip path)", () => {
  it("strips on*= event handlers (onerror) — T-07-02", () => {
    const html = renderToStaticMarkup(
      <RichText html='<img src=x onerror=alert(1)>' />,
    );
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });

  it("removes <script> elements and their contents — T-07-01", () => {
    const html = renderToStaticMarkup(
      <RichText html="<script>alert(1)</script>" />,
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("removes javascript: link protocol tokens — T-07-03", () => {
    const html = renderToStaticMarkup(
      <RichText html='<a href="javascript:alert(1)">x</a>' />,
    );
    expect(html.toLowerCase()).not.toContain("javascript:");
  });

  it("removes other dangerous embedding elements (iframe/object/embed)", () => {
    const html = renderToStaticMarkup(
      <RichText html='<iframe src="evil"></iframe><object></object><embed>' />,
    );
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<object");
    expect(html).not.toContain("<embed");
  });
});

describe("RichText sink — empty-body guard (never builds __html from empty)", () => {
  it("renders the EmptyState placeholder for undefined html", () => {
    const html = renderToStaticMarkup(<RichText />);
    expect(html).toContain("Sin contenido");
    expect(html).toContain("Agrega contenido en el editor.");
    expect(html).not.toContain("undefined");
  });

  it("renders the EmptyState placeholder for an empty string", () => {
    const html = renderToStaticMarkup(<RichText html="" />);
    expect(html).toContain("Sin contenido");
  });

  it("renders the EmptyState placeholder for a whitespace-only string", () => {
    const html = renderToStaticMarkup(<RichText html={"   \n\t  "} />);
    expect(html).toContain("Sin contenido");
  });
});

describe("RichText sink — benign content + article-body wrapper", () => {
  it("wraps sanitized markup in a div carrying the article-body class", () => {
    const html = renderToStaticMarkup(<RichText html="<p>Hola</p>" />);
    expect(html).toContain("article-body");
    expect(html).toContain("<p>Hola</p>");
  });

  it("appends a caller-supplied className to article-body", () => {
    const html = renderToStaticMarkup(
      <RichText html="<p>Hola</p>" className="prose" />,
    );
    expect(html).toContain("article-body");
    expect(html).toContain("prose");
  });
});

describe("RICHTEXT_CONFIG — allow-list shape (no CSS/style injection surface)", () => {
  it("excludes style, class, and id from ALLOWED_ATTR — T-07-06", () => {
    expect(RICHTEXT_CONFIG.ALLOWED_ATTR).not.toContain("style");
    expect(RICHTEXT_CONFIG.ALLOWED_ATTR).not.toContain("class");
    expect(RICHTEXT_CONFIG.ALLOWED_ATTR).not.toContain("id");
  });

  it("allows only href, target, and rel attributes", () => {
    expect([...RICHTEXT_CONFIG.ALLOWED_ATTR].sort()).toEqual(
      ["href", "rel", "target"].sort(),
    );
  });

  it("does not allow script/style/iframe tags", () => {
    expect(RICHTEXT_CONFIG.ALLOWED_TAGS).not.toContain("script");
    expect(RICHTEXT_CONFIG.ALLOWED_TAGS).not.toContain("style");
    expect(RICHTEXT_CONFIG.ALLOWED_TAGS).not.toContain("iframe");
  });
});
