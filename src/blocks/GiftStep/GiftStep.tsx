import * as React from "react";

// GiftStep (quick task 260706-qqi) — section-local block for the ListaRegalos
// "¿Cómo funciona?" step row. A numbered display-italic yellow index over a
// gotham-bold navy title + a muted-foreground gill body. Each field is
// guarded so a blank field renders nothing.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface GiftStepProps {
  index?: string;
  title?: string;
  body?: string;
  blockId?: string;
  blockType?: string;
}

export const GiftStep = ({
  index = "01",
  title = "Crea tu lista de regalos",
  body = "En una tienda en línea que ofrezca este servicio.",
}: GiftStepProps): React.ReactNode => {
  return (
    <div className="flex flex-col items-start rounded-2xl bg-card p-8 shadow">
      {index && (
        <span className="mb-4 font-aku italic text-brand-yellow text-5xl leading-none">
          {index}
        </span>
      )}
      {title && (
        <span className="mb-2 font-gotham font-bold text-brand-navy text-xl leading-tight">
          {title}
        </span>
      )}
      {body && (
        <p className="font-gill text-muted-foreground text-base leading-5">
          {body}
        </p>
      )}
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props.
export const giftStepSettingsSchema = [
  {
    id: "index",
    label: "Número",
    type: "text",
    default: "01",
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Crea tu lista de regalos",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default: "En una tienda en línea que ofrezca este servicio.",
  },
];
