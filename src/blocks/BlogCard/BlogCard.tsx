import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageGuard } from "@/lib/image-guard";

// BlogCard (INF-03) — section-local block for the Blogs light band. A contained
// ImageGuard cover (~422×240) with up to two guarded category pills overlaid
// (navy `tagPrimary` + yellow `tagSecondary`, D-01 — each pill renders ONLY when
// its value is present), an optional date, a gotham-bold title, an optional
// open-sans excerpt, and a real "Conoce más" anchor with a trailing arrow.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface BlogCardProps {
  image?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  tagPrimary?: string;
  tagSecondary?: string;
  date?: string;
  title?: string;
  excerpt?: string;
  linkUrl?: string;
  blockId?: string;
  blockType?: string;
}

export const BlogCard = ({
  image,
  tagPrimary,
  tagSecondary,
  date,
  title = "Cómo calcular impuestos de tu paquete",
  excerpt,
  linkUrl,
}: BlogCardProps): React.ReactNode => {
  return (
    <Card variant="surface" className="flex flex-col gap-4 overflow-hidden p-0">
      <div className="relative">
        <ImageGuard url={image?.url} alt={image?.alt ?? ""} ratio={422 / 240} />

        {/* D-01: each category pill renders ONLY when its value is present. */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {tagPrimary && (
            <span className="rounded-full bg-brand-navy px-3 py-1 font-gotham text-xs font-bold text-white">
              {tagPrimary}
            </span>
          )}
          {tagSecondary && (
            <span className="rounded-full bg-brand-yellow px-3 py-1 font-gotham text-xs font-bold text-brand-navy">
              {tagSecondary}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6">
        {date && (
          <span className="font-gill text-sm text-muted-foreground">{date}</span>
        )}

        <h3 className="font-gotham text-xl font-bold text-brand-navy leading-tight">
          {title}
        </h3>

        {excerpt && (
          <p className="font-opensans text-muted-foreground">{excerpt}</p>
        )}

        <Button
          variant="link"
          asChild
          className="mt-2 self-start text-brand-navy"
        >
          <a href={linkUrl || "#"}>
            Conoce más
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </div>
    </Card>
  );
};

// Exactly 7 editable fields, ids → camelCase props. Two tags per D-01.
export const blogCardSettingsSchema = [
  {
    id: "image",
    label: "Imagen",
    type: "image_picker",
  },
  {
    id: "tagPrimary",
    label: "Etiqueta principal",
    type: "text",
    default: "",
  },
  {
    id: "tagSecondary",
    label: "Etiqueta secundaria",
    type: "text",
    default: "",
  },
  {
    id: "date",
    label: "Fecha",
    type: "text",
    default: "",
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Cómo calcular impuestos de tu paquete",
  },
  {
    id: "excerpt",
    label: "Resumen",
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
];
