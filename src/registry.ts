import type React from "react";
import { AnnouncementBar, announcementBarSettingsSchema } from "./sections/AnnouncementBar";
import { SiteHeader, siteHeaderSettingsSchema } from "./sections/SiteHeader";
import { Footer, footerSettingsSchema } from "./sections/Footer";
import { Hero, heroSettingsSchema } from "./sections/Hero";
import { DireccionCards, direccionCardsSettingsSchema } from "./sections/DireccionCards";
import { ToolsBar, toolsBarSettingsSchema } from "./sections/ToolsBar";
import { Servicios, serviciosSettingsSchema } from "./sections/Servicios";
import { Beneficios, beneficiosSettingsSchema } from "./sections/Beneficios";
import { DescargaApp, descargaAppSettingsSchema } from "./sections/DescargaApp";
import { Sucursales, sucursalesSettingsSchema } from "./sections/Sucursales";
import { EnviosNacionales, enviosNacionalesSettingsSchema } from "./sections/EnviosNacionales";
import { Blogs, blogsSettingsSchema } from "./sections/Blogs";
import { ArticleBody, articleBodySettingsSchema } from "./sections/ArticleBody";
import { BlogHero, blogHeroSettingsSchema } from "./sections/BlogHero";
import { BlogList, blogListSettingsSchema } from "./sections/BlogList";
import { NosotrosHero, nosotrosHeroSettingsSchema } from "./sections/NosotrosHero";
import { NosotrosMission, nosotrosMissionSettingsSchema } from "./sections/NosotrosMission";
import { NosotrosStats, nosotrosStatsSettingsSchema } from "./sections/NosotrosStats";
import { NosotrosValues, nosotrosValuesSettingsSchema } from "./sections/NosotrosValues";
import { NosotrosTimeline, nosotrosTimelineSettingsSchema } from "./sections/NosotrosTimeline";
import { Faq, faqSettingsSchema } from "./sections/Faq";
import { HeroSlide, heroSlideSettingsSchema } from "./blocks/HeroSlide";
import { Branch, branchSettingsSchema } from "./blocks/Branch";
import { FaqPill, faqPillSettingsSchema } from "./blocks/FaqPill";
import { BlogCard, blogCardSettingsSchema } from "./blocks/BlogCard";
import { BenefitCard, benefitCardSettingsSchema } from "./blocks/BenefitCard";
import { ServiceItem, serviceItemSettingsSchema } from "./blocks/ServiceItem";
import { PromoBanner, promoBannerSettingsSchema } from "./blocks/PromoBanner";
import { AddressCard, addressCardSettingsSchema } from "./blocks/AddressCard";
import { ToolPill, toolPillSettingsSchema } from "./blocks/ToolPill";
import { SocialLink, socialLinkSettingsSchema } from "./blocks/SocialLink";
import { StoreBadge, storeBadgeSettingsSchema } from "./blocks/StoreBadge";
import { NavLink, navLinkSettingsSchema } from "./blocks/NavLink";
import { FooterColumn, footerColumnSettingsSchema } from "./blocks/FooterColumn";
import { StatItem, statItemSettingsSchema } from "./blocks/StatItem";
import { ValueCard, valueCardSettingsSchema } from "./blocks/ValueCard";
import { TimelineItem, timelineItemSettingsSchema } from "./blocks/TimelineItem";
import { FaqItem, faqItemSettingsSchema } from "./blocks/FaqItem";

// ---------------------------------------------------------------------------
// The registry is the heart of a theme. Five maps, all keyed by the same
// lowercase/kebab-case type strings. Add a section or block by adding an entry
// to each relevant map below. Keys MUST stay consistent across all maps.
// ---------------------------------------------------------------------------

// Section React components keyed by section type.
export const sectionsComponents: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  "announcement-bar": AnnouncementBar as React.ComponentType<Record<string, unknown>>,
  "site-header": SiteHeader as React.ComponentType<Record<string, unknown>>,
  "footer": Footer as React.ComponentType<Record<string, unknown>>,
  "hero": Hero as React.ComponentType<Record<string, unknown>>,
  "direccion-cards": DireccionCards as React.ComponentType<Record<string, unknown>>,
  "tools-bar": ToolsBar as React.ComponentType<Record<string, unknown>>,
  "servicios": Servicios as React.ComponentType<Record<string, unknown>>,
  "beneficios": Beneficios as React.ComponentType<Record<string, unknown>>,
  "descarga-app": DescargaApp as React.ComponentType<Record<string, unknown>>,
  "sucursales": Sucursales as React.ComponentType<Record<string, unknown>>,
  "envios-nacionales": EnviosNacionales as React.ComponentType<Record<string, unknown>>,
  "blogs": Blogs as React.ComponentType<Record<string, unknown>>,
  "article-body": ArticleBody as React.ComponentType<Record<string, unknown>>,
  "blog-hero": BlogHero as React.ComponentType<Record<string, unknown>>,
  "blog-list": BlogList as React.ComponentType<Record<string, unknown>>,
  "nosotros-hero": NosotrosHero as React.ComponentType<Record<string, unknown>>,
  "nosotros-mission": NosotrosMission as React.ComponentType<Record<string, unknown>>,
  "nosotros-stats": NosotrosStats as React.ComponentType<Record<string, unknown>>,
  "nosotros-values": NosotrosValues as React.ComponentType<Record<string, unknown>>,
  "nosotros-timeline": NosotrosTimeline as React.ComponentType<Record<string, unknown>>,
  "faq": Faq as React.ComponentType<Record<string, unknown>>,
};

// Settings schemas keyed by section type (same keys as sectionsComponents).
export const sectionSettingsSchemas = {
  "announcement-bar": announcementBarSettingsSchema,
  "site-header": siteHeaderSettingsSchema,
  "footer": footerSettingsSchema,
  "hero": heroSettingsSchema,
  "direccion-cards": direccionCardsSettingsSchema,
  "tools-bar": toolsBarSettingsSchema,
  "servicios": serviciosSettingsSchema,
  "beneficios": beneficiosSettingsSchema,
  "descarga-app": descargaAppSettingsSchema,
  "sucursales": sucursalesSettingsSchema,
  "envios-nacionales": enviosNacionalesSettingsSchema,
  "blogs": blogsSettingsSchema,
  "article-body": articleBodySettingsSchema,
  "blog-hero": blogHeroSettingsSchema,
  "blog-list": blogListSettingsSchema,
  "nosotros-hero": nosotrosHeroSettingsSchema,
  "nosotros-mission": nosotrosMissionSettingsSchema,
  "nosotros-stats": nosotrosStatsSettingsSchema,
  "nosotros-values": nosotrosValuesSettingsSchema,
  "nosotros-timeline": nosotrosTimelineSettingsSchema,
  "faq": faqSettingsSchema,
};

// Block React components keyed by block type (Shopify-style child blocks).
export const blocksComponents: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  "social-link": SocialLink as React.ComponentType<Record<string, unknown>>,
  "store-badge": StoreBadge as React.ComponentType<Record<string, unknown>>,
  // PRIVATE GLOBAL (leading `_`): shared by the homepage `blogs` section and the
  // `blog-list` section, but the `_` prefix EXCLUDES it from the `@theme`
  // expansion — so it never leaks into the Footer / AnnouncementBar block menus.
  // Both consumers reference it explicitly via `blocks: [{ type: "_blog-card" }]`.
  "_blog-card": BlogCard as React.ComponentType<Record<string, unknown>>,
};

// Block settings schemas keyed by block type.
export const blockSettingsSchemas: Record<
  string,
  Array<{
    id: string;
    label: string;
    type: string;
    default?: string | number | boolean | unknown;
    info?: string;
    placeholder?: string;
    options?: Array<{ value: string | number | boolean; label: string }>;
    metaobjectType?: string;
  }>
> = {
  "social-link": socialLinkSettingsSchema,
  "store-badge": storeBadgeSettingsSchema,
  "_blog-card": blogCardSettingsSchema,
};

// Per-section block config: which blocks each section accepts.
//   { type: "@theme" } — accept all non-private theme blocks.
//   { type: "feature" } — accept only that specific block type.
//   localBlocks — section-exclusive blocks defined inline (not shared).
export const sectionBlocksConfig: Record<
  string,
  {
    blocks: Array<{ type: string }>;
    maxBlocks?: number;
    localBlocks?: Array<{
      type: string;
      name: string;
      component?: React.ComponentType<Record<string, unknown>>;
      settings: Array<{
        id: string;
        label: string;
        type: string;
        default?: string | number | boolean | unknown;
        info?: string;
        options?: Array<{ value: string | number | boolean; label: string }>;
      }>;
    }>;
  }
> = {
  "announcement-bar": {
    blocks: [{ type: "@theme" }],
    maxBlocks: 7,
  },
  "site-header": {
    blocks: [{ type: "nav-link" }],
    maxBlocks: 8,
    localBlocks: [
      {
        type: "nav-link",
        name: "Enlace de navegación",
        component: NavLink as React.ComponentType<Record<string, unknown>>,
        settings: navLinkSettingsSchema,
      },
    ],
  },
  "footer": {
    blocks: [{ type: "@theme" }, { type: "footer-column" }],
    maxBlocks: 12,
    localBlocks: [
      {
        type: "footer-column",
        name: "Columna del pie",
        component: FooterColumn as React.ComponentType<Record<string, unknown>>,
        settings: footerColumnSettingsSchema,
      },
    ],
  },
  "hero": {
    blocks: [{ type: "hero-slide" }],
    maxBlocks: 5,
    localBlocks: [
      {
        type: "hero-slide",
        name: "Diapositiva",
        component: HeroSlide as React.ComponentType<Record<string, unknown>>,
        settings: heroSlideSettingsSchema,
      },
    ],
  },
  "direccion-cards": {
    blocks: [{ type: "address-card" }],
    maxBlocks: 4,
    localBlocks: [
      {
        type: "address-card",
        name: "Tarjeta de dirección",
        component: AddressCard as React.ComponentType<Record<string, unknown>>,
        settings: addressCardSettingsSchema,
      },
    ],
  },
  "tools-bar": {
    blocks: [{ type: "tool-pill" }],
    maxBlocks: 6,
    localBlocks: [
      {
        type: "tool-pill",
        name: "Botón de acción",
        component: ToolPill as React.ComponentType<Record<string, unknown>>,
        settings: toolPillSettingsSchema,
      },
    ],
  },
  "servicios": {
    // ONE ordered slot OFFERING service-item only (the left column). The
    // right-rail promo banners moved OUT of this slot into Servicios SECTION
    // SETTINGS: the platform exposes exactly ONE block slot per section, and a
    // single mixed slot cannot be split by blockType without diverging between
    // the customizer (one opaque Puck slot) and the published site (D-02/D-03).
    // Until multi-slot sections land, the banners are settings-driven.
    //
    // promo-banner is kept in localBlocks (but NOT in `blocks`) ONLY for
    // back-compat: the platform registers a Puck config for any block in
    // localBlocks, so promo-banner instances saved in existing pages still
    // render and can be deleted. It is absent from `blocks`, so it can't be
    // added to new pages. Remove this entry once no legacy instances remain.
    blocks: [{ type: "service-item" }],
    maxBlocks: 8,
    localBlocks: [
      {
        type: "service-item",
        name: "Servicio",
        component: ServiceItem as React.ComponentType<Record<string, unknown>>,
        settings: serviceItemSettingsSchema,
      },
      {
        // DEPRECATED — retained so legacy instances stay renderable/removable.
        type: "promo-banner",
        name: "Banner promocional (obsoleto)",
        component: PromoBanner as React.ComponentType<Record<string, unknown>>,
        settings: promoBannerSettingsSchema,
      },
    ],
  },
  "beneficios": {
    // ONE ordered slot, ONE section-local block type (D-06): benefit-card is
    // exclusive to Beneficios and is NOT registered in the global block maps.
    blocks: [{ type: "benefit-card" }],
    maxBlocks: 6,
    localBlocks: [
      {
        type: "benefit-card",
        name: "Beneficio",
        component: BenefitCard as React.ComponentType<Record<string, unknown>>,
        settings: benefitCardSettingsSchema,
      },
    ],
  },
  "descarga-app": {
    // SHARED block reuse (D-05): the app-store badge row accepts the global
    // `store-badge` block via the allow-list only. store-badge is already in
    // blocksComponents/blockSettingsSchemas — do NOT re-register it, and there
    // are NO section-local blocks here.
    blocks: [{ type: "store-badge" }],
    maxBlocks: 2,
  },
  "sucursales": {
    // ONE ordered slot, ONE section-local block type (D-07): branch is
    // exclusive to Sucursales and is NOT registered in the global block maps.
    blocks: [{ type: "branch" }],
    maxBlocks: 8,
    localBlocks: [
      {
        type: "branch",
        name: "Sucursal",
        component: Branch as React.ComponentType<Record<string, unknown>>,
        settings: branchSettingsSchema,
      },
    ],
  },
  "envios-nacionales": {
    // ONE ordered slot, ONE section-local block type (D-07): faq-pill is
    // exclusive to EnviosNacionales and is NOT registered in the global block
    // maps (blocksComponents/blockSettingsSchemas stay unchanged).
    blocks: [{ type: "faq-pill" }],
    maxBlocks: 8,
    localBlocks: [
      {
        type: "faq-pill",
        name: "Pregunta frecuente",
        component: FaqPill as React.ComponentType<Record<string, unknown>>,
        settings: faqPillSettingsSchema,
      },
    ],
  },
  "blogs": {
    // PROMOTION (08-02): blog-card was section-local to Blogs; it is now the
    // PRIVATE GLOBAL `_blog-card` (registered in blocksComponents /
    // blockSettingsSchemas) so the new `blog-list` section can reuse it. Both
    // sections reference it EXPLICITLY — the leading `_` keeps it out of the
    // `@theme` menus. maxBlocks stays 6 for the homepage teaser row.
    blocks: [{ type: "_blog-card" }],
    maxBlocks: 6,
    localBlocks: [
      {
        // DEPRECATED back-compat alias — mirrors the promo-banner precedent.
        // Retained ONLY so blog-card instances saved on existing pages (which
        // carry the literal key `blog-card`) still render and can be removed.
        // It is ABSENT from `blocks`, so it can't be added to new pages; new
        // cards use the promoted `_blog-card` global. Remove once no legacy
        // instances remain.
        type: "blog-card",
        name: "Tarjeta de blog (obsoleto)",
        component: BlogCard as React.ComponentType<Record<string, unknown>>,
        settings: blogCardSettingsSchema,
      },
    ],
  },
  "blog-list": {
    // SHARED global reuse: the Blog index consumes the promoted private global
    // `_blog-card` via the allow-list only (no section-local blocks). The `_`
    // prefix keeps `_blog-card` out of the `@theme` menus; both `blogs` and
    // `blog-list` reference it explicitly. Higher cap (12) for a full index.
    blocks: [{ type: "_blog-card" }],
    maxBlocks: 12,
  },
  "nosotros-stats": {
    // ONE ordered slot, ONE section-local block type (D-05): stat-item is
    // exclusive to NosotrosStats and is NOT registered in the global block maps.
    blocks: [{ type: "stat-item" }],
    maxBlocks: 6,
    localBlocks: [
      {
        type: "stat-item",
        name: "Estadística",
        component: StatItem as React.ComponentType<Record<string, unknown>>,
        settings: statItemSettingsSchema,
      },
    ],
  },
  "nosotros-values": {
    // ONE ordered slot, ONE section-local block type (D-05): value-card is
    // exclusive to NosotrosValues and is NOT registered in the global block maps.
    blocks: [{ type: "value-card" }],
    maxBlocks: 9,
    localBlocks: [
      {
        type: "value-card",
        name: "Valor",
        component: ValueCard as React.ComponentType<Record<string, unknown>>,
        settings: valueCardSettingsSchema,
      },
    ],
  },
  "nosotros-timeline": {
    // ONE ordered slot, ONE section-local block type (D-05): timeline-item is
    // exclusive to NosotrosTimeline and is NOT registered in the global block maps.
    blocks: [{ type: "timeline-item" }],
    maxBlocks: 12,
    localBlocks: [
      {
        type: "timeline-item",
        name: "Hito",
        component: TimelineItem as React.ComponentType<Record<string, unknown>>,
        settings: timelineItemSettingsSchema,
      },
    ],
  },
  "faq": {
    // ONE ordered slot, ONE section-local block type (D-07): faq-item is
    // exclusive to Faq and is NOT registered in the global block maps. Cap 12
    // mirrors nosotros-timeline for a long repeating Q&A list (faq-pill uses 8
    // for a compact pill row; a full Q&A list warrants the higher cap).
    blocks: [{ type: "faq-item" }],
    maxBlocks: 12,
    localBlocks: [
      {
        type: "faq-item",
        name: "Pregunta frecuente",
        component: FaqItem as React.ComponentType<Record<string, unknown>>,
        settings: faqItemSettingsSchema,
      },
    ],
  },
  // nosotros-hero and nosotros-mission are NO-BLOCK sections (Pattern 4 — no
  // sectionBlocksConfig entry), exactly like article-body / blog-hero.
};
