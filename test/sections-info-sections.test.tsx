import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

import {
  Sucursales,
  sucursalesSettingsSchema,
  resolveHideTarget,
  setHidden,
} from "@/sections/Sucursales";
import { Branch, branchSettingsSchema } from "@/blocks/Branch";
import {
  EnviosNacionales,
  enviosNacionalesSettingsSchema,
} from "@/sections/EnviosNacionales";
import { FaqPill, faqPillSettingsSchema } from "@/blocks/FaqPill";
import { Blogs, blogsSettingsSchema } from "@/sections/Blogs";
import { BlogCard, blogCardSettingsSchema } from "@/blocks/BlogCard";
import {
  sectionBlocksConfig,
  sectionsComponents,
  sectionSettingsSchemas,
  blocksComponents,
  blockSettingsSchemas,
} from "@/registry";

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

  it("renders a REAL, labelled search input with its placeholder", () => {
    // D-03 is REVERSED for this one element: the Sucursales search drives a
    // live branch filter, so it must be a genuine focusable form control.
    // Scope every assertion to the <input> tag itself — the decorative Search
    // ICON next to it legitimately keeps aria-hidden, so asserting over the
    // whole html string would false-fail.
    const html = renderToStaticMarkup(<Sucursales />);
    const input = html.match(/<input[^>]*>/)?.[0] ?? "";
    expect(input).not.toBe("");
    expect(input).not.toMatch(/readonly/i);
    expect(input).not.toMatch(/aria-hidden/);
    expect(input).not.toContain('tabindex="-1"');
    expect(input).toMatch(/aria-label="[^"]+"/);
    expect(input).toContain('type="search"');
    expect(html).toContain("Ingresa la ubicación");
  });

  it("gives the now-tabbable search input a visible focus indicator (WCAG 2.4.7)", () => {
    // WR-03: the control was inert (readOnly / aria-hidden / tabIndex=-1) when
    // `outline-none` was added, so it cost nothing. Now that it is a real
    // tabbable form control, focus MUST be visible. `outline-none` may not
    // simply coexist with the focus variant either — Tailwind v4's outline-none
    // sets --tw-outline-style: none at the base, neutering focus-visible
    // outline widths — so assert it is gone, not merely overridden.
    const html = renderToStaticMarkup(<Sucursales />);
    const input = html.match(/<input[^>]*>/)?.[0] ?? "";
    expect(input).not.toBe("");
    expect(input).not.toMatch(/\boutline-none\b/);
    expect(input).toContain("focus-visible:outline-2");
    expect(input).toContain("focus-visible:outline-brand-yellow");
  });

  it("marks the branch list container with the class the filter scopes to", () => {
    const html = renderToStaticMarkup(
      <Sucursales renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("fx-branch-list");
  });

  it("renders every branch card visible in static markup (no-JS fallback)", () => {
    // Filtering is an effect-only enhancement and effects never run under
    // renderToStaticMarkup. Static markup must therefore contain ALL cards with
    // no JSX-emitted display:none. Scope to the branch-list region: the map
    // overlay's contact anchor ships style="display:none" by design, so a
    // whole-document assertion would false-fail.
    const html = renderToStaticMarkup(
      <Sucursales
        renderBlocks={() => [
          <span key="a">branch-uno</span>,
          <span key="b">branch-dos</span>,
        ]}
      />,
    );
    const listStart = html.indexOf("fx-branch-list");
    const listEnd = html.indexOf("<iframe");
    expect(listStart).toBeGreaterThan(-1);
    expect(listEnd).toBeGreaterThan(listStart);
    const listRegion = html.slice(listStart, listEnd);
    expect(listRegion).toContain("branch-uno");
    expect(listRegion).toContain("branch-dos");
    expect(listRegion).not.toMatch(/display:\s*none/i);
  });

  it("ships an empty live region and a HIDDEN zero-results message (WR-04)", () => {
    // The filter announces its result count and explains an empty column, but
    // both nodes must be inert in static markup: the live region starts empty
    // (nothing to announce before a query) and the message is hidden via the
    // `hidden` ATTRIBUTE — not an inline display:none, which would trip the
    // no-JS fallback assertion above and is the wrong tool besides.
    const html = renderToStaticMarkup(
      <Sucursales renderBlocks={() => [<span key="a">branch-uno</span>]} />,
    );
    expect(html).toMatch(/<p[^>]*role="status"[^>]*><\/p>/);
    expect(html).toContain('aria-live="polite"');
    const message = html.match(/<p[^>]*>No encontramos[^<]*<\/p>/)?.[0] ?? "";
    expect(message).not.toBe("");
    expect(message).toMatch(/\shidden(=""|\s|>)/);
    expect(message).not.toMatch(/display:\s*none/i);
  });

  it("renders the default EmptyState when zero blocks (D-08)", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a real map iframe + the selected-branch overlay panel", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("<iframe");
    expect(html).toContain("output=embed");
    expect(html).toContain("Contáctanos");
    expect(html).toContain("Dirección");
  });

  it("renders branches as a vertical list (not a grid) in a two-column layout", () => {
    const html = renderToStaticMarkup(
      <Sucursales renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("lg:flex-row");
    expect(html).toContain("flex-col");
    expect(html).not.toContain("grid-cols-1");
    expect(html).toContain("child");
  });

  it("routes the merchant mapUrl through safeHref before it reaches a live href", () => {
    // CR-02: the directions href is assigned IMPERATIVELY from the merchant's
    // `mapUrl` setting, so no JSX-level handling protects it and no render can
    // observe it. Source scan (same idiom as test/richtext-sink-audit.test.ts):
    // the raw attribute value must never reach `.href` unguarded.
    const src = readFileSync(
      resolve(__dirname, "../src/sections/Sucursales/Sucursales.tsx"),
      "utf-8",
    );
    expect(src).toContain('import { safeHref } from "@/lib/safe-href"');
    expect(src).toMatch(/safeHref\(mapurl\)/);
    expect(src).not.toMatch(/\.href\s*=\s*mapurl\b/);
  });

  it("sucursalesSettingsSchema has exactly 3 entries [heading,subtitle,mapQuery]", () => {
    expect(sucursalesSettingsSchema).toHaveLength(3);
    const ids = sucursalesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "subtitle", "mapQuery"]);
    const mapQuerySetting = sucursalesSettingsSchema.find(
      (s) => s.id === "mapQuery",
    );
    expect(mapQuerySetting?.type).toBe("text");
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

  it("exposes mapUrl via data-branch-mapurl for the section map overlay", () => {
    const html = renderToStaticMarkup(<Branch mapUrl="/m" />);
    expect(html).toContain('data-branch-mapurl="/m"');
  });

  it("renders the horario schedule text when set", () => {
    const html = renderToStaticMarkup(
      <Branch horario="Lun-Vie 9:00am-6:00pm, Sáb 9:00am-1:00pm" />,
    );
    expect(html).toContain("Lun-Vie 9:00am-6:00pm, Sáb 9:00am-1:00pm");
  });

  it("marks the schedule row with data-branch-horario when set", () => {
    const html = renderToStaticMarkup(
      <Branch horario="Lun-Vie 9:00am-6:00pm, Sáb 9:00am-1:00pm" />,
    );
    expect(html).toContain(
      'data-branch-horario="Lun-Vie 9:00am-6:00pm, Sáb 9:00am-1:00pm"',
    );
  });

  it("omits the schedule row entirely when horario is absent (backward compat)", () => {
    // Branch instances saved before the horario field existed have NO horario
    // key at all — they must render byte-identically to before: no empty row,
    // no stray icon, no marker attribute.
    const html = renderToStaticMarkup(<Branch />);
    expect(html).not.toContain("data-branch-horario");
  });

  it("omits the schedule row entirely when horario is the empty string", () => {
    const html = renderToStaticMarkup(<Branch horario="" />);
    expect(html).not.toContain("data-branch-horario");
  });

  it("always emits data-branch-card, even with no name and no mapQuery (WR-05)", () => {
    // Content-independent marker. Every other data-branch-* attribute is
    // conditional on merchant content, so a card with nothing filled in used to
    // disappear from the filter's enumeration: never hidden for any query, and
    // it falsified the "exactly one card" count that bounds the hide-target
    // walk for its siblings.
    const blank = renderToStaticMarkup(<Branch name="" mapQuery="" />);
    expect(blank).toContain('data-branch-card=""');
    expect(blank).not.toContain("data-branch-query");
    expect(renderToStaticMarkup(<Branch />)).toContain('data-branch-card=""');
  });

  it("emits the name + address attributes the Sucursales search filter reads", () => {
    // Input contract for the section's live filter: the haystack is built from
    // these two card-root attributes. Pinning them here so the filter cannot be
    // silently broken by a Branch markup change.
    const html = renderToStaticMarkup(
      <Branch name="SD | Av. Independencia" address="Santiago" />,
    );
    expect(html).toContain('data-branch-name="SD | Av. Independencia"');
    expect(html).toContain('data-branch-address="Santiago"');
  });

  it("emits data-branch-query on the card root (map/click/selection keystone)", () => {
    // WR-06: this single attribute is what the section's click delegation
    // closest() matches, what the default selection enumerates, and what tells
    // the filter a match is mappable. Renaming or conditionally dropping it
    // breaks the whole section with a fully green suite unless it is pinned.
    // Runtime filtering is UAT-only here (effects never run under
    // renderToStaticMarkup), so this markup contract is its only automated
    // protection.
    expect(
      renderToStaticMarkup(<Branch name="SD" mapQuery="Santo Domingo" />),
    ).toContain('data-branch-query="Santo Domingo"');
    // Falls back to the name so branches saved before mapQuery existed stay
    // mappable.
    expect(renderToStaticMarkup(<Branch name="SD" mapQuery="" />)).toContain(
      'data-branch-query="SD"',
    );
  });

  it("branchSettingsSchema has 7 entries incl. horario + address + mapQuery; mapUrl is url", () => {
    expect(branchSettingsSchema).toHaveLength(7);
    const ids = branchSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "name",
      "phone",
      "email",
      "horario",
      "address",
      "mapUrl",
      "mapQuery",
    ]);
    const mapUrlSetting = branchSettingsSchema.find((s) => s.id === "mapUrl");
    expect(mapUrlSetting?.type).toBe("url");
    const horarioSetting = branchSettingsSchema.find((s) => s.id === "horario");
    expect(horarioSetting?.type).toBe("text");
    // Empty default IS the backward-compat contract: saved branches without the
    // key render exactly as before.
    expect(horarioSetting?.default).toBe("");
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

// --- Wave 2 (plan 05-02): EnviosNacionales + FaqPill ---

describe("FaqPill", () => {
  it("renders without crash with empty props (default question)", () => {
    const html = renderToStaticMarkup(<FaqPill />);
    expect(typeof html).toBe("string");
    expect(html).toContain("¿Cómo funciona?");
  });

  it("always renders the provided question", () => {
    const html = renderToStaticMarkup(<FaqPill question="¿Dónde recojo?" />);
    expect(html).toContain("¿Dónde recojo?");
  });

  it("renders the Buscar button as a real anchor when url is set", () => {
    const html = renderToStaticMarkup(<FaqPill url="/q" />);
    expect(html).toContain('href="/q"');
    expect(html).toContain("Buscar");
  });

  it("renders an inert disabled Buscar button (no anchor) when url is empty", () => {
    const html = renderToStaticMarkup(<FaqPill url="" />);
    expect(html).toContain("disabled");
    expect(html).not.toContain(">Buscar</a>");
  });

  it("faqPillSettingsSchema has 2 entries [question,url] with url as url", () => {
    expect(faqPillSettingsSchema).toHaveLength(2);
    const ids = faqPillSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["question", "url"]);
    const urlSetting = faqPillSettingsSchema.find((s) => s.id === "url");
    expect(urlSetting?.type).toBe("url");
  });
});

describe("EnviosNacionales", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<EnviosNacionales />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading and kicker (dark variant)", () => {
    const html = renderToStaticMarkup(<EnviosNacionales />);
    expect(html).toContain("Envíos Nacionales");
    expect(html).toContain("#FixoTeGuía");
  });

  it("renders on the navy dark surface", () => {
    const html = renderToStaticMarkup(<EnviosNacionales />);
    expect(html).toContain("bg-brand-navy");
  });

  it("renders the section CTA as a real anchor with the provided ctaUrl", () => {
    const html = renderToStaticMarkup(<EnviosNacionales ctaUrl="/e" />);
    expect(html).toContain('href="/e"');
    expect(html).toContain("Conoce más");
  });

  it("renders the default EmptyState when zero blocks (D-08)", () => {
    const html = renderToStaticMarkup(<EnviosNacionales />);
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside the stacking BlocksSlot layout", () => {
    const html = renderToStaticMarkup(
      <EnviosNacionales renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("flex-col");
    expect(html).toContain("child");
  });

  it("enviosNacionalesSettingsSchema has 6 entries incl. backgroundImage", () => {
    expect(enviosNacionalesSettingsSchema).toHaveLength(6);
    const ids = enviosNacionalesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "kicker",
      "heading",
      "body",
      "ctaLabel",
      "ctaUrl",
      "backgroundImage",
    ]);
    const bodySetting = enviosNacionalesSettingsSchema.find(
      (s) => s.id === "body",
    );
    expect(bodySetting?.type).toBe("textarea");
    const ctaUrlSetting = enviosNacionalesSettingsSchema.find(
      (s) => s.id === "ctaUrl",
    );
    expect(ctaUrlSetting?.type).toBe("url");
  });
});

describe("EnviosNacionales registry", () => {
  it("envios-nacionales slot exposes the faq-pill block in its blocks allow-list", () => {
    const cfg = sectionBlocksConfig["envios-nacionales"];
    expect(cfg.blocks).toContainEqual({ type: "faq-pill" });
  });

  it("envios-nacionales registers exactly one section-local block of type faq-pill (D-07)", () => {
    const cfg = sectionBlocksConfig["envios-nacionales"];
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("faq-pill");
  });

  it("envios-nacionales caps the slot at 8 blocks (D-09)", () => {
    const cfg = sectionBlocksConfig["envios-nacionales"];
    expect(cfg.maxBlocks).toBe(8);
  });
});

// --- Wave 3 (plan 05-03): Blogs + BlogCard ---

describe("BlogCard", () => {
  it("renders without crash with empty props (default title)", () => {
    const html = renderToStaticMarkup(<BlogCard />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Cómo calcular impuestos de tu paquete");
  });

  it("renders the ImageGuard placeholder and no img when image is unset", () => {
    const html = renderToStaticMarkup(<BlogCard />);
    expect(html).toContain("Agrega una imagen");
    expect(html).not.toContain("<img");
  });

  it("renders an img with the url when image is set", () => {
    const html = renderToStaticMarkup(
      <BlogCard image={{ id: "1", url: "/cover.jpg" }} />,
    );
    expect(html).toContain("<img");
    expect(html).toContain("/cover.jpg");
  });

  it("renders both tag pills (navy + yellow) when both tags are set (D-01)", () => {
    const html = renderToStaticMarkup(
      <BlogCard tagPrimary="Aduanas" tagSecondary="Guía" />,
    );
    expect(html).toContain("bg-brand-navy");
    expect(html).toContain("bg-brand-yellow");
    expect(html).toContain("Aduanas");
    expect(html).toContain("Guía");
  });

  it("renders neither tag pill when both tags are unset (D-01)", () => {
    const html = renderToStaticMarkup(<BlogCard />);
    expect(html).not.toContain("Aduanas");
    expect(html).not.toContain("Guía");
  });

  it("renders date and excerpt only when set", () => {
    const html = renderToStaticMarkup(
      <BlogCard date="12 Jun 2026" excerpt="Un resumen breve" />,
    );
    expect(html).toContain("12 Jun 2026");
    expect(html).toContain("Un resumen breve");
  });

  it('renders "Conoce más" as a real anchor with the provided linkUrl', () => {
    const html = renderToStaticMarkup(<BlogCard linkUrl="/post" />);
    expect(html).toContain('href="/post"');
    expect(html).toContain("Conoce más");
  });

  it("blogCardSettingsSchema has 7 entries [image,tagPrimary,tagSecondary,date,title,excerpt,linkUrl]", () => {
    expect(blogCardSettingsSchema).toHaveLength(7);
    const ids = blogCardSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "image",
      "tagPrimary",
      "tagSecondary",
      "date",
      "title",
      "excerpt",
      "linkUrl",
    ]);
    const imageSetting = blogCardSettingsSchema.find((s) => s.id === "image");
    expect(imageSetting?.type).toBe("image_picker");
    const excerptSetting = blogCardSettingsSchema.find(
      (s) => s.id === "excerpt",
    );
    expect(excerptSetting?.type).toBe("textarea");
    const linkUrlSetting = blogCardSettingsSchema.find(
      (s) => s.id === "linkUrl",
    );
    expect(linkUrlSetting?.type).toBe("url");
  });
});

describe("Blogs", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<Blogs />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading and subtitle (light variant)", () => {
    const html = renderToStaticMarkup(<Blogs />);
    expect(html).toContain("Últimos Blogs");
    expect(html).toContain("Novedades, tendencias y más");
  });

  it("renders the section CTA as a real anchor with the provided ctaUrl", () => {
    const html = renderToStaticMarkup(<Blogs ctaUrl="/b" />);
    expect(html).toContain('href="/b"');
    expect(html).toContain("Explora todos blogs");
  });

  it("renders the default EmptyState when zero blocks (D-08)", () => {
    const html = renderToStaticMarkup(<Blogs />);
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside a responsive 1→3-up grid", () => {
    const html = renderToStaticMarkup(
      <Blogs renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("child");
  });

  it("blogsSettingsSchema has 4 entries [heading,subtitle,ctaLabel,ctaUrl]", () => {
    expect(blogsSettingsSchema).toHaveLength(4);
    const ids = blogsSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "subtitle", "ctaLabel", "ctaUrl"]);
    const ctaUrlSetting = blogsSettingsSchema.find((s) => s.id === "ctaUrl");
    expect(ctaUrlSetting?.type).toBe("url");
  });
});

describe("Blogs registry", () => {
  it("blogs slot exposes the promoted _blog-card global block in its blocks allow-list", () => {
    const cfg = sectionBlocksConfig.blogs;
    expect(cfg.blocks).toContainEqual({ type: "_blog-card" });
  });

  it("blogs references the private global _blog-card and retains the deprecated blog-card local for back-compat (D-07 promotion)", () => {
    const cfg = sectionBlocksConfig.blogs;
    // blog-card was PROMOTED to the private global `_blog-card` (08-02): the
    // block now lives in the global maps and both `blogs` and `blog-list`
    // reference it explicitly (the leading `_` keeps it out of `@theme`).
    expect(cfg.blocks).toContainEqual({ type: "_blog-card" });
    expect(typeof blocksComponents["_blog-card"]).toBe("function");
    expect(blockSettingsSchemas["_blog-card"]).toBeDefined();
    // The legacy `blog-card` local entry is RETAINED (deprecated) so saved
    // instances still render/delete — mirrors the promo-banner precedent.
    expect(
      cfg.localBlocks?.some((b) => b.type === "blog-card"),
    ).toBe(true);
  });

  it("blogs caps the slot at 6 blocks (D-09)", () => {
    const cfg = sectionBlocksConfig.blogs;
    expect(cfg.maxBlocks).toBe(6);
  });
});

describe("BlogList registry", () => {
  it("blog-list slot offers the shared _blog-card global block", () => {
    const cfg = sectionBlocksConfig["blog-list"];
    expect(cfg.blocks).toContainEqual({ type: "_blog-card" });
  });

  it("blog-list caps the slot at 12 blocks and has no section-local blocks", () => {
    const cfg = sectionBlocksConfig["blog-list"];
    expect(cfg.maxBlocks).toBe(12);
    expect(cfg.localBlocks).toBeUndefined();
  });

  it("_blog-card is private (leading _) so it is not exposed via @theme", () => {
    const cfg = sectionBlocksConfig["blog-list"];
    const key = cfg.blocks[0].type;
    expect(key.startsWith("_")).toBe(true);
    expect(key).toBe("_blog-card");
  });

  it("registers blog-list across the section maps", () => {
    expect(typeof sectionsComponents["blog-list"]).toBe("function");
    expect(sectionSettingsSchemas["blog-list"]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Sucursales live filter — jsdom regression coverage (CR-01).
//
// The section's effects never run under renderToStaticMarkup (vitest env is
// `node`), so the filter's END-TO-END behavior stays UAT-only. What IS testable,
// and is where the CR-01 defect lived, are the two pure DOM helpers the filter
// delegates to. These build the exact customizer tree src/lib/blocks-slot.tsx
// documents — list > slot[style="display: contents"] > per-block wrapper > card
// — and drive the REAL exported functions against it (same JSDOM-by-hand idiom
// as test/registration-contract.test.ts; the suite has no global DOM).
// ---------------------------------------------------------------------------

// n cards, each in its own host wrapper, inside a display:contents host slot.
// `queryless` lists card indexes that carry NO data-branch-query — what a Branch
// emits when the merchant clears both name and mapQuery (WR-05).
const customizerList = (cards: number, queryless: number[] = []) => {
  const wrappers = Array.from({ length: cards }, (_, i) => {
    const query = queryless.includes(i) ? "" : ` data-branch-query="q${i}"`;
    return `<div data-host-wrapper="${i}"><div data-branch-card=""${query} data-branch-name="n${i}"></div></div>`;
  }).join("");
  const dom = new JSDOM(
    `<!doctype html><html><body><div class="fx-branch-list">` +
      `<div data-host-slot style="display: contents">${wrappers}</div>` +
      `</div></body></html>`,
  );
  const doc = dom.window.document;
  const q = (sel: string) =>
    doc.querySelector(sel) as unknown as HTMLElement | null;
  return {
    list: q(".fx-branch-list") as HTMLElement,
    slot: q("[data-host-slot]") as HTMLElement,
    wrapper: (i: number) => q(`[data-host-wrapper="${i}"]`) as HTMLElement,
    card: (i: number) =>
      q(`[data-host-wrapper="${i}"] [data-branch-card]`) as HTMLElement,
  };
};

describe("Sucursales filter helpers (jsdom)", () => {
  it("never climbs onto the host's display:contents slot, even with ONE card", () => {
    // The single-card case is what defeated the old "exactly one branch card"
    // stop condition: the slot also contains exactly one card.
    const { list, slot, wrapper, card } = customizerList(1);
    const target = resolveHideTarget(card(0), list);
    expect(target).toBe(wrapper(0));
    expect(target).not.toBe(slot);
  });

  it("stops at the per-block wrapper with several cards", () => {
    const { list, wrapper, card } = customizerList(3);
    expect(resolveHideTarget(card(1), list)).toBe(wrapper(1));
  });

  it("resolves to the card itself when published (no host wrappers)", () => {
    const dom = new JSDOM(
      `<!doctype html><html><body><div class="fx-branch-list">` +
        `<div data-branch-card="" data-branch-query="a"></div>` +
        `<div data-branch-card="" data-branch-query="b"></div>` +
        `</div></body></html>`,
    );
    const doc = dom.window.document;
    const list = doc.querySelector(".fx-branch-list") as unknown as HTMLElement;
    const card = doc.querySelector(
      '[data-branch-query="a"]',
    ) as unknown as HTMLElement;
    expect(resolveHideTarget(card, list)).toBe(card);
  });

  it("counts a content-less sibling card, so the walk cannot over-climb (WR-05)", () => {
    // Card 1 has no data-branch-query (merchant cleared name AND mapQuery).
    // Counting query-bearing roots would see "exactly one" inside the SLOT and
    // send card 0's walk all the way up to it — hiding card 0 would then hide
    // the whole list. Counting data-branch-card roots keeps it at the wrapper.
    const { list, slot, wrapper, card } = customizerList(2, [1]);
    expect(card(1).hasAttribute("data-branch-query")).toBe(false);
    const target = resolveHideTarget(card(0), list);
    expect(target).toBe(wrapper(0));
    expect(target).not.toBe(slot);
    // …and the content-less card is itself an addressable hide target.
    expect(resolveHideTarget(card(1), list)).toBe(wrapper(1));
  });

  it("setHidden(el, false) writes NOTHING to an element it never hid", () => {
    // THE CR-01 INVARIANT. The empty-query pass runs on mount and calls this
    // for every card; a blanket `style.display = ""` would erase the host's
    // inline display: contents and permanently break the list layout.
    const { slot, wrapper } = customizerList(1);
    setHidden(slot, false);
    expect(slot.style.display).toBe("contents");
    expect(slot.getAttribute("style")).toContain("display: contents");
    setHidden(wrapper(0), false);
    expect(wrapper(0).getAttribute("style") ?? "").not.toContain("display");
  });

  it("restores the ORIGINAL inline display, not a blank one", () => {
    const { slot } = customizerList(1);
    setHidden(slot, true);
    expect(slot.style.display).toBe("none");
    setHidden(slot, false);
    expect(slot.style.display).toBe("contents");
  });

  it("survives repeated hide passes without poisoning the recorded value", () => {
    const { slot } = customizerList(1);
    setHidden(slot, true);
    setHidden(slot, true);
    setHidden(slot, true);
    setHidden(slot, false);
    expect(slot.style.display).toBe("contents");
    // …and a fresh cycle still restores correctly after the record was cleared.
    setHidden(slot, true);
    setHidden(slot, false);
    expect(slot.style.display).toBe("contents");
  });

  it("round-trips an element that had no inline display at all", () => {
    const { wrapper } = customizerList(2);
    setHidden(wrapper(0), true);
    expect(wrapper(0).style.display).toBe("none");
    setHidden(wrapper(0), false);
    expect(wrapper(0).style.display).toBe("");
  });
});
