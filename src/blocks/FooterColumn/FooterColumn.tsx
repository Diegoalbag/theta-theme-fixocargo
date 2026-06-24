import * as React from "react";

// FooterColumn — section-local block for Footer link columns (CHR-03, D-05).
// Renders a column heading + up to 6 fixed link slots. Empty link slots
// (no label) render nothing — the merchant only sees what they fill in.
//
// No state, no event handlers. All content arrives as props from the platform.
// All text is rendered as JSX text nodes (no dangerouslySetInnerHTML).
// Real anchor elements for all links — not buttons, not divs.
export interface FooterColumnProps {
  title?: string;
  link1Label?: string;
  link1Url?: string;
  link2Label?: string;
  link2Url?: string;
  link3Label?: string;
  link3Url?: string;
  link4Label?: string;
  link4Url?: string;
  link5Label?: string;
  link5Url?: string;
  link6Label?: string;
  link6Url?: string;
  blockId?: string;
  blockType?: string;
}

export const FooterColumn = ({
  title,
  link1Label,
  link1Url,
  link2Label,
  link2Url,
  link3Label,
  link3Url,
  link4Label,
  link4Url,
  link5Label,
  link5Url,
  link6Label,
  link6Url,
}: FooterColumnProps): React.ReactNode => {
  // Build the 6 fixed link slots. Empty label => slot is omitted (D-05).
  const allLinks = [
    { label: link1Label, url: link1Url },
    { label: link2Label, url: link2Url },
    { label: link3Label, url: link3Url },
    { label: link4Label, url: link4Url },
    { label: link5Label, url: link5Url },
    { label: link6Label, url: link6Url },
  ];

  const activeLinks = allLinks.filter((entry) => !!entry.label);

  return (
    <div className="flex min-w-[140px] flex-col gap-2">
      {title && (
        <p className="font-gotham font-bold text-white text-base leading-tight">
          {title}
        </p>
      )}
      {activeLinks.map((entry, idx) => (
        <a
          key={idx}
          href={entry.url || "#"}
          className="text-sm font-opensans text-white hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
        >
          {entry.label}
        </a>
      ))}
    </div>
  );
};

// 13 settings: column title + 6 pairs of (label, url) — fixed slot count (D-05).
export const footerColumnSettingsSchema = [
  {
    id: "title",
    label: "Título de columna",
    type: "text",
    default: "",
  },
  {
    id: "link1Label",
    label: "Enlace 1 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link1Url",
    label: "Enlace 1 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "link2Label",
    label: "Enlace 2 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link2Url",
    label: "Enlace 2 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "link3Label",
    label: "Enlace 3 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link3Url",
    label: "Enlace 3 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "link4Label",
    label: "Enlace 4 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link4Url",
    label: "Enlace 4 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "link5Label",
    label: "Enlace 5 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link5Url",
    label: "Enlace 5 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "link6Label",
    label: "Enlace 6 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "link6Url",
    label: "Enlace 6 — URL",
    type: "url",
    default: "#",
  },
];
