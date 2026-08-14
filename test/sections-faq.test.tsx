import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Faq, faqSettingsSchema } from "@/sections/Faq";
import { FaqItem, faqItemSettingsSchema } from "@/blocks/FaqItem";
import { sectionBlocksConfig, blocksComponents } from "@/registry";

// Behavioral smoke tests for the quick-task FAQ Q&A dropdowns (260706-h3w).
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert only on the returned HTML string. These
// prove the components render without crashing and emit the correct structure —
// the registry-driven empty-state matrix pins the census; this file locks the
// per-component behavior that the matrix cannot express.

describe("Faq section", () => {
  it("renders the default eyebrow + heading on blank props", () => {
    const html = renderToStaticMarkup(<Faq />);
    expect(html).toContain("Preguntas frecuentes");
    expect(html).toContain("Resolvemos tus dudas");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<Faq renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside a centered max-w-3xl flex-col stack", () => {
    const html = renderToStaticMarkup(
      <Faq renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("max-w-3xl");
    expect(html).toContain("flex-col");
  });

  it("renders nothing for the header when eyebrow/heading are blank (guarded)", () => {
    const html = renderToStaticMarkup(<Faq eyebrow="" heading="" />);
    expect(html).not.toContain("Preguntas frecuentes");
    expect(html).not.toContain("Resolvemos tus dudas");
  });

  it("faqSettingsSchema has 2 entries [eyebrow, heading], both text", () => {
    expect(faqSettingsSchema).toHaveLength(2);
    const ids = faqSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading"]);
    expect(faqSettingsSchema.every((s) => s.type === "text")).toBe(true);
  });
});

describe("FaqItem", () => {
  it("renders without throwing and emits non-empty markup on blank props", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<FaqItem />);
    }).not.toThrow();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the question text", () => {
    const html = renderToStaticMarkup(<FaqItem question="¿Cómo rastreo?" />);
    expect(html).toContain("¿Cómo rastreo?");
  });

  it("root <details> carries name=\"faq\" and is open only when isExpanded", () => {
    // NOTE: assert the `open=""` ATTRIBUTE, not the bare word "open" — the
    // chevron class `group-open:rotate-180` contains "open" in both states.
    const collapsed = renderToStaticMarkup(<FaqItem question="Q" />);
    expect(collapsed).toContain('name="faq"');
    expect(collapsed).not.toContain('open=""');

    const expanded = renderToStaticMarkup(<FaqItem question="Q" isExpanded />);
    expect(expanded).toContain('name="faq"');
    expect(expanded).toContain('open=""');
  });

  it("renders a group-open chevron", () => {
    const html = renderToStaticMarkup(<FaqItem question="Q" />);
    expect(html).toContain("group-open:rotate-180");
  });

  it("renders the answer through the single audited RichText sink", () => {
    const html = renderToStaticMarkup(
      <FaqItem question="Q" answer="<p>Hola</p>" />,
    );
    expect(html).toContain("article-body");
    expect(html).toContain("Hola");
  });

  it("renders NOTHING for a blank answer (guarded, no 'Sin contenido')", () => {
    const html = renderToStaticMarkup(<FaqItem question="Q" answer="" />);
    expect(html).not.toContain("Sin contenido");
  });

  it("faqItemSettingsSchema has 4 entries [question, answer, isExpanded, anchorId]", () => {
    expect(faqItemSettingsSchema).toHaveLength(4);
    const ids = faqItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["question", "answer", "isExpanded", "anchorId"]);
    const answer = faqItemSettingsSchema.find((s) => s.id === "answer");
    expect(answer?.type).toBe("richtext");
    const isExpanded = faqItemSettingsSchema.find((s) => s.id === "isExpanded");
    expect(isExpanded?.type).toBe("checkbox");
    expect(isExpanded?.default).toBe(false);
    const anchorId = faqItemSettingsSchema.find((s) => s.id === "anchorId");
    expect(anchorId?.type).toBe("text");
    expect(anchorId?.default).toBe("");
  });
});

// ---------------------------------------------------------------------------
// FAQ deep links (quick task 260814-a07).
//
// The open-on-hash BEHAVIOR is UAT-only and stated plainly rather than
// pretended away: effects never run under renderToStaticMarkup in the `node`
// test env, so nothing here executes the scroll, the auto-open, the sibling
// auto-close or the hashchange path. What IS covered is everything that
// behavior depends on — the rendered id, the normalizer being wired into the
// render path, and the structural proof that no selector is ever built.
// ---------------------------------------------------------------------------

describe("FaqItem — anchor id (260814-a07)", () => {
  it("renders NO id attribute at all on blank props (back-compat)", () => {
    // The single most important assertion in this task: it is what proves
    // every already-saved faq-item renders exactly as it does today.
    // safeAnchorId returns `undefined`, so React drops the attribute — an
    // empty-string anchor would emit id="" and this would go red.
    const html = renderToStaticMarkup(<FaqItem question="Q" />);
    expect(html).not.toContain("id=");
  });

  it("treats a whitespace-only anchor as absent", () => {
    const html = renderToStaticMarkup(<FaqItem question="Q" anchorId="   " />);
    expect(html).not.toContain("id=");
  });

  it("renders the anchor as an id on the root <details>", () => {
    const html = renderToStaticMarkup(<FaqItem question="Q" anchorId="q4" />);
    expect(html).toContain('id="q4"');
  });

  it("normalizes a messy merchant value on the way to the DOM", () => {
    // Proves safeAnchorId is wired into the RENDER path, not merely unit-tested
    // in isolation over in test/safe-anchor.test.ts.
    const html = renderToStaticMarkup(
      <FaqItem question="Q" anchorId="#  Envío 4 " />,
    );
    expect(html).toContain('id="envio-4"');
  });

  it("adds the scroll cushion only when anchored", () => {
    const anchored = renderToStaticMarkup(
      <FaqItem question="Q" anchorId="q4" />,
    );
    expect(anchored).toContain("scroll-mt-24");

    const plain = renderToStaticMarkup(<FaqItem question="Q" />);
    expect(plain).not.toContain("scroll-mt-24");
  });

  it("leaves an un-anchored item's class string byte-identical to today", () => {
    const html = renderToStaticMarkup(<FaqItem question="Q" />);
    expect(html).toContain(
      'class="group rounded-2xl border-2 border-transparent bg-card shadow-sm px-6 py-4 transition-colors open:border-brand-yellow"',
    );
  });

  it("builds no selector and no HTML sink from the merchant anchor", () => {
    // Structural, not aspirational: the effect resolves its target through its
    // OWN useRef, so the CR-02 class of bug (a merchant string interpolated
    // into a live selector) is impossible rather than merely avoided.
    //
    // Comment-stripping FIRST is mandatory — the file's own header prose
    // explains the convention using these very words, so a raw scan would
    // false-positive on the documentation of the rule. Same two-replace `strip`
    // idiom as test/static-audit.test.tsx.
    const strip = (code: string): string =>
      code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const code = strip(
      readFileSync(
        resolve(__dirname, "../src/blocks/FaqItem/FaqItem.tsx"),
        "utf-8",
      ),
    );

    expect(code).not.toMatch(/querySelector|getElementById|getElementsBy/);
    expect(code).not.toMatch(/CSS\.escape/);
    expect(code).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML/);
    // Blocks are stateless — React state stays forbidden.
    expect(code).not.toMatch(/useState/);
    // And the normalizer really is the thing standing between the merchant
    // value and the DOM.
    expect(code).toMatch(/safeAnchorId/);
  });
});

describe("Faq registry", () => {
  it("faq offers faq-item, one section-local block, capped at 12 (D-07)", () => {
    const cfg = sectionBlocksConfig["faq"];
    expect(cfg.blocks).toContainEqual({ type: "faq-item" });
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("faq-item");
    expect(typeof cfg.localBlocks?.[0].component).toBe("function");
    expect(cfg.maxBlocks).toBe(12);
  });

  it("faq-item is section-local, not registered in the global blocksComponents", () => {
    expect(blocksComponents["faq-item"]).toBeUndefined();
  });
});
