import * as React from "react";
import {
  MoveRight,
  MapPin,
  ShieldCheck,
  Heart,
  Clock,
  ThumbsUp,
  BadgeCheck,
  Zap,
  Star,
  Handshake,
} from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";

// ValueCard (NOS-04, D-01) — section-local block for the nosotros-values grid.
// A navy circular IconChip badge holding a yellow glyph, over a gotham-bold
// title + gill body on a light card surface. The icon is chosen from a curated,
// values-themed `select` (enum → Lucide glyph via iconMap) — no free icon
// upload — with a defensive default so an unknown value NEVER crashes
// (T-09-02, QA-03). The value-card default/fallback glyph is `shield`.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ValueCardProps {
  icon?: string;
  title?: string;
  body?: string;
  blockId?: string;
  blockType?: string;
}

// Curated D-01 values enum → Lucide glyph. Same typed shape as BenefitCard's
// iconMap; every glyph is a verified lucide-react export.
const iconMap: Record<
  string,
  React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  arrow: MoveRight,
  "map-pin": MapPin,
  shield: ShieldCheck,
  heart: Heart,
  clock: Clock,
  "thumbs-up": ThumbsUp,
  "check-circle": BadgeCheck,
  zap: Zap,
  star: Star,
  handshake: Handshake,
};

export const ValueCard = ({
  icon = "shield",
  title = "Rapidez con cuidado",
  body = "",
}: ValueCardProps): React.ReactNode => {
  // Defensive default (T-09-02) — an unknown/arbitrary select value degrades to
  // the ShieldCheck glyph and can never inject a component or reach the DOM as
  // code (no switch, no dynamic component-name lookup).
  const Icon = iconMap[icon] ?? ShieldCheck;

  return (
    <div className="flex flex-col items-start rounded-2xl bg-card p-8 shadow">
      <IconChip background="navy" size="xl" className="mb-6">
        <Icon aria-hidden="true" className="text-brand-yellow" />
      </IconChip>

      {title && (
        <h3 className="uppercase font-gotham font-bold text-xl text-brand-navy mb-3">
          {title}
        </h3>
      )}

      {body && (
        <p className="font-gill text-base text-muted-foreground">{body}</p>
      )}
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props. Curated values enum; the
// select `value`s equal the iconMap keys; default/fallback glyph is `shield`.
export const valueCardSettingsSchema = [
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "shield",
    options: [
      { value: "arrow", label: "Rapidez" },
      { value: "map-pin", label: "Cercanía" },
      { value: "shield", label: "Confianza" },
      { value: "heart", label: "Cuidado" },
      { value: "clock", label: "Puntualidad" },
      { value: "thumbs-up", label: "Satisfacción" },
      { value: "check-circle", label: "Garantía" },
      { value: "zap", label: "Agilidad" },
      { value: "star", label: "Calidad" },
      { value: "handshake", label: "Compromiso" },
    ],
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Rapidez con cuidado",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default: "",
  },
];
