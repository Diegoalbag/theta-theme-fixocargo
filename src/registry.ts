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
import { HeroSlide, heroSlideSettingsSchema } from "./blocks/HeroSlide";
import { Branch, branchSettingsSchema } from "./blocks/Branch";
import { FaqPill, faqPillSettingsSchema } from "./blocks/FaqPill";
import { BenefitCard, benefitCardSettingsSchema } from "./blocks/BenefitCard";
import { ServiceItem, serviceItemSettingsSchema } from "./blocks/ServiceItem";
import { PromoBanner, promoBannerSettingsSchema } from "./blocks/PromoBanner";
import { AddressCard, addressCardSettingsSchema } from "./blocks/AddressCard";
import { ToolPill, toolPillSettingsSchema } from "./blocks/ToolPill";
import { SocialLink, socialLinkSettingsSchema } from "./blocks/SocialLink";
import { StoreBadge, storeBadgeSettingsSchema } from "./blocks/StoreBadge";
import { NavLink, navLinkSettingsSchema } from "./blocks/NavLink";
import { FooterColumn, footerColumnSettingsSchema } from "./blocks/FooterColumn";

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
};

// Block React components keyed by block type (Shopify-style child blocks).
export const blocksComponents: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  "social-link": SocialLink as React.ComponentType<Record<string, unknown>>,
  "store-badge": StoreBadge as React.ComponentType<Record<string, unknown>>,
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
    // ONE ordered slot, TWO section-local block types (D-02/D-03): the host
    // exposes a single slot and the theme cannot partition by blockType.
    blocks: [{ type: "service-item" }, { type: "promo-banner" }],
    maxBlocks: 11,
    localBlocks: [
      {
        type: "service-item",
        name: "Servicio",
        component: ServiceItem as React.ComponentType<Record<string, unknown>>,
        settings: serviceItemSettingsSchema,
      },
      {
        type: "promo-banner",
        name: "Banner promocional",
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
};
