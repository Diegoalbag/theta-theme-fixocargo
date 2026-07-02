import * as React from "react";

// StatItem (NOS-03) — section-local leaf block for the NosotrosStats navy band.
// Renders a single stat as an authored TEXT number (e.g. "50K+", "24") plus a
// label. The number is TEXT — never a numeric input — so "50K+" renders verbatim.
// Stateless, brand tokens only, no hex, @/ imports only.
export interface StatItemProps {
  number?: string;
  label?: string;
  blockId?: string;
  blockType?: string;
}

export const StatItem = ({
  number = "50K+",
  label = "Paquetes al mes",
}: StatItemProps): React.ReactNode => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 text-center">
      <span className="font-display italic text-brand-yellow text-4xl lg:text-6xl leading-none">
        {number}
      </span>
      <span className="font-gotham font-bold text-sm tracking-wide text-white">
        {label}
      </span>
    </div>
  );
};

// Exactly 2 editable fields, ids → camelCase props. `number` is TEXT so authored
// values like "50K+" render verbatim.
export const statItemSettingsSchema = [
  {
    id: "number",
    label: "Número",
    type: "text",
    default: "50K+",
  },
  {
    id: "label",
    label: "Etiqueta",
    type: "text",
    default: "Paquetes al mes",
  },
];
