import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// Sucursales (INF-01) — the light "find a branch" section. A light SectionHeading
// over a two-column row (stacked on mobile): LEFT = a decorative, non-interactive
// search input + a responsive grid BlocksSlot of section-local `branch` cards;
// RIGHT = a contained static map panel via ImageGuard (the boxed-image case —
// NOT the full-bleed <img>, Pitfall 4).
//
// The search input is decorative by construction (D-03): readOnly + aria-hidden +
// tabIndex={-1}, no React state, no onChange/onSubmit. The default BlocksSlot
// EmptyState is KEPT (do NOT pass empty={null}, D-08). Layout classes live on the
// slot's own wrapper className, never on the slot return (Pitfall 2).
//
// Stateless: no useState, no event handlers. Brand tokens only — no hex literals.
// @/ imports only.
export interface SucursalesProps {
  heading?: string;
  subtitle?: string;
  mapImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Sucursales = ({
  heading = "Nuestras Sucursales",
  subtitle = "Siempre cerca de ti: tu courier de confianza, estés donde estés",
  mapImage,
  renderBlocks,
}: SucursalesProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading variant="light" title={heading} eyebrow={subtitle} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* LEFT — decorative search + branch-list slot. */}
          <div className="flex flex-col gap-4 lg:flex-1">
            {/* Decorative search (D-03): inert, no state, no handlers. */}
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-5 h-[60px]">
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <input
                type="text"
                readOnly
                aria-hidden="true"
                tabIndex={-1}
                placeholder="Ingresa la ubicación"
                className="flex-1 bg-transparent outline-none text-muted-foreground"
              />
            </div>

            <BlocksSlot
              renderBlocks={renderBlocks}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            />
          </div>

          {/* RIGHT — static map panel (contained ImageGuard). */}
          <div className="w-full lg:flex-1">
            <ImageGuard
              url={mapImage?.url}
              alt={mapImage?.alt ?? ""}
              ratio={760 / 630}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Exactly 3 editable fields, ids → camelCase props. image_picker default
// `undefined` so an unset map image hits the ImageGuard placeholder.
export const sucursalesSettingsSchema = [
  {
    id: "heading",
    label: "Encabezado",
    type: "text",
    default: "Nuestras Sucursales",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "Siempre cerca de ti: tu courier de confianza, estés donde estés",
  },
  {
    id: "mapImage",
    label: "Imagen del mapa",
    type: "image_picker",
    default: undefined,
  },
];
