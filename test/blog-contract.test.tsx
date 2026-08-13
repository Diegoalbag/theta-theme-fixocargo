import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import themeConfig from "../theta.config.json";
import { sectionsComponents, sectionSettingsSchemas } from "@/registry";
import { ArticleBody } from "@/sections/ArticleBody";
import { ArchiveList } from "@/sections/ArchiveList";
import type { ArchiveProp, ArticleProp } from "@/theme-contract";
import { postHref, termHref } from "@/theme-contract";

// ---------------------------------------------------------------------------
// Blog contract migration — this theme's conformance to the platform's
// article/archive contract (project-theta-fe Phases 21 and 22).
//
// Before this, the theme shipped no theta.config.json at all, so it declared no
// templates and the platform treated it as unable to display posts. These tests
// pin the three things that make the declaration true rather than merely
// present: the manifest agrees with the registry, ArticleBody prefers a real
// injected post over authored settings without breaking the pages that have no
// post, and ArchiveList renders real anchors composed from each post's slug.
// ---------------------------------------------------------------------------

const post = (over: Partial<ArticleProp> = {}): ArticleProp => ({
  documentId: "doc-1",
  title: "Cómo calcular impuestos de tu paquete",
  slug: "calcular-impuestos",
  body: "<p>Contenido real del post.</p>",
  excerpt: "Un resumen.",
  featuredImage: null,
  category: null,
  tags: [],
  author: null,
  publishedAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  ...over,
});

const archive = (over: Partial<ArchiveProp> = {}): ArchiveProp => ({
  posts: [],
  term: null,
  page: 1,
  ...over,
});

describe("theta.config.json ↔ registry agreement", () => {
  it("declares every registered section and no orphans", () => {
    const declared = themeConfig.sections.map((s) => s.key).sort();
    const registered = Object.keys(sectionsComponents).sort();
    expect(declared).toEqual(registered);
  });

  it("declares exactly the two reserved templates", () => {
    expect(themeConfig.templates.map((t) => t.key).sort()).toEqual([
      "archive",
      "article",
    ]);
  });

  it("gives each template a non-empty sections list containing its required slot", () => {
    const requiredSlot: Record<string, string> = {
      article: "article-body",
      archive: "archive-list",
    };
    for (const template of themeConfig.templates) {
      expect(template.sections.length).toBeGreaterThan(0);
      expect(template.sections).toContain(requiredSlot[template.key]);
    }
  });

  it("declares only sections that are actually registered in each template", () => {
    for (const template of themeConfig.templates) {
      for (const key of template.sections) {
        expect(sectionsComponents).toHaveProperty(key);
      }
    }
  });

  it("registers a settings schema alongside each reserved blog section", () => {
    expect(sectionSettingsSchemas).toHaveProperty("article-body");
    expect(sectionSettingsSchemas).toHaveProperty("archive-list");
  });
});

describe("ArticleBody — injected post wins, authored settings still work", () => {
  it("renders the injected post's body and title on an article template", () => {
    const html = renderToStaticMarkup(<ArticleBody article={post()} />);
    expect(html).toContain("Contenido real del post.");
    expect(html).toContain("Cómo calcular impuestos de tu paquete");
  });

  it("still renders authored content when no post is injected", () => {
    // The Legal/policies pages depend on this path — it must not regress.
    const html = renderToStaticMarkup(
      <ArticleBody heading="Términos y condiciones" body="<p>Texto legal.</p>" />
    );
    expect(html).toContain("Términos y condiciones");
    expect(html).toContain("Texto legal.");
  });

  it("prefers the post over authored settings when both are present", () => {
    const html = renderToStaticMarkup(
      <ArticleBody
        heading="Encabezado autor"
        body="<p>Cuerpo autor.</p>"
        article={post()}
      />
    );
    expect(html).toContain("Contenido real del post.");
    expect(html).not.toContain("Cuerpo autor.");
  });

  it("falls back to authored content when the post body is empty", () => {
    // An empty post body must not blank a page that authored real content.
    const html = renderToStaticMarkup(
      <ArticleBody body="<p>Cuerpo autor.</p>" article={post({ body: "" })} />
    );
    expect(html).toContain("Cuerpo autor.");
  });

  it("renders without throwing when neither source is present", () => {
    expect(() => renderToStaticMarkup(<ArticleBody />)).not.toThrow();
  });
});

describe("ArchiveList — one section, three surfaces", () => {
  it("renders a real anchor to each post composed from its slug", () => {
    const html = renderToStaticMarkup(
      <ArchiveList archive={archive({ posts: [post()] })} />
    );
    expect(html).toContain('href="/blog/calcular-impuestos"');
    expect(html).toContain("Cómo calcular impuestos de tu paquete");
  });

  it("renders a post with a blank slug as unlinked text, not a bare /blog/ link", () => {
    const html = renderToStaticMarkup(
      <ArchiveList archive={archive({ posts: [post({ slug: "" })] })} />
    );
    expect(html).not.toContain('href="/blog/"');
  });

  it("labels a category archive with the term's own name and description", () => {
    const html = renderToStaticMarkup(
      <ArchiveList
        heading="Blog"
        archive={archive({
          posts: [post()],
          term: {
            kind: "category",
            name: "Envíos",
            slug: "envios",
            description: "Todo sobre envíos.",
          },
        })}
      />
    );
    expect(html).toContain("Envíos");
    expect(html).toContain("Todo sobre envíos.");
    // The term's name replaces the authored index heading on a term archive.
    expect(html).not.toContain(">Blog<");
  });

  it("uses the authored heading on the blog index", () => {
    const html = renderToStaticMarkup(
      <ArchiveList heading="Blog" archive={archive({ posts: [post()] })} />
    );
    expect(html).toContain("Blog");
  });

  it("states an empty state rather than rendering empty chrome", () => {
    const html = renderToStaticMarkup(<ArchiveList archive={archive()} />);
    expect(html).toContain("Todavía no hay artículos publicados.");
  });

  it("renders without throwing when no archive is injected", () => {
    expect(() => renderToStaticMarkup(<ArchiveList />)).not.toThrow();
  });

  it("renders a post missing image, category and author without broken chrome", () => {
    expect(() =>
      renderToStaticMarkup(
        <ArchiveList
          archive={archive({
            posts: [
              post({ featuredImage: null, category: null, author: null }),
            ],
          })}
        />
      )
    ).not.toThrow();
  });
});

describe("URL composition helpers (Phase 22 D-1 / D-5 / D-12)", () => {
  it("encodes a slug and returns a root-relative path", () => {
    expect(postHref("hola mundo")).toBe("/blog/hola%20mundo");
  });

  it("returns null for a blank slug so callers render no link", () => {
    expect(postHref("")).toBeNull();
    expect(postHref(null)).toBeNull();
  });

  it("composes category and tag archive paths, never a /page/1 form", () => {
    expect(
      termHref({ kind: "category", name: "Envíos", slug: "envios", description: null })
    ).toBe("/blog/category/envios");
    expect(
      termHref({ kind: "tag", name: "Aduanas", slug: "aduanas", description: null })
    ).toBe("/blog/tag/aduanas");
  });
});
