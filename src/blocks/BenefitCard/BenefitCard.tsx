import * as React from "react";

import { IconChip } from "@/components/ui/icon-chip";
import {
  ThemeIcon,
  iconOptions,
  customIconSetting,
  type CustomIconValue,
} from "@/components/ui/theme-icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// BenefitCard (SVC-02) — section-local block for the Beneficios dark band.
// A yellow circular IconChip badge over a gotham-bold title + open-sans body on
// the navy surface, plus a real "Conoce más" anchor with a trailing arrow. The
// icon is chosen from the SAME curated select as ServiceItem (enum → Lucide
// glyph) OR replaced by a merchant-uploaded SVG/PNG (`customIcon`), with a
// defensive default so an unknown value NEVER crashes (QA-03, D-04) — both
// paths share the @/components/ui/theme-icon seam. The benefit-card
// default/fallback glyph is `truck` per the FixoCargo design.
//
// `variant` (quick task 260706-qqi) adds a second styling axis: "dark"
// (default) is the ORIGINAL Beneficios card, byte-identical to before this
// axis existed — its className strings are untouched. "light" is the
// BeneficiosGrid white card: a `surface` Card, a navy IconChip, a navy title,
// a muted-foreground gill body, and NO "Conoce más" link at all. benefit-card
// is now promoted to a TRUE global block (src/registry.ts), reused by both the
// original Beneficios section and the new BeneficiosGrid section.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface BenefitCardProps {
  icon?: string;
  customIcon?: CustomIconValue;
  title?: string;
  body?: string;
  linkUrl?: string;
  variant?: "dark" | "light";
  blockId?: string;
  blockType?: string;
}

export const BenefitCard = ({
  icon = "truck",
  customIcon,
  title = "Entrega Rápida y Segura",
  body = "Tus paquetes llegan a tiempo y en perfecto estado, con seguimiento de principio a fin.",
  linkUrl = "#",
  variant = "dark",
}: BenefitCardProps): React.ReactNode => {
  const isLight = variant === "light";

  return (
    <Card
      variant={isLight ? "surface" : "navy-dark"}
      className="flex flex-col p-7 gap-4 shadow-2xl"
    >
      <IconChip background={isLight ? "navy" : "yellow"} size="lg">
        <ThemeIcon
          icon={icon}
          customIcon={customIcon}
          fallback="truck"
          className="size-6"
        />
      </IconChip>

      <h3
        className={
          isLight
            ? "font-gotham font-bold text-2xl leading-tight text-brand-navy"
            : "font-gotham font-bold text-white text-2xl leading-tight"
        }
      >
        {title}
      </h3>

      {body && (
        <p
          className={
            isLight
              ? "font-gill text-muted-foreground text-lg leading-5"
              : "font-opensans text-white/80 text-lg leading-5"
          }
        >
          {body}
        </p>
      )}

      {!isLight && (
        <Button variant="link" asChild className="text-brand-white w-min!">
          <a href={linkUrl || "#"}>Conoce más</a>
        </Button>
      )}
    </Card>
  );
};

// Six editable fields, ids → camelCase props. Same shared option list as
// ServiceItem, plus the optional `customIcon` upload; the default/fallback
// glyph is `truck`. `variant` (quick task
// 260706-qqi) is the dark/light styling axis — dark is the original card.
export const benefitCardSettingsSchema = [
  {
    id: "icon",
    label: "Icono",
    type: "select",
    default: "truck",
    options: iconOptions,
  },
  { ...customIconSetting },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Entrega Rápida y Segura",
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
    id: "variant",
    label: "Estilo",
    type: "select",
    default: "dark",
    options: [
      { value: "dark", label: "Oscuro" },
      { value: "light", label: "Claro" },
    ],
  },
];
