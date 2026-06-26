import * as React from "react";
import { User, MapPin, Phone, Copy } from "lucide-react";

import { Card } from "@/components/ui/card";

// AddressCard (ATF-02) — section-local block for DireccionCards.
// A navy receiving-address card with three fixed brand-yellow icon rows
// (person / pin / phone — icons are component-fixed, NOT editable, D-06) and a
// real, stateless copy button that writes its OWN address prop to the clipboard.
//
// Purity note (D-05): components are stateless — NO useState, NO success/error
// UI. Event handlers ARE allowed; the copy button's onClick is a guarded,
// fire-and-forget clipboard write. Optional-chaining guards non-secure contexts
// (navigator.clipboard is undefined off https/localhost) and the .catch swallows
// a denied-permission rejection. The handler never runs during static render.
// All four text fields are auto-escaped JSX text nodes (no dangerouslySetInnerHTML).
export interface AddressCardProps {
  title?: string;
  recipientLine?: string;
  address?: string;
  phone?: string;
  blockId?: string;
  blockType?: string;
}

const DEFAULT_ADDRESS =
  "8220 NW 68th Street, Fixocargo Suite 8220, Miami, Florida 33195-2791";

export const AddressCard = ({
  title,
  recipientLine,
  address,
  phone,
}: AddressCardProps): React.ReactNode => {
  const addressValue = address ?? DEFAULT_ADDRESS;

  return (
    <Card variant="navy-dark" className="relative p-7">
      <button
        type="button"
        aria-label="Copiar dirección"
        onClick={() => {
          navigator.clipboard?.writeText(addressValue).catch(() => {});
        }}
        className="absolute right-6 top-auto bottom-6 sm:bottom-auto sm:top-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90"
      >
        <Copy aria-hidden="true" className="size-6" />
      </button>

      <div className="flex flex-col gap-3">
        <h3 className="font-gotham font-bold text-white text-2xl md:text-4xl leading-tight">
          {title ?? "Dirección en Miami:"}
        </h3>

        <div className="flex items-center gap-3">
          <User
            aria-hidden="true"
            className="size-5 text-brand-yellow fill-brand-yellow shrink-0"
          />
          <span className="font-gill text-base md:text-xl text-white">
            {recipientLine ?? "FC-XXXXX + Tu nombre y apellido"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <MapPin
            aria-hidden="true"
            className="size-5 text-brand-yellow fill-brand-yellow shrink-0"
          />
          <span className="font-gill text-base md:text-xl text-white">
            {addressValue}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Phone
            aria-hidden="true"
            className="size-5 text-brand-yellow fill-brand-yellow shrink-0"
          />
          <span className="font-gill text-base md:text-xl text-white">
            {phone ?? "+1 305 456 1237"}
          </span>
        </div>
      </div>
    </Card>
  );
};

// Exactly 4 editable fields, ids → camelCase props (D-06 — NO icon field).
export const addressCardSettingsSchema = [
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Dirección en Miami:",
  },
  {
    id: "recipientLine",
    label: "Destinatario",
    type: "text",
    default: "FC-XXXXX + Tu nombre y apellido",
  },
  {
    id: "address",
    label: "Dirección",
    type: "textarea",
    default:
      "8220 NW 68th Street, Fixocargo Suite 8220, Miami, Florida 33195-2791",
  },
  {
    id: "phone",
    label: "Teléfono",
    type: "text",
    default: "+1 305 456 1237",
  },
];
