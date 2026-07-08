import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Fixolidario, fixolidarioSettingsSchema } from "@/sections/Fixolidario";
import { PartnerCard, partnerCardSettingsSchema } from "@/blocks/PartnerCard";
import {
  FranquiciasInternacionales,
  franquiciasInternacionalesSettingsSchema,
} from "@/sections/FranquiciasInternacionales";
import { sectionBlocksConfig, blocksComponents } from "@/registry";

// Behavioral smoke tests for the quick-task FixoCargo homepage bundle
// (260708-dm3). The vitest environment is `node` (no global document), so we
// render DOM-free with renderToStaticMarkup and assert only on the returned
// HTML string. These prove the components render without crashing and emit
// the correct structure — the registry-driven empty-state matrix pins the
// census; this file locks the per-component behavior that the matrix cannot
// express.

describe("Fixolidario", () => {
  it("renders the default kicker, heading, body, highlight banner, and partners heading", () => {
    const html = renderToStaticMarkup(<Fixolidario />);
    expect(html).toContain("Responsabilidad social");
    expect(html).toContain("Fixolidario");
    expect(html).toContain(
      "Refleja nuestro compromiso con la sociedad. En alianza con diversas fundaciones",
    );
    expect(html).toContain("5%");
    expect(html).toContain(
      "del costo de envío se dona a la fundación que elijas",
    );
    expect(html).toContain(
      "Por cada pedido realizado a través de los enlaces de fundaciones asociadas",
    );
    expect(html).toContain("Conoce a nuestros asociados");
  });

  it("renders the default EmptyState when zero blocks (default EmptyState kept)", () => {
    const html = renderToStaticMarkup(<Fixolidario renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("renders a provided child inside the 1->2->4 grid", () => {
    const html = renderToStaticMarkup(
      <Fixolidario renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("child");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-4");
  });

  it("fixolidarioSettingsSchema has exactly 7 entries", () => {
    expect(fixolidarioSettingsSchema).toHaveLength(7);
    const ids = fixolidarioSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "kicker",
      "heading",
      "body",
      "statValue",
      "statHeadline",
      "statBody",
      "partnersHeading",
    ]);
  });
});

describe("PartnerCard", () => {
  it("renders the default name, body, and linkLabel as a real anchor with href=\"#\"", () => {
    const html = renderToStaticMarkup(<PartnerCard />);
    expect(html).toContain("FACCI");
    expect(html).toContain(
      "Fundación Amigos Contra el Cáncer Infantil. Desde 2003 mejora la vida",
    );
    expect(html).toContain("Regístrate y dona");
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
  });

  it("renders an <img> with the logo's src/width/height and lazy/async hints when a logo is provided", () => {
    const html = renderToStaticMarkup(
      <PartnerCard
        logo={{
          id: "1",
          url: "https://example.com/logo.png",
          alt: "Logo",
          width: 220,
          height: 82,
        }}
      />,
    );
    expect(html).toContain('src="https://example.com/logo.png"');
    expect(html).toContain('width="220"');
    expect(html).toContain('height="82"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("renders the ImageGuard placeholder text (not a broken <img>) when no logo is set", () => {
    const html = renderToStaticMarkup(<PartnerCard />);
    expect(html).toContain("Agrega una imagen");
    expect(html).not.toContain("<img");
  });

  it("renders no anchor/link row at all when linkLabel is blank (guarded)", () => {
    const html = renderToStaticMarkup(<PartnerCard linkLabel="" />);
    expect(html).not.toContain("<a");
  });

  it("partnerCardSettingsSchema has exactly 5 entries with logo as an image_picker", () => {
    expect(partnerCardSettingsSchema).toHaveLength(5);
    const ids = partnerCardSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["logo", "name", "body", "linkLabel", "linkUrl"]);
    const logoSetting = partnerCardSettingsSchema.find((s) => s.id === "logo");
    expect(logoSetting?.type).toBe("image_picker");
  });
});

describe("FranquiciasInternacionales", () => {
  it("renders the default kicker, heading, body, all 3 country chips, offer/why headings, all offer/why pairs, whySupportingText, and the CTA anchor", () => {
    const html = renderToStaticMarkup(<FranquiciasInternacionales />);
    expect(html).toContain("Crece con nosotros");
    expect(html).toContain("Franquicias Internacionales");
    expect(html).toContain(
      "Expandimos nuestras operaciones más allá de las fronteras",
    );
    expect(html).toContain("República Dominicana");
    expect(html).toContain("Puerto Rico");
    expect(html).toContain("Paraguay");
    expect(html).toContain("Lo que ofrecemos a nuestras franquicias");
    expect(html).toContain("Know-How Integral");
    expect(html).toContain("Sistema Efectivo");
    expect(html).toContain("Marca Establecida");
    expect(html).toContain("Apoyo desde Miami");
    expect(html).toContain("Por qué elegir Fixo Cargo");
    expect(html).toContain("Expansión Estratégica");
    expect(html).toContain("Soporte Continuo");
    expect(html).toContain("Innovación y Crecimiento");
    expect(html).toContain(
      "¿Interesado en explorar oportunidades de franquicia?",
    );
    expect(html).toContain("Llenar el formulario");
    expect(html).toContain("<a");
    expect(html).toContain('href="#"');
  });

  it("renders exactly ONE country chip when country2/country3 are blank (independently guarded)", () => {
    // The default `body` copy mentions all 3 country names in plain text
    // (locked decision — no inline rich-text bolding), so this test blanks
    // `body` too to isolate the chip row from the paragraph text.
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales body="" country2="" country3="" />,
    );
    expect(html).toContain("República Dominicana");
    expect(html).not.toContain("Puerto Rico");
    expect(html).not.toContain("Paraguay");
    // exactly one chip wrapper rendered
    const chipCount = (html.match(/rounded-full bg-brand-navy px-6/g) ?? [])
      .length;
    expect(chipCount).toBe(1);
  });

  it("renders neither title nor body for offer item 2 when blank, but keeps items 1/3/4 (icon tile unconditional)", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales offer2Title="" offer2Body="" />,
    );
    expect(html).toContain("Know-How Integral");
    expect(html).toContain("Marca Establecida");
    expect(html).toContain("Apoyo desde Miami");
    expect(html).not.toContain("Sistema Efectivo");
    expect(html).not.toContain(
      "Utiliza nuestro sistema de operaciones, optimizado para eficiencia y efectividad.",
    );
  });

  it("has NO renderBlocks prop in its interface and never renders the EmptyState marker", () => {
    const html = renderToStaticMarkup(
      // @ts-expect-error — FranquiciasInternacionales has no renderBlocks in
      // its interface; proving an extraneous renderBlocks prop is ignored.
      <FranquiciasInternacionales renderBlocks={() => []} />,
    );
    expect(html).not.toContain("Sin elementos");
  });

  it("franquiciasInternacionalesSettingsSchema has exactly 25 entries", () => {
    expect(franquiciasInternacionalesSettingsSchema).toHaveLength(25);
  });
});

describe("registry wiring", () => {
  it("franquicias-internacionales has NO sectionBlocksConfig entry (no-block section)", () => {
    expect(sectionBlocksConfig["franquicias-internacionales"]).toBeUndefined();
  });

  it("fixolidario offers partner-card as a section-local block, capped at 8", () => {
    const cfg = sectionBlocksConfig["fixolidario"];
    expect(cfg.localBlocks?.[0].type).toBe("partner-card");
    expect(cfg.maxBlocks).toBe(8);
  });

  it("partner-card is section-local ONLY, never promoted to the global block maps", () => {
    expect(blocksComponents["partner-card"]).toBeUndefined();
  });
});
