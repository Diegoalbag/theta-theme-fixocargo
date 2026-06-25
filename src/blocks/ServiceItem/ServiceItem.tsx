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
  ChevronDown,
} from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";
import { Button } from "@/components/ui/button";

// ServiceItem (SVC-01) — section-local block for the Servicios band. A no-JS
// native <details>/<summary> accordion (D-01): its initial expanded state simply
// follows the `isExpanded` prop, so the host's boolean checkbox drives it with
// zero client JS. The icon is chosen from a curated select (enum → Lucide glyph
// via iconMap) — no free icon upload — with a defensive default so an unknown
// value NEVER crashes (QA-03, D-04). Navy IconChip accent, gotham-bold title,
// open-sans body, and a real "Conoce más" anchor link.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiceItemProps {
  title?: string;
  icon?: string;
  body?: string;
  linkUrl?: string;
  isExpanded?: boolean;
  blockId?: string;
  blockType?: string;
}

const iconMap: Record<
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
};

export const ServiceItem = ({
  title = "Envíos Nacionales",
  icon = "package",
  body = "",
  linkUrl = "#",
  isExpanded = false,
}: ServiceItemProps): React.ReactNode => {
  // Defensive default — an unknown/arbitrary select value degrades to the
  // Package glyph and can never inject a component or reach the DOM as code.
  const Icon = iconMap[icon] ?? Package;

  return (
    <details
      open={isExpanded}
      className="group border-b border-border py-4"
    >
      <summary className="list-none cursor-pointer flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden marker:content-['']">
        <span className="flex items-center gap-4">
          <IconChip background="navy" size="md">
            <Icon aria-hidden="true" />
          </IconChip>
          <span className="font-gotham font-bold text-brand-navy">
            {title}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-brand-navy transition-transform group-open:rotate-180"
        />
      </summary>

      {body && (
        <p className="mt-3 text-muted-foreground font-opensans">{body}</p>
      )}

      <div className="mt-3">
        <Button variant="link" asChild>
          <a href={linkUrl || "#"}>Conoce más</a>
        </Button>
      </div>
    </details>
  );
};

export const serviceItemSettingsSchema = [
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Envíos Nacionales",
  },
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "package",
    options: [
      { value: "package", label: "Paquete" },
      { value: "truck", label: "Camión" },
      { value: "phone", label: "Teléfono" },
      { value: "credit-card", label: "Tarjeta" },
      { value: "plane", label: "Avión" },
      { value: "ship", label: "Barco" },
      { value: "customs", label: "Aduanas" },
      { value: "globe", label: "Internacional" },
      { value: "warehouse", label: "Almacén" },
    ],
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default: "",
  },
  {
    id: "linkUrl",
    label: "Enlace",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
  {
    id: "isExpanded",
    label: "Expandido por defecto",
    type: "checkbox",
    default: false,
  },
];
