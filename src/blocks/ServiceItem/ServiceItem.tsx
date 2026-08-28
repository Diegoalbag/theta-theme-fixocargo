import * as React from "react";
import { ChevronDown } from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";
import {
  ThemeIcon,
  iconOptions,
  customIconSetting,
  type CustomIconValue,
} from "@/components/ui/theme-icon";
import { Button } from "@/components/ui/button";

// ServiceItem (SVC-01) — section-local block for the Servicios band. A no-JS
// native <details>/<summary> accordion (D-01): its initial expanded state simply
// follows the `isExpanded` prop, so the host's boolean checkbox drives it with
// zero client JS. The icon is chosen from a curated select (enum → Lucide glyph
// via iconMap) OR replaced by a merchant-uploaded SVG/PNG (`customIcon`), with
// a defensive default so an unknown value NEVER crashes (QA-03, D-04) — both
// paths go through the shared @/components/ui/theme-icon seam. Navy IconChip
// accent, gotham-bold title,
// open-sans body, and a real "Conoce más" anchor link.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiceItemProps {
  title?: string;
  icon?: string;
  customIcon?: CustomIconValue;
  body?: string;
  linkUrl?: string;
  isExpanded?: boolean;
  blockId?: string;
  blockType?: string;
}

export const ServiceItem = ({
  title = "Envíos Nacionales",
  icon = "package",
  customIcon,
  body = "",
  linkUrl = "#",
  isExpanded = false,
}: ServiceItemProps): React.ReactNode => {
  return (
    <details open={isExpanded} className="group bg-card shadow py-5 px-7 rounded-2xl">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden marker:content-['']">
        <span className="flex items-center gap-4">
          <IconChip background="navy" size="md">
            <ThemeIcon
              icon={icon}
              customIcon={customIcon}
              fallback="package"
              className="size-5 text-brand-yellow"
            />
          </IconChip>
          <span className="font-gotham font-bold text-brand-navy">{title}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-brand-navy transition-transform group-open:rotate-180"
        />
      </summary>

      {body && (
        <p className="mt-3 text-muted-foreground font-gill leading-5">{body}</p>
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
    options: iconOptions,
  },
  { ...customIconSetting },
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
