import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Hero, heroSettingsSchema } from "@/sections/Hero";
import { HeroSlide, heroSlideSettingsSchema } from "@/blocks/HeroSlide";
import {
  DireccionCards,
  direccionCardsSettingsSchema,
} from "@/sections/DireccionCards";
import { AddressCard, addressCardSettingsSchema } from "@/blocks/AddressCard";

// Render-smoke tests for the Phase 3 above-the-fold sections/blocks.
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert on the returned HTML string. These tests
// prove the components render without crashing and emit the correct structure —
// not that they look correct visually. Plans 02 and 03 APPEND their own describe
// blocks to this file.
describe("Hero", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders role=region with the carousel aria-label", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain('role="region"');
    expect(html).toContain("Carrusel destacado");
  });

  it("renders the default EmptyState when zero blocks (D-10)", () => {
    const html = renderToStaticMarkup(<Hero />);
    // Published-zero falls through to the default <EmptyState /> ("Sin
    // elementos"). The "Arrastra bloques aquí" string is the customizer
    // drop-affordance hint that only appears in BlocksSlot's as-is branch
    // (when blocks are present), not at published-zero — see STATE.md
    // decision and src/lib/empty-state.tsx. D-10 only requires that Hero
    // keeps the default EmptyState (does NOT pass empty={null}).
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks when renderBlocks returns blocks", () => {
    const html = renderToStaticMarkup(
      <Hero renderBlocks={() => [<div key="s">SlideContent</div>]} />,
    );
    expect(html).toContain("SlideContent");
  });

  it("heroSettingsSchema has exactly 0 entries", () => {
    expect(heroSettingsSchema).toHaveLength(0);
  });
});

describe("HeroSlide", () => {
  it("renders without crash with empty props (heading default)", () => {
    const html = renderToStaticMarkup(<HeroSlide />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Transportamos");
  });

  it("renders a navy placeholder and no background img when image unset", () => {
    const html = renderToStaticMarkup(<HeroSlide />);
    expect(html).toContain("bg-brand-navy");
  });

  it("renders an object-cover background img when backgroundImage.url is set", () => {
    const html = renderToStaticMarkup(
      <HeroSlide backgroundImage={{ id: "x", url: "https://e/x.jpg" }} />,
    );
    expect(html).toContain("object-cover");
  });

  it("renders a CTA anchor with href when ctaLabel/ctaUrl are set", () => {
    const html = renderToStaticMarkup(
      <HeroSlide ctaLabel="Buscar" ctaUrl="/buscar" />,
    );
    expect(html).toContain('href="/buscar"');
  });

  it("heroSlideSettingsSchema has exactly 5 entries with the specified ids", () => {
    expect(heroSlideSettingsSchema).toHaveLength(5);
    const ids = heroSlideSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "backgroundImage",
      "heading",
      "subtitle",
      "ctaLabel",
      "ctaUrl",
    ]);
  });
});

describe("DireccionCards", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<DireccionCards />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default EmptyState when zero blocks (D-10)", () => {
    const html = renderToStaticMarkup(<DireccionCards />);
    // Published-zero falls through to the default <EmptyState /> ("Sin
    // elementos"). The "Arrastra bloques aquí" string is the customizer
    // drop-affordance hint that only appears in BlocksSlot's as-is branch
    // (when blocks are present), not at published-zero — see 03-01-SUMMARY
    // and src/lib/empty-state.tsx. D-10 only requires DireccionCards keeps
    // the default EmptyState (does NOT pass empty={null}).
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside a grid wrapper", () => {
    const html = renderToStaticMarkup(
      <DireccionCards renderBlocks={() => [<div key="c">CardContent</div>]} />,
    );
    expect(html).toContain("CardContent");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("md:grid-cols-2");
  });

  it("direccionCardsSettingsSchema has exactly 0 entries", () => {
    expect(direccionCardsSettingsSchema).toHaveLength(0);
  });
});

describe("AddressCard", () => {
  it("renders without crash with empty props (default title)", () => {
    const html = renderToStaticMarkup(<AddressCard />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Dirección en Miami:");
  });

  it("renders a stateless copy button with the accessible label", () => {
    // Do NOT invoke onClick — navigator.clipboard is unavailable in node and
    // the handler never fires during static render (RESEARCH Pattern 4/Pitfall 4).
    const html = renderToStaticMarkup(<AddressCard />);
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Copiar dirección"');
  });

  it("renders a provided title", () => {
    const html = renderToStaticMarkup(
      <AddressCard title="Dirección en Madrid:" />,
    );
    expect(html).toContain("Dirección en Madrid:");
  });

  it("addressCardSettingsSchema has exactly 4 entries with the specified ids and no icon field (D-06)", () => {
    expect(addressCardSettingsSchema).toHaveLength(4);
    const ids = addressCardSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["title", "recipientLine", "address", "phone"]);
    expect(addressCardSettingsSchema.some((s) => s.id === "icon")).toBe(false);
  });
});
