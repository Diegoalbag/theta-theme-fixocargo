import * as React from "react";
import { Bell, MapPin, FileText, FileCheck, CreditCard, Headphones } from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";

// AppFeatureItem (quick task 260706-qqi) — section-local block for the
// AppFeatures dark band. A STATIC icon+text row (NO <details>, no accordion,
// no link — unlike ServiceItem/FaqItem/BenefitCard): a yellow circular
// IconChip badge beside a gotham-bold white title + a gill white/70 body, on a
// subtle white/5 ring-bordered surface. The icon is chosen from a curated
// select (enum → Lucide glyph via iconMap) with a defensive default so an
// unknown value NEVER crashes (QA-03 precedent).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface AppFeatureItemProps {
  icon?: string;
  title?: string;
  body?: string;
  blockId?: string;
  blockType?: string;
}

const iconMap: Record<
  string,
  React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  bell: Bell,
  "map-pin": MapPin,
  "file-text": FileText,
  "file-check": FileCheck,
  "credit-card": CreditCard,
  headphones: Headphones,
};

export const AppFeatureItem = ({
  icon = "bell",
  title = "Noticias y Promociones",
  body = "Mantente al día con las últimas noticias y aprovecha promociones exclusivas desde la app.",
}: AppFeatureItemProps): React.ReactNode => {
  // Defensive default — an unknown/arbitrary select value degrades to the Bell
  // glyph and can never inject a component or reach the DOM as code.
  const Icon = iconMap[icon] ?? Bell;

  return (
    <div className="flex items-start gap-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-7">
      <IconChip background="yellow" size="lg" className="shrink-0">
        <Icon aria-hidden="true" />
      </IconChip>

      <div className="flex flex-col gap-2">
        {title && (
          <span className="font-gotham font-bold text-white text-xl leading-tight">
            {title}
          </span>
        )}
        {body && (
          <p className="font-gill text-white/70 text-base leading-5">{body}</p>
        )}
      </div>
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props.
export const appFeatureItemSettingsSchema = [
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "bell",
    options: [
      { value: "bell", label: "Notificaciones" },
      { value: "map-pin", label: "Ubicación" },
      { value: "file-text", label: "Documento" },
      { value: "file-check", label: "Verificación" },
      { value: "credit-card", label: "Pago" },
      { value: "headphones", label: "Soporte" },
    ],
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Noticias y Promociones",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Mantente al día con las últimas noticias y aprovecha promociones exclusivas desde la app.",
  },
];
