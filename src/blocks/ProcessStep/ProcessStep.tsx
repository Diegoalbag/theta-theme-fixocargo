import * as React from "react";

// ProcessStep (quick task 260707-etz) — section-local block for the
// ProcesoEnvio grid. A SELF-CONTAINED numbered circle + title + body. This
// block never renders a connector line/divider/border of its own — the
// customizer wraps every block individually, defeating any `:last-child`
// CSS trick on a block root (per the NosotrosTimeline precedent). The
// horizontal connector overlay is drawn ENTIRELY by the section wrapper.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ProcessStepProps {
  number?: string;
  title?: string;
  body?: string;
  blockId?: string;
  blockType?: string;
}

export const ProcessStep = ({
  number = "1",
  title = "Compra y prealerta",
  body = "Compra en tus tiendas favoritas usando tu casillero de Miami y sube la prealerta en la app.",
}: ProcessStepProps): React.ReactNode => {
  return (
    <div className="flex flex-col items-start gap-4">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-yellow font-aku italic text-2xl text-brand-navy">
        {number}
      </span>
      {title && (
        <h3 className="font-gotham text-xl font-bold text-white">{title}</h3>
      )}
      {body && <p className="font-gill text-base text-white/70">{body}</p>}
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props.
export const processStepSettingsSchema = [
  {
    id: "number",
    label: "Número",
    type: "text",
    default: "1",
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Compra y prealerta",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Compra en tus tiendas favoritas usando tu casillero de Miami y sube la prealerta en la app.",
  },
];
