import * as React from "react";
import { Menu, X, User } from "lucide-react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";
import { Button } from "@/components/ui/button";

// SiteHeader (CHR-02) — site-wide top navigation.
// Mobile nav uses a CSS-only details/summary hamburger — no useState, no React
// event handlers. The open/close state is managed entirely by the native
// <details> element.
//
// Single BlocksSlot pattern (RESEARCH.md Pattern 4, Pitfall 3): BlocksSlot is
// called exactly once inside a <nav> sibling to <details class="peer">.
// The nav is hidden on mobile and revealed via `peer-open:flex` when the
// details is open. On desktop (lg:) the nav is always flex-row regardless.
// details and nav MUST be adjacent siblings for the peer selector to work.
//
// All text arrives as optional props (platform-validated strings).
// Icons are decorative (aria-hidden). No state, no event handlers in this file.
export interface SiteHeaderProps {
  logo?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  accountLabel?: string;
  accountUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const SiteHeader = ({
  logo,
  accountLabel,
  accountUrl,
  renderBlocks,
}: SiteHeaderProps): React.ReactNode => {
  return (
    <header className="bg-brand-navy relative">
      <div className="container mx-auto container-padding-x flex flex-wrap items-center justify-between gap-y-0 py-3 relative">
        {/* Logo */}
        <div className="shrink-0">
          <ImageGuard
            url={logo?.url}
            alt={logo?.alt ?? ""}
            ratio={3 / 1}
            className="h-10 object-contain w-auto max-w-[140px]"
          />
        </div>

        {/* Hamburger trigger — mobile only (lg:hidden). peer class enables
            peer-open:flex on the adjacent nav sibling. summary only; no blocks
            rendered inside details. */}
        <details className="peer group lg:hidden shrink-0">
          <summary
            className="list-none cursor-pointer h-11 flex items-center [&::-webkit-details-marker]:hidden marker:content-[''] text-white"
            aria-label="Abrir menú"
          >
            <Menu aria-hidden="true" className="size-6 group-open:hidden" />
            <X aria-hidden="true" className="size-6 hidden group-open:flex" />
          </summary>
        </details>

        {/* SINGLE nav + SINGLE BlocksSlot — reflows via CSS for both contexts:
            mobile: hidden by default, peer-open:flex when hamburger is open
                    (absolute dropdown below header, flex-col)
            desktop: always lg:flex flex-row inline, static positioning
            details and nav must be adjacent siblings for peer-open to work. */}
        <nav
          aria-label="Navegación principal"
          className="hidden peer-open:flex flex-col gap-2 w-full px-4 py-3 bg-brand-navy absolute left-0 right-0 top-full z-50 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:bg-transparent lg:p-0 lg:shadow-none lg:w-auto"
        >
          <BlocksSlot
            renderBlocks={renderBlocks}
            empty={null}
            className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6"
          />
        </nav>

        {/* Account button — pill-outline Button with asChild anchor (D-06) */}
        <div className="ml-4 shrink-0">
          <Button variant="pill-outline" asChild>
            <a
              href={accountUrl || "#"}
              className="inline-flex items-center gap-2"
            >
              <User aria-hidden="true" className="size-4" />
              <span>{accountLabel || "Mi Cuenta"}</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

// Settings schema for the SiteHeader section.
// Three settings: logo image picker, account button text, account button URL.
export const siteHeaderSettingsSchema = [
  {
    id: "logo",
    label: "Logo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "accountLabel",
    label: "Texto del botón de cuenta",
    type: "text",
    default: "Mi Cuenta",
  },
  {
    id: "accountUrl",
    label: "URL de cuenta",
    type: "url",
    default: "#",
  },
];
