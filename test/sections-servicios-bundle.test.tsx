import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  ServiciosHero,
  serviciosHeroSettingsSchema,
} from "@/sections/ServiciosHero";
import {
  ServiciosList,
  serviciosListSettingsSchema,
} from "@/sections/ServiciosList";
import { ServiceCard, serviceCardSettingsSchema } from "@/blocks/ServiceCard";
import {
  ProcesoEnvio,
  procesoEnvioSettingsSchema,
} from "@/sections/ProcesoEnvio";
import { ProcessStep, processStepSettingsSchema } from "@/blocks/ProcessStep";
import {
  ServiciosCta,
  serviciosCtaSettingsSchema,
} from "@/sections/ServiciosCta";
import { sectionBlocksConfig, blocksComponents } from "@/registry";

// Behavioral smoke tests for the quick-task FixoCargo "Servicios" page bundle
// (260707-etz). The vitest environment is `node` (no global document), so we
// render DOM-free with renderToStaticMarkup and assert only on the returned
// HTML string. These prove the components render without crashing and emit
// the correct structure — the registry-driven empty-state matrix pins the
// census; this file locks the per-component behavior that the matrix cannot
// express.

describe("ServiciosHero", () => {
  it("renders default kicker/headline/body and BOTH CTAs as real anchors", () => {
    const html = renderToStaticMarkup(<ServiciosHero />);
    expect(html).toContain("Courier en República Dominicana");
    expect(html).toContain("Nuestros Servicios");
    expect(html).toContain(
      "Del pick up en Estados Unidos a la entrega en tu puerta",
    );
    expect(html).toContain("Explora los servicios");
    expect(html).toContain("Cotiza tu envío");
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
  });

  it("always renders the 4 fixed tile labels regardless of arbitrary/unrelated props", () => {
    const html = renderToStaticMarkup(
      // @ts-expect-error — deliberately passing unrelated/arbitrary props to
      // prove the tiles are never props-driven.
      <ServiciosHero unrelatedProp="whatever" kicker="" headline="" body="" />,
    );
    expect(html).toContain("Carga Aérea");
    expect(html).toContain("Carga Marítima");
    expect(html).toContain("Delivery");
    expect(html).toContain("Aduanas");
  });

  it("has no renderBlocks prop and never renders the EmptyState marker", () => {
    const html = renderToStaticMarkup(
      // @ts-expect-error — ServiciosHero has no renderBlocks in its interface;
      // proving an extraneous renderBlocks prop is simply ignored.
      <ServiciosHero renderBlocks={() => []} />,
    );
    expect(html).not.toContain("Sin elementos");
  });

  it("without backgroundImage: renders bg-brand-navy on the section and NO <img> tag", () => {
    const html = renderToStaticMarkup(<ServiciosHero />);
    expect(html).toContain("bg-brand-navy");
    expect(html).not.toContain("<img");
  });

  it("with backgroundImage: renders a full-bleed <img> + bg-black/50 overlay behind content, section becomes relative overflow-hidden", () => {
    const html = renderToStaticMarkup(
      <ServiciosHero
        backgroundImage={{
          id: "1",
          url: "https://example.com/bg.jpg",
          alt: "Flota",
          width: 1600,
          height: 900,
        }}
      />,
    );
    expect(html).toContain('src="https://example.com/bg.jpg"');
    expect(html).toContain("object-cover");
    expect(html).toContain("bg-black/50");
    expect(html).toContain("relative overflow-hidden");
    // img + overlay must appear BEFORE the container div (behind content in paint order)
    const imgIndex = html.indexOf("<img");
    const containerIndex = html.indexOf("container");
    expect(imgIndex).toBeGreaterThan(-1);
    expect(imgIndex).toBeLessThan(containerIndex);
  });

  it("with backgroundImage: existing text/tile classes never flip (no color change)", () => {
    const html = renderToStaticMarkup(
      <ServiciosHero
        backgroundImage={{
          id: "1",
          url: "https://example.com/bg.jpg",
          alt: "Flota",
        }}
      />,
    );
    expect(html).toContain("text-brand-yellow");
    expect(html).toContain("text-white");
    expect(html).toContain("bg-brand-yellow");
    expect(html).toContain("bg-white/5");
  });

  it("serviciosHeroSettingsSchema has exactly 8 entries with backgroundImage first", () => {
    expect(serviciosHeroSettingsSchema).toHaveLength(8);
    const ids = serviciosHeroSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "backgroundImage",
      "kicker",
      "headline",
      "body",
      "primaryCtaLabel",
      "primaryCtaUrl",
      "secondaryCtaLabel",
      "secondaryCtaUrl",
    ]);
    const bgSetting = serviciosHeroSettingsSchema.find(
      (s) => s.id === "backgroundImage",
    );
    expect(bgSetting?.type).toBe("image_picker");
    expect(bgSetting?.label).toBe("Imagen de fondo");
  });
});

describe("ServiciosList", () => {
  it("renders the default eyebrow and heading", () => {
    const html = renderToStaticMarkup(<ServiciosList />);
    expect(html).toContain("Lo que hacemos");
    expect(html).toContain("Un servicio para cada envío");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<ServiciosList renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->2->3 grid", () => {
    const html = renderToStaticMarkup(
      <ServiciosList renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("serviciosListSettingsSchema has exactly 2 entries [eyebrow, heading]", () => {
    expect(serviciosListSettingsSchema).toHaveLength(2);
    const ids = serviciosListSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading"]);
  });
});

describe("ServiceCard", () => {
  it("renders the default title, body, and all 3 default bullet points with a check glyph each", () => {
    const html = renderToStaticMarkup(<ServiceCard />);
    expect(html).toContain("Envíos Nacionales");
    expect(html).toContain(
      "Envía paquetes entre nuestras sucursales a nivel nacional, sin necesidad de ser miembro.",
    );
    expect(html).toContain("Disponible en todas las sucursales");
    expect(html).toContain("Sin membresía requerida");
    expect(html).toContain("Solicítalo directo en el counter");
    expect(html).toContain("<svg");
  });

  it("renders exactly ONE bullet row when point2/point3 are blank (independently guarded)", () => {
    const html = renderToStaticMarkup(<ServiceCard point2="" point3="" />);
    expect(html).toContain("Disponible en todas las sucursales");
    expect(html).not.toContain("Sin membresía requerida");
    expect(html).not.toContain("Solicítalo directo en el counter");
  });

  it("falls back without throwing on an unknown icon value (QA-03)", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<ServiceCard icon="totally-unknown" />);
    }).not.toThrow();
    expect(html).toContain("<svg");
  });

  it("serviceCardSettingsSchema has exactly 6 entries with icon as a 9-option select", () => {
    expect(serviceCardSettingsSchema).toHaveLength(6);
    const ids = serviceCardSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["icon", "title", "body", "point1", "point2", "point3"]);
    const iconSetting = serviceCardSettingsSchema.find((s) => s.id === "icon");
    expect(iconSetting?.type).toBe("select");
    expect(iconSetting?.options).toHaveLength(9);
  });
});

describe("ProcesoEnvio", () => {
  it("renders the default eyebrow and heading", () => {
    const html = renderToStaticMarkup(<ProcesoEnvio />);
    expect(html).toContain("#FixoTeGuía");
    expect(html).toContain("¿Cómo funciona tu envío?");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<ProcesoEnvio renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->2->4 grid, with the section's connector line present", () => {
    const html = renderToStaticMarkup(
      <ProcesoEnvio renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-4");
    expect(html).toContain("bg-white/10");
  });

  it("renders the section's own connector line even at zero blocks (independent of block count)", () => {
    const html = renderToStaticMarkup(<ProcesoEnvio renderBlocks={() => []} />);
    expect(html).toContain("bg-white/10");
  });

  it("procesoEnvioSettingsSchema has exactly 2 entries [eyebrow, heading]", () => {
    expect(procesoEnvioSettingsSchema).toHaveLength(2);
    const ids = procesoEnvioSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading"]);
  });
});

describe("ProcessStep", () => {
  it("renders the default number, title, and body", () => {
    const html = renderToStaticMarkup(<ProcessStep />);
    expect(html).toContain(">1<");
    expect(html).toContain("Compra y prealerta");
    expect(html).toContain(
      "Compra en tus tiendas favoritas usando tu casillero de Miami y sube la prealerta en la app.",
    );
  });

  it("renders NO connector-line markup of its own", () => {
    const html = renderToStaticMarkup(<ProcessStep />);
    expect(html).not.toContain("border-dotted");
    expect(html).not.toContain("border-l");
    expect(html).not.toContain("border-r");
    expect(html).not.toContain("pointer-events-none");
  });

  it("processStepSettingsSchema has exactly 3 entries [number, title, body]", () => {
    expect(processStepSettingsSchema).toHaveLength(3);
    const ids = processStepSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["number", "title", "body"]);
  });
});

describe("ServiciosCta", () => {
  it("renders the default eyebrow/heading and BOTH banners' default kickers/headlines as PromoBanner anchor CTAs", () => {
    const html = renderToStaticMarkup(<ServiciosCta />);
    expect(html).toContain("Crece con nosotros");
    expect(html).toContain("Más que un courier");
    expect(html).toContain("Sé parte de Fixo Cargo");
    expect(html).toContain(
      "Si te interesa ser parte de nuestra red de franquicias",
    );
    expect(html).toContain("FX Logistics");
    expect(html).toContain(
      "¿Estás considerando reservar un espacio de almacenamiento?",
    );
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
  });

  it("has no renderBlocks prop and never renders the EmptyState marker", () => {
    const html = renderToStaticMarkup(
      // @ts-expect-error — ServiciosCta has no renderBlocks in its interface;
      // proving an extraneous renderBlocks prop is simply ignored.
      <ServiciosCta renderBlocks={() => []} />,
    );
    expect(html).not.toContain("Sin elementos");
  });

  it("serviciosCtaSettingsSchema has exactly 12 entries", () => {
    expect(serviciosCtaSettingsSchema).toHaveLength(12);
    const ids = serviciosCtaSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "eyebrow",
      "heading",
      "banner1Image",
      "banner1Kicker",
      "banner1Headline",
      "banner1CtaLabel",
      "banner1CtaUrl",
      "banner2Image",
      "banner2Kicker",
      "banner2Headline",
      "banner2CtaLabel",
      "banner2CtaUrl",
    ]);
  });
});

describe("registry wiring", () => {
  it("servicios-hero has NO sectionBlocksConfig entry (no-block section)", () => {
    expect(sectionBlocksConfig["servicios-hero"]).toBeUndefined();
  });

  it("servicios-cta has NO sectionBlocksConfig entry (no-block section)", () => {
    expect(sectionBlocksConfig["servicios-cta"]).toBeUndefined();
  });

  it("servicios-list offers service-card as a section-local block, capped at 6", () => {
    const cfg = sectionBlocksConfig["servicios-list"];
    expect(cfg.localBlocks?.[0].type).toBe("service-card");
    expect(cfg.maxBlocks).toBe(6);
  });

  it("proceso-envio offers process-step as a section-local block, capped at 4", () => {
    const cfg = sectionBlocksConfig["proceso-envio"];
    expect(cfg.localBlocks?.[0].type).toBe("process-step");
    expect(cfg.maxBlocks).toBe(4);
  });

  it("service-card and process-step are section-local ONLY, never promoted to the global block maps", () => {
    expect(blocksComponents["service-card"]).toBeUndefined();
    expect(blocksComponents["process-step"]).toBeUndefined();
  });
});
