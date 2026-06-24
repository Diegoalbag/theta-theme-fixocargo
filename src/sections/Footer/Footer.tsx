import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// Footer (CHR-03) — site-wide footer with logo, mixed blocks band, and legal row.
//
// Layout: navy background, main content area with logo + mixed block band, then
// a divider and legal row. All block types (footer-column, store-badge,
// social-link) are rendered in editor list order through a single BlocksSlot
// (D-04 resolution: no type-partitioned regions). Each block's own styling
// provides per-type visual distinction.
//
// BlocksSlot is used with the default EmptyState — correct per UI-SPEC.md States
// table (Footer block slot should show EmptyState in customizer when empty).
//
// All text rendered as JSX text nodes — no dangerouslySetInnerHTML.
// Legal links are real anchor elements (href attributes).
// No state, no event handlers. All content arrives as props from the platform.
export interface FooterProps {
  logo?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  copyright?: string;
  termsLabel?: string;
  termsUrl?: string;
  privacyLabel?: string;
  privacyUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Footer = ({
  logo,
  copyright,
  termsLabel,
  termsUrl,
  privacyLabel,
  privacyUrl,
  renderBlocks,
}: FooterProps): React.ReactNode => {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto container-padding-x py-10 lg:py-14">
        {/* Top band: logo left, mixed block band right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Logo area */}
          <div className="flex-shrink-0">
            <ImageGuard
              url={logo?.url}
              alt={logo?.alt ?? "FixoCargo"}
              ratio={3 / 1}
              className="w-[140px]"
            />
          </div>

          {/* Mixed block band — single BlocksSlot for all block types.
              D-04: editor list order; no type-partitioned regions.
              Default EmptyState is intentional per UI-SPEC States table. */}
          <div className="flex-1">
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-wrap gap-4 lg:gap-6"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-white/20" />

        {/* Legal row */}
        <div className="flex flex-col gap-2 font-opensans text-sm text-white/70 lg:flex-row lg:items-center lg:justify-between">
          <span>{copyright || ""}</span>
          <div className="flex items-center gap-4">
            {termsLabel && (
              <a
                href={termsUrl || "#"}
                className="hover:text-white focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
              >
                {termsLabel}
              </a>
            )}
            {privacyLabel && (
              <a
                href={privacyUrl || "#"}
                className="hover:text-white focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
              >
                {privacyLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

// 6 settings: logo + copyright + 2 label/url pairs for terms and privacy.
export const footerSettingsSchema = [
  {
    id: "logo",
    label: "Logo del pie de página",
    type: "image_picker",
  },
  {
    id: "copyright",
    label: "Texto de derechos de autor",
    type: "text",
    default: "© FixoCargo, Inc. 2026. Todos los derechos reservados.",
  },
  {
    id: "termsLabel",
    label: "Texto de Términos",
    type: "text",
    default: "Términos y condiciones",
  },
  {
    id: "termsUrl",
    label: "URL de Términos",
    type: "url",
    default: "#",
  },
  {
    id: "privacyLabel",
    label: "Texto de Políticas",
    type: "text",
    default: "Políticas de privacidad",
  },
  {
    id: "privacyUrl",
    label: "URL de Políticas",
    type: "url",
    default: "#",
  },
];
