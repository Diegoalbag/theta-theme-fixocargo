import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { Sucursales, sucursalesSettingsSchema } from "@/sections/Sucursales";
import { Branch, branchSettingsSchema } from "@/blocks/Branch";
import {
  EnviosNacionales,
  enviosNacionalesSettingsSchema,
} from "@/sections/EnviosNacionales";
import { FaqPill, faqPillSettingsSchema } from "@/blocks/FaqPill";
import { BlogCard, blogCardSettingsSchema } from "@/blocks/BlogCard";
import { sectionBlocksConfig } from "@/registry";

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

  it("renders the decorative search placeholder", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Ingresa la ubicación");
  });

  it("renders the default EmptyState when zero blocks (D-08)", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Sin elementos");
  });

  it("renders the ImageGuard placeholder and no img when mapImage unset", () => {
    const html = renderToStaticMarkup(<Sucursales />);
    expect(html).toContain("Agrega una imagen");
    expect(html).not.toContain("<img");
  });

  it("renders provided blocks inside a responsive two-column layout", () => {
    const html = renderToStaticMarkup(
      <Sucursales renderBlocks={() => [<span key="a">child</span>]} />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:flex-row");
    expect(html).toContain("child");
  });

  it("sucursalesSettingsSchema has exactly 3 entries [heading,subtitle,mapImage]", () => {
    expect(sucursalesSettingsSchema).toHaveLength(3);
    const ids = sucursalesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["heading", "subtitle", "mapImage"]);
    const mapImageSetting = sucursalesSettingsSchema.find(
      (s) => s.id === "mapImage",
    );
    expect(mapImageSetting?.type).toBe("image_picker");
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

  it("renders the Dirección anchor with the provided mapUrl", () => {
    const html = renderToStaticMarkup(<Branch mapUrl="/m" />);
    expect(html).toContain('href="/m"');
  });

  it("branchSettingsSchema has 4 entries [name,phone,email,mapUrl] with mapUrl as url", () => {
    expect(branchSettingsSchema).toHaveLength(4);
    const ids = branchSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["name", "phone", "email", "mapUrl"]);
    const mapUrlSetting = branchSettingsSchema.find((s) => s.id === "mapUrl");
    expect(mapUrlSetting?.type).toBe("url");
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

  it("enviosNacionalesSettingsSchema has 5 entries [kicker,heading,body,ctaLabel,ctaUrl]", () => {
    expect(enviosNacionalesSettingsSchema).toHaveLength(5);
    const ids = enviosNacionalesSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["kicker", "heading", "body", "ctaLabel", "ctaUrl"]);
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
