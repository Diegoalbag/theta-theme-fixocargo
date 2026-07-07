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
  Check,
} from "lucide-react";

import { Card } from "@/components/ui/card";

// ServiceCard (quick task 260707-etz) — section-local block for the
// ServiciosList grid. A white surface card: a navy icon tile, a gotham-bold
// title, a gill body, and up to 3 independently-guarded bullet points (each
// preceded by a yellow check glyph). The icon is chosen from the SAME curated
// select as ServiceItem/BenefitCard (enum → Lucide glyph via iconMap) — no
// free icon upload — with a defensive default so an unknown value NEVER
// crashes (QA-03 precedent).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiceCardProps {
  icon?: string;
  title?: string;
  body?: string;
  point1?: string;
  point2?: string;
  point3?: string;
  blockId?: string;
  blockType?: string;
}

// Identical enum set to ServiceItem/BenefitCard's iconMap.
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

export const ServiceCard = ({
  icon = "truck",
  title = "Envíos Nacionales",
  body = "Envía paquetes entre nuestras sucursales a nivel nacional, sin necesidad de ser miembro.",
  point1 = "Disponible en todas las sucursales",
  point2 = "Sin membresía requerida",
  point3 = "Solicítalo directo en el counter",
}: ServiceCardProps): React.ReactNode => {
  // Defensive default — an unknown/arbitrary select value degrades to the
  // Truck glyph and can never inject a component or reach the DOM as code.
  const Icon = iconMap[icon] ?? Truck;
  const points = [point1, point2, point3].filter(Boolean);

  return (
    <Card variant="surface" className="flex h-full flex-col p-8 shadow-sm">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-yellow">
        <Icon aria-hidden="true" className="size-7" />
      </div>

      {title && (
        <h3 className="mb-3 font-gotham text-xl font-bold text-brand-navy">
          {title}
        </h3>
      )}
      {body && (
        <p className="mb-5 font-gill text-base text-muted-foreground">
          {body}
        </p>
      )}

      {points.length > 0 && (
        <div className="mt-auto flex w-full flex-col gap-2.5">
          {points.map((point) => (
            <div key={point} className="flex items-center gap-2.5">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-yellow">
                <Check aria-hidden="true" className="size-3 text-brand-navy" />
              </span>
              <span className="font-gill text-sm text-foreground/80">
                {point}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Exactly 6 editable fields, ids → camelCase props. Same enum option list as
// ServiceItem/BenefitCard; default/fallback glyph is `truck`. point1-3 are
// optional bullet points, each independently guarded.
export const serviceCardSettingsSchema = [
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "truck",
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
    id: "title",
    label: "Título",
    type: "text",
    default: "Envíos Nacionales",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Envía paquetes entre nuestras sucursales a nivel nacional, sin necesidad de ser miembro.",
  },
  {
    id: "point1",
    label: "Punto 1",
    type: "text",
    default: "Disponible en todas las sucursales",
    placeholder: "Punto opcional",
  },
  {
    id: "point2",
    label: "Punto 2",
    type: "text",
    default: "Sin membresía requerida",
    placeholder: "Punto opcional",
  },
  {
    id: "point3",
    label: "Punto 3",
    type: "text",
    default: "Solicítalo directo en el counter",
    placeholder: "Punto opcional",
  },
];
