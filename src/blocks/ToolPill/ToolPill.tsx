import * as React from "react";
import {
  Search,
  Calculator,
  MapPin,
  Truck,
  Package,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/icon-chip";

// Section-local block (ATF-03) for the ToolsBar: a single quick-action pill
// rendered as a real <a>, styled through the shared Button (`tool-pill` variant
// + `tool` size) via asChild so the anchor keeps its href. The icon is chosen
// from a curated select (enum → Lucide glyph via iconMap) — no free icon upload
// — with a defensive default so an unknown value NEVER crashes (QA-03). Pill is
// uniform brand-yellow with a navy gotham-bold label and a trailing navy
// IconChip whose glyph is forced brand-yellow via a className override (D-08).
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
    <Button asChild variant="tool-pill" size="tool">
      <a href={url || "#"}>
        <span>{label}</span>
        <IconChip background="navy" size="lg" className="text-brand-yellow">
          {/* size-5 keeps the chip glyph at 20px: the Button's
              [&_svg:not([class*='size-'])]:size-4 rule is more specific than
              IconChip's [&_svg]:size-5 and would otherwise shrink it. */}
          <Icon aria-hidden="true" className="size-6" />
        </IconChip>
      </a>
    </Button>
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
