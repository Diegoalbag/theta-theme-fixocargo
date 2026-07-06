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

  it("faqItemSettingsSchema has 3 entries [question, answer, isExpanded]", () => {
    expect(faqItemSettingsSchema).toHaveLength(3);
    const ids = faqItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["question", "answer", "isExpanded"]);
    const answer = faqItemSettingsSchema.find((s) => s.id === "answer");
    expect(answer?.type).toBe("richtext");
    const isExpanded = faqItemSettingsSchema.find((s) => s.id === "isExpanded");
    expect(isExpanded?.type).toBe("checkbox");
    expect(isExpanded?.default).toBe(false);
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
