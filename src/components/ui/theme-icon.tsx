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
import { cn } from "@/lib/utils";

// ThemeIcon — the single icon seam shared by every block that renders a glyph
// (ServiceItem, BenefitCard). Two mutually exclusive sources, checked in this
// order:
//
//   1. `customIcon` — a merchant-uploaded image (SVG/PNG) from the media
//      library. Rendered through ThemeImage, NEVER as inline/raw markup: an
//      uploaded SVG is served as an <img src> so its contents can never
//      execute script in the page's origin, and the no-bare-img gate
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
  type: "image_picker",
  default: undefined,
  info: "Opcional. Si subes una imagen SVG o PNG, sustituye al icono seleccionado arriba.",
};

export interface ThemeIconProps {
  icon?: string;
  customIcon?: ThemeImageValue;
  fallback?: string;
  className?: string;
}

export const ThemeIcon = ({
  icon,
  customIcon,
  fallback = "package",
  className,
}: ThemeIconProps): React.ReactNode => {
  if (customIcon?.url) {
    return (
      <ThemeImage
        url={customIcon.url}
        alt={customIcon.alt ?? ""}
        width={customIcon.width}
        height={customIcon.height}
        formats={customIcon.formats}
        sizesHint="48px"
        positioning="custom"
        className={cn("object-contain", className)}
      />
    );
  }

  const Icon = iconMap[icon ?? ""] ?? iconMap[fallback] ?? Package;
  return <Icon aria-hidden="true" className={className} />;
};
