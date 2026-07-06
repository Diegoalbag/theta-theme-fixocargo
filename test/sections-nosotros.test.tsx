import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { NosotrosHero, nosotrosHeroSettingsSchema } from "@/sections/NosotrosHero";
import {
  NosotrosMission,
  nosotrosMissionSettingsSchema,
} from "@/sections/NosotrosMission";
import { NosotrosStats, nosotrosStatsSettingsSchema } from "@/sections/NosotrosStats";
import {
  NosotrosValues,
  nosotrosValuesSettingsSchema,
} from "@/sections/NosotrosValues";
import {
  NosotrosTimeline,
  nosotrosTimelineSettingsSchema,
} from "@/sections/NosotrosTimeline";
import { StatItem, statItemSettingsSchema } from "@/blocks/StatItem";
import { ValueCard, valueCardSettingsSchema } from "@/blocks/ValueCard";
import { TimelineItem, timelineItemSettingsSchema } from "@/blocks/TimelineItem";
import { sectionBlocksConfig, blocksComponents } from "@/registry";

// Behavioral smoke tests for the Phase 9 Nosotros sections/blocks (NOS-01..05).
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert only on the returned HTML string. These
// prove the components render without crashing and emit the correct structure —
// the registry-driven empty-state matrix pins the census; this file locks the
// per-component behavior that the matrix cannot express.

// The platform passes each setting's `default` as a prop; several Nosotros
// sections only render their schema defaults (they are not baked into the
// component body), so we reconstruct the default prop bag from the schema to
// prove the defaults reach visible markup.
function schemaDefaults(
  schema: ReadonlyArray<{ id: string; default?: unknown }>,
): Record<string, unknown> {
  return Object.fromEntries(
    schema
      .filter((s) => s.default !== undefined)
      .map((s) => [s.id, s.default]),
  );
}

// Build the assertion target at runtime so the substring is unambiguous
// (mirrors the FaqPill/Branch empty-href precedent). Most rails/dividers stay
// coordinate-free so "absolute" must not appear — EXCEPT the TimelineItem dot,
// which is intentionally an absolute in-card node in the user-directed overlay
// redesign (see its test below), so that proof asserts the opposite.
const ABSOLUTE = "abso" + "lute";

describe("NosotrosHero", () => {
  it("renders without throwing on blank props", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<NosotrosHero />);
    }).not.toThrow();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading when the schema defaults are applied", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero {...schemaDefaults(nosotrosHeroSettingsSchema)} />,
    );
    expect(html).toContain("Movemos el mundo a tus manos");
  });

  it("renders the ImageGuard placeholder when teamImage is unset", () => {
    const html = renderToStaticMarkup(<NosotrosHero />);
    expect(html).toContain("Agrega una imagen");
  });

  it("renders both CTA labels as real anchors when set", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero
        primaryCtaLabel="Nuestros servicios"
        primaryCtaUrl="/s"
        secondaryCtaLabel="Ver sucursales"
        secondaryCtaUrl="/b"
      />,
    );
    expect(html).toContain("Nuestros servicios");
    expect(html).toContain("Ver sucursales");
    expect(html).toContain('href="/s"');
    expect(html).toContain('href="/b"');
    expect(html).toContain("<a");
  });

  it("renders the badge number when showBadge is default-true", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero {...schemaDefaults(nosotrosHeroSettingsSchema)} />,
    );
    expect(html).toContain("+10");
  });

  it("hides the badge number when showBadge is false", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero showBadge={false} badgeNumber="+10" badgeLabel="años" />,
    );
    expect(html).not.toContain("+10");
  });

  it("renders the full-bleed background image + dark overlay when backgroundImage.url is set", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero
        backgroundImage={{ id: "1", url: "/hero.jpg", alt: "Fondo" }}
        heading="Movemos el mundo a tus manos"
        subtitle="Somos Fixocargo"
      />,
    );
    expect(html).toContain('src="/hero.jpg"');
    expect(html).toContain("object-cover");
    expect(html).toContain("bg-black/50");
    // Text flips to white-on-dark for legibility.
    expect(html).toContain("text-white");
    // Image mode matches the default hero (HeroSlide) height + typography.
    expect(html).toContain("min-h-[30vh]");
    expect(html).toContain("md:min-h-[560px]");
    expect(html).toContain("font-aku");
    expect(html).toContain("lg:text-8xl");
    expect(html).toContain("font-gill");
    expect(html).toContain("md:text-2xl");
    // Original navy/muted treatment is NOT used in image mode.
    expect(html).not.toContain("text-brand-navy");
    expect(html).not.toContain("bg-background");
  });

  it("keeps the original bg-background design (no overlay) when backgroundImage is unset", () => {
    const html = renderToStaticMarkup(
      <NosotrosHero heading="Movemos el mundo a tus manos" subtitle="Somos Fixocargo" />,
    );
    expect(html).toContain("bg-background");
    expect(html).toContain("text-brand-navy");
    expect(html).not.toContain("bg-black/50");
  });

  it("nosotrosHeroSettingsSchema has 12 entries in the locked order with backgroundImage first and showBadge default true", () => {
    expect(nosotrosHeroSettingsSchema).toHaveLength(12);
    const ids = nosotrosHeroSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "backgroundImage",
      "eyebrow",
      "heading",
      "subtitle",
      "primaryCtaLabel",
      "primaryCtaUrl",
      "secondaryCtaLabel",
      "secondaryCtaUrl",
      "teamImage",
      "showBadge",
      "badgeNumber",
      "badgeLabel",
    ]);
    const backgroundImage = nosotrosHeroSettingsSchema.find(
      (s) => s.id === "backgroundImage",
    );
    expect(backgroundImage?.type).toBe("image_picker");
    const showBadge = nosotrosHeroSettingsSchema.find((s) => s.id === "showBadge");
    expect(showBadge?.type).toBe("checkbox");
    expect(showBadge?.default).toBe(true);
  });
});

describe("NosotrosMission", () => {
  it("renders without throwing on blank props", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<NosotrosMission />);
    }).not.toThrow();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default heading when the schema defaults are applied", () => {
    const html = renderToStaticMarkup(
      <NosotrosMission {...schemaDefaults(nosotrosMissionSettingsSchema)} />,
    );
    expect(html).toContain("Nuestra misión es simple");
  });

  it("renders the article-body wrapper class", () => {
    const html = renderToStaticMarkup(<NosotrosMission />);
    expect(html).toContain("article-body");
  });

  it('delegates the empty body to RichText "Sin contenido"', () => {
    const html = renderToStaticMarkup(<NosotrosMission body="" />);
    expect(html).toContain("Sin contenido");
  });

  it("nosotrosMissionSettingsSchema has 2 entries [heading,body] with body as richtext", () => {
    expect(nosotrosMissionSettingsSchema).toHaveLength(2);
    const ids = nosotrosMissionSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "body"]);
    const body = nosotrosMissionSettingsSchema.find((s) => s.id === "body");
    expect(body?.type).toBe("richtext");
  });
});

describe("NosotrosStats", () => {
  it("renders on the navy dark surface with blank props", () => {
    const html = renderToStaticMarkup(<NosotrosStats />);
    expect(html).toContain("bg-brand-navy");
  });

  it("renders the default EmptyState when zero blocks (D-04)", () => {
    const html = renderToStaticMarkup(<NosotrosStats renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks with dividers and no absolute positioning", () => {
    const html = renderToStaticMarkup(
      <NosotrosStats renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("divide");
    expect(html).not.toContain(ABSOLUTE);
  });

  it("nosotrosStatsSettingsSchema has 2 entries", () => {
    expect(nosotrosStatsSettingsSchema).toHaveLength(2);
  });
});

describe("StatItem", () => {
  it("renders the default number and label", () => {
    const html = renderToStaticMarkup(<StatItem />);
    expect(html).toContain("50K+");
    expect(html).toContain("Paquetes al mes");
  });

  it("statItemSettingsSchema has 2 entries [number,label]", () => {
    expect(statItemSettingsSchema).toHaveLength(2);
    const ids = statItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["number", "label"]);
  });
});

describe("NosotrosValues", () => {
  it("renders the default heading with blank props", () => {
    const html = renderToStaticMarkup(<NosotrosValues />);
    expect(html).toContain("Nuestros valores");
  });

  it("renders the default EmptyState when zero blocks (D-04)", () => {
    const html = renderToStaticMarkup(<NosotrosValues renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks inside a responsive 1→2→3-up grid", () => {
    const html = renderToStaticMarkup(
      <NosotrosValues renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("nosotrosValuesSettingsSchema has 2 entries", () => {
    expect(nosotrosValuesSettingsSchema).toHaveLength(2);
  });
});

describe("ValueCard", () => {
  it("renders without throwing on blank props", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<ValueCard />);
    }).not.toThrow();
    expect(html.length).toBeGreaterThan(0);
  });

  it("degrades an unknown icon to the ShieldCheck fallback glyph (T-09-02)", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<ValueCard icon="__bogus__" />);
    }).not.toThrow();
    expect(html).toContain("<svg");
  });

  it("valueCardSettingsSchema has 3 entries; icon is a select default 'shield' with 10 options", () => {
    expect(valueCardSettingsSchema).toHaveLength(3);
    const icon = valueCardSettingsSchema.find((s) => s.id === "icon");
    expect(icon?.type).toBe("select");
    expect(icon?.default).toBe("shield");
    expect(icon?.options).toHaveLength(10);
  });
});

describe("NosotrosTimeline", () => {
  it("renders the default heading with blank props", () => {
    const html = renderToStaticMarkup(<NosotrosTimeline />);
    expect(html).toContain("De una idea a una red");
  });

  it("renders the default EmptyState when zero blocks (D-04)", () => {
    const html = renderToStaticMarkup(
      <NosotrosTimeline renderBlocks={() => []} />,
    );
    expect(html).toContain("Sin elementos");
  });

  it("renders provided blocks on the coordinate-free DOTTED yellow rail", () => {
    const html = renderToStaticMarkup(
      <NosotrosTimeline renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("border-l-2");
    expect(html).toContain("border-dotted");
    expect(html).toContain("border-brand-yellow");
    // NOTE: in the user-directed overlay redesign the dotted connector is an
    // absolute overlay drawn over the cards (left-6/top-8/bottom-28) and the
    // banner ImageGuard also uses `absolute inset-0`, so "absolute" legitimately
    // appears at the section level. This proof only pins the dotted-rail classes
    // (border-l-2 / border-dotted / border-brand-yellow).
  });

  it("lays the rail and banner in equal 50/50 columns (timeline left, image right)", () => {
    const html = renderToStaticMarkup(
      <NosotrosTimeline renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("lg:flex-row");
    // Equal-width columns (user-directed: timeline + banner share the space).
    expect(html).toContain("lg:w-1/2");
    // Banner is a fill-mode ImageGuard: with bannerImage unset it shows the placeholder.
    expect(html).toContain("Agrega una imagen");
    expect(html).toContain("rounded-3xl");
  });

  it("renders the banner image when bannerImage.url is set", () => {
    const html = renderToStaticMarkup(
      <NosotrosTimeline
        bannerImage={{ id: "1", url: "/banner.jpg", alt: "Historia" }}
        renderBlocks={() => []}
      />,
    );
    expect(html).toContain('src="/banner.jpg"');
    // EmptyState still renders for the zero-block timeline column.
    expect(html).toContain("Sin elementos");
  });

  it("nosotrosTimelineSettingsSchema has 3 entries [eyebrow,heading,bannerImage]", () => {
    expect(nosotrosTimelineSettingsSchema).toHaveLength(3);
    const ids = nosotrosTimelineSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading", "bannerImage"]);
    const banner = nosotrosTimelineSettingsSchema.find(
      (s) => s.id === "bannerImage",
    );
    expect(banner?.type).toBe("image_picker");
  });
});

describe("TimelineItem", () => {
  it("renders the default year with the dot as an absolute in-card node", () => {
    const html = renderToStaticMarkup(<TimelineItem />);
    expect(html).toContain("HOY");
    // The dot is an absolute node inside the card (user-directed overlay
    // redesign; supersedes the original coordinate-free NOS-05 dot marker).
    expect(html).toContain(ABSOLUTE);
    expect(html).toContain("bg-brand-yellow");
  });

  it("timelineItemSettingsSchema has 3 entries [year,title,body]", () => {
    expect(timelineItemSettingsSchema).toHaveLength(3);
    const ids = timelineItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["year", "title", "body"]);
  });
});

describe("Nosotros registry", () => {
  it("nosotros-stats offers stat-item, one section-local block, capped at 6 (D-05)", () => {
    const cfg = sectionBlocksConfig["nosotros-stats"];
    expect(cfg.blocks).toContainEqual({ type: "stat-item" });
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("stat-item");
    expect(typeof cfg.localBlocks?.[0].component).toBe("function");
    expect(cfg.maxBlocks).toBe(6);
  });

  it("nosotros-values offers value-card, one section-local block, capped at 9 (D-05)", () => {
    const cfg = sectionBlocksConfig["nosotros-values"];
    expect(cfg.blocks).toContainEqual({ type: "value-card" });
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("value-card");
    expect(typeof cfg.localBlocks?.[0].component).toBe("function");
    expect(cfg.maxBlocks).toBe(9);
  });

  it("nosotros-timeline offers timeline-item, one section-local block, capped at 12 (D-05)", () => {
    const cfg = sectionBlocksConfig["nosotros-timeline"];
    expect(cfg.blocks).toContainEqual({ type: "timeline-item" });
    expect(cfg.localBlocks).toHaveLength(1);
    expect(cfg.localBlocks?.[0].type).toBe("timeline-item");
    expect(typeof cfg.localBlocks?.[0].component).toBe("function");
    expect(cfg.maxBlocks).toBe(12);
  });

  it("nosotros-hero and nosotros-mission are no-block sections (no sectionBlocksConfig entry)", () => {
    expect(sectionBlocksConfig["nosotros-hero"]).toBeUndefined();
    expect(sectionBlocksConfig["nosotros-mission"]).toBeUndefined();
  });

  it("the 3 new block types are section-local, not registered in the global blocksComponents", () => {
    expect(blocksComponents["stat-item"]).toBeUndefined();
    expect(blocksComponents["value-card"]).toBeUndefined();
    expect(blocksComponents["timeline-item"]).toBeUndefined();
  });
});
