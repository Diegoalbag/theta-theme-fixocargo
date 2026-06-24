import * as React from "react";
import { Search, Calculator, MapPin, Truck, Package, Phone } from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";

// Section-local block (ATF-03) for the ToolsBar: a single quick-action pill
// rendered as a real <a>. The icon is chosen from a curated select (enum →
// Lucide glyph via iconMap) — no free icon upload — with a defensive default so
// an unknown value NEVER crashes (QA-03). Pill is uniform brand-yellow with a
// navy gotham-bold label and a trailing navy IconChip whose glyph is forced
// brand-yellow via a className override (D-08).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ToolPillProps {
  label?: string;
  url?: string;
  icon?: string;
  blockId?: string;
  blockType?: string;
}

const iconMap: Record<
  string,
  React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  search: Search,
  calculator: Calculator,
  "map-pin": MapPin,
  truck: Truck,
  package: Package,
  phone: Phone,
};

export const ToolPill = ({
  label = "Rastrea",
  url = "#",
  icon = "search",
}: ToolPillProps): React.ReactNode => {
  // Defensive default — an unknown/arbitrary select value degrades to the
  // Search glyph and can never inject a component or reach the DOM as code.
  const Icon = iconMap[icon] ?? Search;

  return (
    <a
      href={url || "#"}
      className="flex items-center justify-between gap-4 rounded-full bg-brand-yellow px-6 h-16 md:h-20 hover:bg-brand-yellow/90 transition-colors"
    >
      <span className="font-gotham font-bold text-brand-navy">{label}</span>
      <IconChip background="navy" size="md" className="text-brand-yellow">
        <Icon aria-hidden="true" />
      </IconChip>
    </a>
  );
};

export const toolPillSettingsSchema = [
  {
    id: "label",
    label: "Texto",
    type: "text",
    default: "Rastrea",
  },
  {
    id: "url",
    label: "Enlace",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "search",
    options: [
      { value: "search", label: "Búsqueda" },
      { value: "calculator", label: "Calculadora" },
      { value: "map-pin", label: "Ubicación" },
      { value: "truck", label: "Camión" },
      { value: "package", label: "Paquete" },
      { value: "phone", label: "Teléfono" },
    ],
  },
];
