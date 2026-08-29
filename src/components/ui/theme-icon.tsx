import * as React from "react";
import {
  Package,
  Truck,
  Phone,
  CreditCard,
  Plane,
  Ship,
  ClipboardCheck,
  Globe,
  Warehouse,
  Percent,
  Users,
  Gift,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { ThemeImage, type ThemeImageValue } from "@/lib/theme-image";
import { safeSvgDataUri, SVG_MAX_LENGTH } from "@/lib/safe-svg";
import { cn } from "@/lib/utils";

// ThemeIcon — the single icon seam shared by every block that renders a glyph
// (ServiceItem, BenefitCard). Two mutually exclusive sources, checked in this
// order:
//
//   1. `customIcon` — the merchant's own icon. Accepts TWO shapes, because the
//      field started life as an image_picker and is now a textarea:
//        * a STRING of pasted SVG markup (the current setting), encoded to a
//          data: URI by @/lib/safe-svg;
//        * an OBJECT from the media library (any icon saved while this was an
//          image_picker), used for its `url`.
//      Both render through ThemeImage as an <img src>, NEVER as inline/raw
//      markup: an SVG behind <img> is in the browser's secure static mode, so
//      its contents can never execute script in the page's origin, the theme's
//      one-HTML-sink rule is untouched, and the no-bare-img gate
//      (test/no-bare-img.test.ts) stays satisfied because the raw <img> lives
//      only in @/lib/theme-image.
//   2. `icon` — a value from the curated `iconOptions` select below, mapped to
//      a Lucide glyph. An unknown/arbitrary value degrades to `fallback` and
//      can never inject a component or reach the DOM as code (QA-03, D-04).
//
// Callers own sizing/color via `className` (e.g. "size-5 text-brand-yellow"):
// IconChip's `[&_svg]:size-*` rule only reaches real <svg> children, so an
// uploaded <img> needs the explicit size class the caller passes here.
export const iconMap: Record<
  string,
  React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  package: Package,
  truck: Truck,
  phone: Phone,
  "credit-card": CreditCard,
  plane: Plane,
  ship: Ship,
  customs: ClipboardCheck,
  globe: Globe,
  warehouse: Warehouse,
  percent: Percent,
  referrals: Users,
  gift: Gift,
  returns: RotateCcw,
  shield: ShieldCheck,
  app: Smartphone,
};

// Shared option list for every `icon` select in the theme — one source of
// truth, so ServiceItem and BenefitCard can never drift apart again.
export const iconOptions = [
  { value: "package", label: "Paquete" },
  { value: "truck", label: "Camión" },
  { value: "phone", label: "Teléfono" },
  { value: "app", label: "App móvil" },
  { value: "credit-card", label: "Tarjeta" },
  { value: "plane", label: "Avión" },
  { value: "ship", label: "Barco" },
  { value: "customs", label: "Aduanas" },
  { value: "globe", label: "Internacional" },
  { value: "warehouse", label: "Almacén" },
  { value: "percent", label: "Descuento / impuestos" },
  { value: "referrals", label: "Referidos" },
  { value: "gift", label: "Regalo" },
  { value: "returns", label: "Devoluciones" },
  { value: "shield", label: "Seguridad" },
];

// The `image_picker` setting that pairs with every `icon` select. Spread this
// into a schema right after the icon field so the two always stay adjacent.
export const customIconSetting = {
  id: "customIcon",
  label: "Icono personalizado (SVG)",
  type: "textarea",
  default: "",
  // REQUIRED, not cosmetic. The platform's TextareaInput does
  // `setting.max ?? 500` and puts it on the textarea's `maxLength`, so without
  // this a pasted SVG is silently truncated at 500 characters — shorter than
  // essentially every real icon. Derived from safe-svg.ts so this field can
  // never accept more markup than the renderer will take.
  max: SVG_MAX_LENGTH,
  placeholder: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>',
  info: "Opcional. Pega aquí el código SVG completo (debe empezar por <svg). Sustituye al icono seleccionado arriba. El SVG se muestra con sus propios colores.",
};

// A string is pasted SVG markup; an object is a legacy media-library value.
export type CustomIconValue = string | ThemeImageValue;

export interface ThemeIconProps {
  icon?: string;
  customIcon?: CustomIconValue;
  fallback?: string;
  className?: string;
}

export const ThemeIcon = ({
  icon,
  customIcon,
  fallback = "package",
  className,
}: ThemeIconProps): React.ReactNode => {
  // Pasted markup wins; an unparseable/hostile paste yields undefined and falls
  // through to the curated glyph rather than rendering a broken image.
  const pastedUrl =
    typeof customIcon === "string" ? safeSvgDataUri(customIcon) : undefined;
  const uploaded =
    customIcon && typeof customIcon !== "string" ? customIcon : undefined;
  const url = pastedUrl ?? uploaded?.url ?? undefined;

  if (url) {
    return (
      <ThemeImage
        url={url}
        alt={uploaded?.alt ?? ""}
        width={uploaded?.width}
        height={uploaded?.height}
        formats={uploaded?.formats}
        sizesHint="48px"
        positioning="custom"
        className={cn("object-contain", className)}
      />
    );
  }

  const Icon = iconMap[icon ?? ""] ?? iconMap[fallback] ?? Package;
  return <Icon aria-hidden="true" className={className} />;
};
