import * as React from "react";
import { Phone, Mail } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Branch (INF-01) — section-local block for the Sucursales section. A surface
// card with the branch name, optional guarded phone/email rows, and two action
// buttons: "Contáctanos" (→ tel:) and "Dirección" (→ mapUrl).
//
// Guard (D-04 / QA-01 / Pitfall 1): NEVER emit an empty `tel:` / `mailto:` href.
// The phone/email rows render only when their value is set, and the always-shown
// "Contáctanos" button degrades to an inert `disabled` <span> when phone is
// empty — never a broken anchor. "Dirección" falls back to "#" (harmless).
//
// Stateless: no useState, no event handlers. All text is auto-escaped JSX text
// (no dangerouslySetInnerHTML). Brand tokens only — no hex literals. @/ imports.
export interface BranchProps {
  name?: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
  blockId?: string;
  blockType?: string;
}

export const Branch = ({
  name = "SD | Av. Independencia",
  phone,
  email,
  mapUrl,
}: BranchProps): React.ReactNode => {
  return (
    <Card variant="surface" className="flex flex-col gap-3">
      <h3 className="font-gotham font-bold text-brand-navy text-xl">{name}</h3>

      {/* GUARD (D-04 / QA-01): NEVER emit href="tel:" / "mailto:" empty. */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <Phone aria-hidden="true" className="size-4 shrink-0" />
          {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <Mail aria-hidden="true" className="size-4 shrink-0" />
          {email}
        </a>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {/* "Contáctanos" → tel:. Inert disabled <span> when phone empty. */}
        {phone ? (
          <Button variant="navy" asChild>
            <a href={`tel:${phone}`}>Contáctanos</a>
          </Button>
        ) : (
          <Button variant="navy" disabled>
            <span>Contáctanos</span>
          </Button>
        )}
        {/* "Dirección" → mapUrl; "#" fallback is harmless. */}
        <Button variant="pill" asChild>
          <a href={mapUrl || "#"}>Dirección</a>
        </Button>
      </div>
    </Card>
  );
};

// Exactly 4 editable fields, ids → camelCase props (locked fields).
export const branchSettingsSchema = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    default: "SD | Av. Independencia",
  },
  {
    id: "phone",
    label: "Teléfono",
    type: "text",
    default: "809-285-4230",
  },
  {
    id: "email",
    label: "Correo",
    type: "text",
    default: "info@fixocargo.com",
  },
  {
    id: "mapUrl",
    label: "Enlace de mapa",
    type: "url",
    default: "#",
    placeholder: "https://maps.google.com/…",
  },
];
