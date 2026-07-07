import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// Footer (CHR-03) — site-wide footer with logo, mixed blocks band, and legal row.
//
// Layout: navy background, main content area with logo + mixed block band, then
// a divider and legal row. All block types (footer-column, store-badge,
// social-link) are rendered in editor list order through a single BlocksSlot
// (D-04 resolution: no type-partitioned regions). Each block's own styling
// provides per-type visual distinction.
//
// BlocksSlot uses empty={null} — chrome section, no drag affordance in customizer.
// The platform's native UI handles block addition; the dashed box is not part of
// the design and must not appear over the footer layout.
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
            {logo?.url ? (
              <img
                src={logo.url}
                alt={logo.alt ?? "FixoCargo"}
                width={logo.width ?? 270}
                height={logo.height ?? 54}
                loading="lazy"
                decoding="async"
                className="h-[54px] w-auto object-contain"
              />
            ) : (
              <div className="h-[54px] w-[140px] rounded border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 text-xs">
                Logo
              </div>
            )}
          </div>

          {/* Footer columns block band — gap-[60px] matches design exactly.
              D-04: editor list order; no type-partitioned regions.
              empty={null}: chrome section — no drag affordance overlay. */}
          <div className="flex-1">
            <BlocksSlot
              renderBlocks={renderBlocks}
              empty={null}
              className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:justify-end lg:gap-[60px]"
            />
          </div>
        </div>

        {/* Divider — solid white, 36px margin matches design */}
        <div className="h-px bg-white my-9" />

        {/* Legal row — text-[15px]/text-[14px] and solid white matches design */}
        <div className="flex flex-col gap-2 font-opensans text-white lg:flex-row lg:items-center lg:justify-between">
          <span className="text-[15px] leading-[24px] tracking-[-0.2px]">{copyright || ""}</span>
          <div className="flex items-center gap-6">
            {termsLabel && (
              <a
                href={termsUrl || "#"}
                className="text-[14px] leading-[20px] hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
              >
                {termsLabel}
              </a>
            )}
            {privacyLabel && (
              <a
                href={privacyUrl || "#"}
                className="text-[14px] leading-[20px] hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
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
