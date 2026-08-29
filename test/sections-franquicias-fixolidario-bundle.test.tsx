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

  it("fixolidarioSettingsSchema has exactly 8 entries", () => {
    expect(fixolidarioSettingsSchema).toHaveLength(8);
    const ids = fixolidarioSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "kicker",
      "heading",
      "body",
      "statValue",
      "statHeadline",
      "statBody",
      "partnersHeading",
      "anchorId",
    ]);
    const anchorSetting = fixolidarioSettingsSchema.find(
      (s) => s.id === "anchorId",
    );
    expect(anchorSetting?.type).toBe("text");
    expect(anchorSetting?.default).toBe("");
  });
});

// Deep links (quick task 260828) — same anchor contract as the faq and
// sucursales sections.
describe("Fixolidario — anchor id", () => {
  it("emits NO id attribute when the anchor is blank", () => {
    const html = renderToStaticMarkup(<Fixolidario />);
    expect(html).not.toContain("id=");
  });

  it("treats a whitespace-only anchor as absent", () => {
    const html = renderToStaticMarkup(<Fixolidario anchorId="   " />);
    expect(html).not.toContain("id=");
  });

  it("renders the anchor as an id on the <section>, with the scroll cushion", () => {
    const html = renderToStaticMarkup(<Fixolidario anchorId="fixolidario" />);
    expect(html).toContain('id="fixolidario"');
    expect(html).toContain("scroll-mt-24");
  });

  it("normalizes a messy anchor on the way to the DOM", () => {
    const html = renderToStaticMarkup(
      <Fixolidario anchorId="#  Responsabilidad Social " />,
    );
    expect(html).toContain('id="responsabilidad-social"');
  });

  it("leaves an un-anchored section's class string byte-identical to today", () => {
    const html = renderToStaticMarkup(<Fixolidario />);
    expect(html).toContain('class="section-padding-y"');
    expect(html).not.toContain("scroll-mt-24");
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

  // 28 -> 30: the CTA gained `ctaAction` (link | openForm) and `ctaFormKey`,
  // so the button can open a platform form in a dialog instead of navigating.
  // `ctaUrl` is retained, not replaced — an existing page pointing the CTA at a
  // URL must keep working untouched.
  it("franquiciasInternacionalesSettingsSchema has exactly 30 entries", () => {
    expect(franquiciasInternacionalesSettingsSchema).toHaveLength(30);
    const ids = franquiciasInternacionalesSettingsSchema.map((s) => s.id);
    expect(ids).toContain("country4");
    expect(ids).toContain("country5");
    expect(ids).toContain("anchorId");
    const anchorSetting = franquiciasInternacionalesSettingsSchema.find(
      (s) => s.id === "anchorId",
    );
    expect(anchorSetting?.type).toBe("text");
    expect(anchorSetting?.default).toBe("");
  });

  it("defaults ctaAction to link, so an existing page's CTA still navigates", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales ctaLabel="Llenar" ctaUrl="https://example.com" />,
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain("<dialog");
  });

  it("renders a dialog trigger instead of a link when ctaAction is openForm", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales
        ctaLabel="Llenar"
        ctaUrl="https://example.com"
        ctaAction="openForm"
        ctaFormKey="franquicias"
      />,
    );
    expect(html).toContain("<dialog");
    // The stale ctaUrl must NOT still render as a link — that would give the
    // visitor two competing actions.
    expect(html).not.toContain('href="https://example.com"');
  });

  it("renders NOTHING for an openForm CTA with no form bound, rather than a dead button", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales ctaLabel="Llenar" ctaAction="openForm" />,
    );
    expect(html).not.toContain("<dialog");
    expect(html).not.toContain("Llenar");
  });

  it("keeps the CTA's pill styling in both modes", () => {
    const asLink = renderToStaticMarkup(
      <FranquiciasInternacionales ctaLabel="Llenar" ctaUrl="https://example.com" />,
    );
    const asDialog = renderToStaticMarkup(
      <FranquiciasInternacionales
        ctaLabel="Llenar"
        ctaAction="openForm"
        ctaFormKey="franquicias"
      />,
    );
    // Same size/variant either way — the button must not visibly change when a
    // merchant flips the action.
    for (const cls of ["rounded-full", "w-fit"]) {
      expect(asLink).toContain(cls);
      expect(asDialog).toContain(cls);
    }
  });

  it("emits NO id attribute when the anchor is blank", () => {
    const html = renderToStaticMarkup(<FranquiciasInternacionales />);
    expect(html).not.toContain("id=");
  });

  it("treats a whitespace-only anchor as absent", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales anchorId="   " />,
    );
    expect(html).not.toContain("id=");
  });

  it("renders the anchor as an id on the <section>, with the scroll cushion", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales anchorId="franquicias" />,
    );
    expect(html).toContain('id="franquicias"');
    expect(html).toContain("scroll-mt-24");
  });

  it("normalizes a messy anchor on the way to the DOM", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales anchorId="#  Franquicias Internacionales " />,
    );
    expect(html).toContain('id="franquicias-internacionales"');
  });

  it("leaves an un-anchored section's class string byte-identical to today", () => {
    const html = renderToStaticMarkup(<FranquiciasInternacionales />);
    expect(html).toContain('class="bg-muted section-padding-y"');
    expect(html).not.toContain("scroll-mt-24");
  });

  it("country4/country5 default to empty so a pre-existing section still shows exactly three pills", () => {
    const html = renderToStaticMarkup(<FranquiciasInternacionales />);
    expect(html).toContain("República Dominicana");
    expect(html).toContain("Puerto Rico");
    expect(html).toContain("Paraguay");
    expect(html).not.toContain("España");
  });

  it("renders five market pills once country4/country5 are filled in", () => {
    const html = renderToStaticMarkup(
      <FranquiciasInternacionales
        country4="Estados Unidos"
        country5="España"
      />,
    );
    expect(html).toContain("Estados Unidos");
    expect(html).toContain("España");
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
