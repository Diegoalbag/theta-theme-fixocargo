import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  BeneficiosGrid,
  beneficiosGridSettingsSchema,
} from "@/sections/BeneficiosGrid";
import { AppFeatures, appFeaturesSettingsSchema } from "@/sections/AppFeatures";
import {
  AppFeatureItem,
  appFeatureItemSettingsSchema,
} from "@/blocks/AppFeatureItem";
import {
  PlanReferimiento,
  planReferimientoSettingsSchema,
} from "@/sections/PlanReferimiento";
import {
  ListaRegalos,
  listaRegalosSettingsSchema,
} from "@/sections/ListaRegalos";
import { GiftStep, giftStepSettingsSchema } from "@/blocks/GiftStep";
import { sectionBlocksConfig, blocksComponents } from "@/registry";

// Behavioral smoke tests for the quick-task FixoCargo "Beneficios" page
// sections/blocks (260706-qqi). The vitest environment is `node` (no global
// document), so we render DOM-free with renderToStaticMarkup and assert only
// on the returned HTML string. These prove the components render without
// crashing and emit the correct structure — the registry-driven empty-state
// matrix pins the census; this file locks the per-component behavior that the
// matrix cannot express.

describe("BeneficiosGrid", () => {
  it("renders the default eyebrow + heading on blank props", () => {
    const html = renderToStaticMarkup(<BeneficiosGrid />);
    expect(html).toContain("Nuestros beneficios");
    expect(html).toContain("Pensados para que envíes tranquilo");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<BeneficiosGrid renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->2->4 grid", () => {
    const html = renderToStaticMarkup(
      <BeneficiosGrid renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-4");
  });

  it("beneficiosGridSettingsSchema has 2 entries [eyebrow, heading]", () => {
    expect(beneficiosGridSettingsSchema).toHaveLength(2);
    const ids = beneficiosGridSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading"]);
  });
});

describe("AppFeatures", () => {
  it("renders on the navy band with the default eyebrow + white heading", () => {
    const html = renderToStaticMarkup(<AppFeatures />);
    expect(html).toContain("bg-brand-navy");
    expect(html).toContain("Todo desde la app");
    expect(html).toContain("Controla tus envíos en tiempo real");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<AppFeatures renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->2->3 grid", () => {
    const html = renderToStaticMarkup(
      <AppFeatures renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("appFeaturesSettingsSchema has 2 entries [eyebrow, heading]", () => {
    expect(appFeaturesSettingsSchema).toHaveLength(2);
    const ids = appFeaturesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["eyebrow", "heading"]);
  });
});

describe("AppFeatureItem", () => {
  it("renders the default title/body with NO <details> element (static row, not an accordion)", () => {
    const html = renderToStaticMarkup(<AppFeatureItem />);
    expect(html).toContain("Noticias y Promociones");
    expect(html).not.toContain("<details");
  });

  it("resolves a known icon to an svg glyph", () => {
    const html = renderToStaticMarkup(<AppFeatureItem icon="map-pin" />);
    expect(html).toContain("<svg");
  });

  it("falls back without throwing on an unknown icon value (QA-03)", () => {
    let html = "";
    expect(() => {
      html = renderToStaticMarkup(<AppFeatureItem icon="totally-unknown" />);
    }).not.toThrow();
    expect(html).toContain("<svg");
  });

  it("appFeatureItemSettingsSchema has 3 entries [icon, title, body] with icon as select", () => {
    expect(appFeatureItemSettingsSchema).toHaveLength(3);
    const ids = appFeatureItemSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["icon", "title", "body"]);
    const iconSetting = appFeatureItemSettingsSchema.find((s) => s.id === "icon");
    expect(iconSetting?.type).toBe("select");
  });
});

describe("PlanReferimiento", () => {
  it("renders without a renderBlocks prop at all (no child-block slot)", () => {
    const html = renderToStaticMarkup(<PlanReferimiento />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders the default eyebrow/heading", () => {
    const html = renderToStaticMarkup(<PlanReferimiento />);
    expect(html).toContain("Refiere y gana");
    expect(html).toContain("Plan de referidos");
  });

  it("renders the hardcoded '¿Cómo Funciona?' heading and BOTH default process steps", () => {
    const html = renderToStaticMarkup(
      <PlanReferimiento eyebrow="" heading="" />,
    );
    expect(html).toContain("¿Cómo Funciona?");
    expect(html).toContain("Comparte tu enlace");
    expect(html).toContain(
      "Solicita tu enlace de referido y compártelo con amigos y familiares.",
    );
    expect(html).toContain("Acumula oportunidades para ganar");
    expect(html).toContain(
      "Cada vez que una persona se registre a través de tu enlace y realice su primer envío, recibirás automáticamente un boleto electrónico para participar.",
    );
  });

  it("renders BOTH step numbers with merchant-supplied step copy, and omits an emptied step half", () => {
    const html = renderToStaticMarkup(
      <PlanReferimiento
        step1Title="Paso uno"
        step1Body="Cuerpo uno"
        step2Title=""
        step2Body="Cuerpo dos"
      />,
    );
    expect(html).toContain("Paso uno");
    expect(html).toContain("Cuerpo uno");
    expect(html).toContain("Cuerpo dos");
    expect(html).not.toContain("Acumula oportunidades para ganar");
    // The numbered chips are structural — both survive an emptied title.
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
  });

  it("renders the default prizeCalloutTitle/Body and a CTA anchor with the default label/href", () => {
    const html = renderToStaticMarkup(<PlanReferimiento />);
    expect(html).toContain("Premios del sorteo");
    expect(html).toContain(
      "AirPods, gift cards, iPads y otros premios seleccionados por Fixo Cargo.",
    );
    expect(html).toContain("¡Solicita tu enlace!");
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
  });

  it("renders the hardcoded 'Términos y Condiciones' heading and the terms content through RichText", () => {
    const html = renderToStaticMarkup(
      <PlanReferimiento terms="<p>Contenido de términos</p>" />,
    );
    expect(html).toContain("Términos y Condiciones");
    expect(html).toContain("article-body");
    expect(html).toContain("Contenido de términos");
  });

  it("planReferimientoSettingsSchema has 11 entries with terms as richtext", () => {
    expect(planReferimientoSettingsSchema).toHaveLength(11);
    const ids = planReferimientoSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "eyebrow",
      "heading",
      "step1Title",
      "step1Body",
      "step2Title",
      "step2Body",
      "prizeCalloutTitle",
      "prizeCalloutBody",
      "ctaLabel",
      "ctaUrl",
      "terms",
    ]);
    const terms = planReferimientoSettingsSchema.find((s) => s.id === "terms");
    expect(terms?.type).toBe("richtext");
  });
});

describe("ListaRegalos", () => {
  it("renders the default eyebrow/heading and promoHeading/promoBody", () => {
    const html = renderToStaticMarkup(<ListaRegalos />);
    expect(html).toContain("Celebra con Fixo");
    expect(html).toContain("Lista de Regalos");
    expect(html).toContain(
      "¿Planeando tu baby shower, cumpleaños o boda?",
    );
    expect(html).toContain(
      "Haz que tu celebración sea aún más especial. Crea tu lista de regalos y disfruta de beneficios exclusivos con Fixo Cargo.",
    );
  });

  it("renders BOTH promo tiles from their defaults", () => {
    const html = renderToStaticMarkup(<ListaRegalos />);
    expect(html).toContain("20%");
    expect(html).toContain("de descuento en el flete");
    expect(html).toContain("Amazon Gift Cards");
    expect(html).toContain("Beneficios especiales para celebrar contigo.");
  });

  it("renders merchant-supplied tile copy and omits an emptied tile half", () => {
    const html = renderToStaticMarkup(
      <ListaRegalos
        benefit1Value="30%"
        benefit1Label="de descuento"
        benefit2Title="Regalo sorpresa"
        benefit2Body=""
      />,
    );
    expect(html).toContain("30%");
    expect(html).toContain("de descuento");
    expect(html).toContain("Regalo sorpresa");
    expect(html).not.toContain("Beneficios especiales para celebrar contigo.");
  });

  it("renders the hardcoded '¿Cómo funciona?' label", () => {
    const html = renderToStaticMarkup(<ListaRegalos />);
    expect(html).toContain("¿Cómo funciona?");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<ListaRegalos renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->3 grid", () => {
    const html = renderToStaticMarkup(
      <ListaRegalos renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("listaRegalosSettingsSchema has 8 entries incl. both editable promo tiles", () => {
    expect(listaRegalosSettingsSchema).toHaveLength(8);
    const ids = listaRegalosSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "eyebrow",
      "heading",
      "promoHeading",
      "promoBody",
      "benefit1Value",
      "benefit1Label",
      "benefit2Title",
      "benefit2Body",
    ]);
  });
});

describe("GiftStep", () => {
  it("renders the default index, title, and body", () => {
    const html = renderToStaticMarkup(<GiftStep />);
    expect(html).toContain("01");
    expect(html).toContain("Crea tu lista de regalos");
    expect(html).toContain("En una tienda en línea que ofrezca este servicio.");
  });

  it("giftStepSettingsSchema has 3 entries [index, title, body]", () => {
    expect(giftStepSettingsSchema).toHaveLength(3);
    const ids = giftStepSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["index", "title", "body"]);
  });
});

describe("registry wiring", () => {
  it("beneficios-grid offers ONLY the promoted global benefit-card, no localBlocks", () => {
    const cfg = sectionBlocksConfig["beneficios-grid"];
    expect(cfg.blocks).toEqual([{ type: "benefit-card" }]);
    expect(cfg.maxBlocks).toBe(8);
    expect(cfg.localBlocks ?? []).toHaveLength(0);
  });

  it("benefit-card is now a global block component (promoted)", () => {
    expect(typeof blocksComponents["benefit-card"]).toBe("function");
  });

  it("beneficios still references benefit-card (unchanged usage)", () => {
    const cfg = sectionBlocksConfig["beneficios"];
    expect(cfg.blocks).toContainEqual({ type: "benefit-card" });
  });

  it("app-features offers app-feature-item as a section-local block, capped at 6", () => {
    const cfg = sectionBlocksConfig["app-features"];
    expect(cfg.localBlocks?.[0].type).toBe("app-feature-item");
    expect(cfg.maxBlocks).toBe(6);
  });

  it("lista-regalos offers gift-step as a section-local block, capped at 3", () => {
    const cfg = sectionBlocksConfig["lista-regalos"];
    expect(cfg.localBlocks?.[0].type).toBe("gift-step");
    expect(cfg.maxBlocks).toBe(3);
  });

  it("plan-referimiento has NO sectionBlocksConfig entry (no-block section)", () => {
    expect(sectionBlocksConfig["plan-referimiento"]).toBeUndefined();
  });
});
