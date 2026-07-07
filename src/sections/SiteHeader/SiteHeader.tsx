import * as React from "react";
import { Menu, X, User } from "lucide-react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// SiteHeader (CHR-02) — site-wide top navigation.
// Mobile nav uses a CSS-only details/summary hamburger — no useState, no React
// event handlers. The open/close state is managed entirely by the native
// <details> element.
//
// Single BlocksSlot pattern (RESEARCH.md Pattern 4, Pitfall 3): BlocksSlot is
// called exactly once inside a <nav> sibling to <details class="peer">.
// The nav is hidden on mobile and revealed via `peer-open:flex` when the
// details is open (a styled dropdown panel below the header). On desktop (lg:)
// the nav is always an inline flex-row. details and nav MUST be adjacent
// siblings for the peer selector to work.
//
// The "Mi Cuenta" account button is rendered TWICE (same content): the desktop
// copy lives in the header bar (`hidden lg:block`); the mobile copy lives inside
// the dropdown menu, full-width below a divider (`lg:hidden`). CSS picks which is
// visible — so on mobile the header bar is just logo + hamburger.
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
  // Rendered in both the desktop header bar and the mobile menu; `extra` makes
  // the mobile copy full-width. Pure render — no state, no handlers.
  const accountButton = (extra?: string) => (
    <Button
      size="lg"
      variant="pill-outline"
      className={cn("border-white", extra)}
      asChild
    >
      <a
        href={accountUrl || "#"}
        className="inline-flex items-center justify-center gap-2 text-white"
      >
        <User aria-hidden="true" className="size-4" />
        <span>{accountLabel || "Mi Cuenta"}</span>
      </a>
    </Button>
  );

  return (
    <header className="bg-brand-navy relative">
      <div className="container mx-auto container-padding-x flex flex-wrap items-center justify-between gap-y-0 py-7 relative">
        {/* Logo */}
        <div className="shrink-0">
          {logo?.url ? (
            <img
              src={logo.url}
              alt={logo.alt ?? ""}
              width={logo.width ?? 200}
              height={logo.height ?? 40}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="h-10 w-[120px] rounded border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 text-xs">
              Logo
            </div>
          )}
        </div>

        {/* Hamburger trigger — mobile only (lg:hidden). peer class enables
            peer-open:flex on the adjacent nav sibling. summary only; no blocks
            rendered inside details. */}
        <details className="peer group lg:hidden shrink-0">
          <summary
            className="list-none cursor-pointer size-11 -mr-2 flex items-center justify-center rounded-lg hover:bg-white/10 [&::-webkit-details-marker]:hidden marker:content-[''] text-white"
            aria-label="Abrir menú"
          >
            <Menu aria-hidden="true" className="size-6 group-open:hidden" />
            <X aria-hidden="true" className="size-6 hidden group-open:flex" />
          </summary>
        </details>

        {/* SINGLE nav + SINGLE BlocksSlot — reflows via CSS for both contexts:
            mobile: hidden by default, peer-open:flex when hamburger is open
                    (styled dropdown panel below the header, flex-col)
            desktop: always lg:flex flex-row inline, static positioning
            details and nav must be adjacent siblings for peer-open to work. */}
        <nav
          aria-label="Navegación principal"
          className="hidden peer-open:flex flex-col gap-4 w-full px-6 py-5 bg-brand-navy absolute left-0 right-0 top-full z-50 border-t border-white/10 shadow-xl rounded-b-2xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:bg-transparent lg:p-0 lg:border-0 lg:shadow-none lg:rounded-none lg:w-auto"
        >
          <BlocksSlot
            renderBlocks={renderBlocks}
            empty={null}
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 [&_a]:py-1 lg:[&_a]:py-0"
          />

          {/* Mobile-only: divider + full-width account button. The desktop copy
              lives in the header bar (below). */}
          <div className="h-px w-full bg-white/10 lg:hidden" />
          <div className="lg:hidden">{accountButton("w-full")}</div>
        </nav>

        {/* Account button — desktop only (the mobile copy is inside the menu). */}
        <div className="ml-4 hidden shrink-0 lg:block">{accountButton()}</div>
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
