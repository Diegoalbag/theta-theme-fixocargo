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
import { ToolsBar, toolsBarSettingsSchema } from "@/sections/ToolsBar";
import { ToolPill, toolPillSettingsSchema } from "@/blocks/ToolPill";

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

  it("renders provided blocks inside a .blaze-track when renderBlocks returns an array (published)", () => {
    // Published renderBlocks ignores the slot args and returns a bare array;
    // Hero wraps it in its own .blaze-track.
    const html = renderToStaticMarkup(
      <Hero renderBlocks={() => [<div key="s">SlideContent</div>]} />,
    );
    expect(html).toContain("SlideContent");
    expect(html).toContain("blaze-track");
  });

  it("uses the customizer slot wrapper itself as the .blaze-track (display:contents -> flex)", () => {
    // Mimic the host customizer SlotRenderer: a single element that spreads the
    // caller's style AFTER display:contents and applies the caller's className.
    const slot = (props?: {
      style?: React.CSSProperties;
      className?: string;
    }) => (
      <div style={{ display: "contents", ...props?.style }} className={props?.className}>
        <div>CustomizerSlide</div>
      </div>
    );
    const html = renderToStaticMarkup(<Hero renderBlocks={slot} />);
    expect(html).toContain("CustomizerSlide");
    expect(html).toContain("blaze-track");
    // display:flex overrides display:contents so the wrapper is a real track.
    expect(html).toContain("flex");
  });

  it("renders the Blaze slider scaffold and functional prev/next/pagination controls", () => {
    const html = renderToStaticMarkup(
      <Hero renderBlocks={() => [<div key="s">S</div>]} />,
    );
    expect(html).toContain("blaze-slider");
    expect(html).toContain("blaze-container");
    expect(html).toContain("blaze-track-container");
    expect(html).toContain("blaze-prev");
    expect(html).toContain("blaze-next");
    expect(html).toContain("blaze-pagination");
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

describe("ToolsBar", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<ToolsBar />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default EmptyState when zero blocks (D-10)", () => {
    const html = renderToStaticMarkup(<ToolsBar />);
    // Published-zero falls through to the default <EmptyState /> ("Sin
    // elementos"). The plan prose said "Arrastra bloques aquí", but that
    // string is the customizer drop-affordance hint that only appears in
    // BlocksSlot's as-is branch (when blocks are present), not at
    // published-zero — see 03-01/03-02 precedent and src/lib/empty-state.tsx.
    // D-10 only requires ToolsBar keeps the default EmptyState (does NOT pass
    // empty={null}).
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside an equal-width grid row wrapper", () => {
    const html = renderToStaticMarkup(
      <ToolsBar
        renderBlocks={() => [
          <a key="p" href="#">
            PillContent
          </a>,
        ]}
      />,
    );
    expect(html).toContain("PillContent");
    expect(html).toContain("grid");
    // desktop: equal-width columns flowing in a single row
    expect(html).toContain("md:auto-cols-fr");
    expect(html).toContain("md:grid-flow-col");
  });

  it("toolsBarSettingsSchema has exactly 0 entries", () => {
    expect(toolsBarSettingsSchema).toHaveLength(0);
  });
});

describe("ToolPill", () => {
  it("renders without crash with empty props (default label)", () => {
    const html = renderToStaticMarkup(<ToolPill />);
    expect(typeof html).toBe("string");
    expect(html).toContain("Rastrea");
  });

  it("is a real brand-yellow anchor pill with a navy IconChip badge", () => {
    const html = renderToStaticMarkup(<ToolPill />);
    expect(html).toContain("bg-brand-yellow");
    expect(html).toContain("bg-brand-navy");
    expect(html).toContain("text-brand-yellow");
  });

  it("resolves a known icon and renders its glyph (svg)", () => {
    const html = renderToStaticMarkup(
      <ToolPill icon="map-pin" label="Sucursales" />,
    );
    expect(html).toContain("Sucursales");
    expect(html).toContain("<svg");
  });

  it("falls back to the default glyph on an unknown icon without throwing (QA-03)", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<ToolPill icon="totally-unknown" />);
    }).not.toThrow();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("<svg");
  });

  it("renders the url as an anchor href", () => {
    const html = renderToStaticMarkup(<ToolPill url="/rastrea" />);
    expect(html).toContain('href="/rastrea"');
  });

  it("toolPillSettingsSchema has 3 entries [label,url,icon] with a 6-option icon select", () => {
    expect(toolPillSettingsSchema).toHaveLength(3);
    const ids = toolPillSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["label", "url", "icon"]);
    const iconSetting = toolPillSettingsSchema.find((s) => s.id === "icon");
    expect(iconSetting?.type).toBe("select");
    expect(iconSetting?.options).toHaveLength(6);
  });
});
