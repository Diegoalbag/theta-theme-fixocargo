import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ImageGuard } from "@/lib/image-guard";

// PartnerCard (quick task 260708-dm3) — section-local block for the
// Fixolidario partners grid. A dark card (overflow-hidden/p-0 override via
// tailwind-merge, exact precedent in BlogCard) with a centered contained-logo
// header (ImageGuard, guarded placeholder when unset), a yellow divider, and
// name/body/link content — each independently guarded.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface PartnerCardProps {
  logo?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  name?: string;
  body?: string;
  linkLabel?: string;
  linkUrl?: string;
  blockId?: string;
  blockType?: string;
}

export const PartnerCard = ({
  logo,
  name = "FACCI",
  body = "Fundación Amigos Contra el Cáncer Infantil. Desde 2003 mejora la vida de niños y adolescentes con cáncer en República Dominicana, brindando asistencia integral a pacientes y familias.",
  linkLabel = "Regístrate y dona",
  linkUrl = "#",
}: PartnerCardProps): React.ReactNode => {
  return (
    <Card variant="navy-dark" className="flex h-full flex-col overflow-hidden p-0">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[220px]">
          <ImageGuard
            url={logo?.url}
            alt={logo?.alt ?? name ?? ""}
            ratio={220 / 82}
            width={logo?.width}
            height={logo?.height}
          />
        </div>
      </div>

      <div aria-hidden="true" className="h-1 w-full bg-brand-yellow" />

      <div className="flex flex-1 flex-col items-start gap-3 p-7">
        {name && (
          <h3 className="font-gotham text-lg font-bold text-white">{name}</h3>
        )}
        {body && (
          <p className="font-gill text-sm text-white/70">{body}</p>
        )}
        {linkLabel && (
          <a
            href={linkUrl || "#"}
            className="mt-auto flex items-center gap-2 font-gotham text-sm font-bold text-brand-yellow"
          >
            {linkLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        )}
      </div>
    </Card>
  );
};

// Exactly 5 editable fields, ids → camelCase props.
export const partnerCardSettingsSchema = [
  {
    id: "logo",
    label: "Logo",
    type: "image_picker",
  },
  {
    id: "name",
    label: "Nombre",
    type: "text",
    default: "FACCI",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Fundación Amigos Contra el Cáncer Infantil. Desde 2003 mejora la vida de niños y adolescentes con cáncer en República Dominicana, brindando asistencia integral a pacientes y familias.",
  },
  {
    id: "linkLabel",
    label: "Texto del enlace",
    type: "text",
    default: "Regístrate y dona",
  },
  {
    id: "linkUrl",
    label: "Enlace",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
