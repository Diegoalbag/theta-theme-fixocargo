import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FULL_BLEED_SIZES, type ImageFormats } from "@/lib/image-srcset";
import { ThemeImage } from "@/lib/theme-image";
import { cn } from "@/lib/utils";
import { safeHref } from "@/lib/safe-href";

// HeroSlide — section-local block for the Hero (ATF-01) Blaze Slider carousel.
// Blaze sizes each slide to the full track width via `.blaze-track > *`, so the
// article only needs height + layout here (no w-full/shrink-0/snap-start).
// Each slide paints its OWN background image
// (full-bleed url-guard per RESEARCH Pattern 2 — NOT ImageGuard, which boxes at
// 16:9, Pitfall 3) behind a fixed ~50% dark overlay, then renders a left-aligned,
// vertically-centered column of heading / optional subtitle / optional CTA.
//
// CTA gained a togglable second mode (quick task 260908-pib): `ctaAction`
// ("link" | "dialog", default "link") lets a merchant flip the CTA from
// today's plain-link navigation to a small dialog listing up to 4 editable
// link buttons — e.g. a "Regístrate" button offering a few registration
// destinations instead of one URL. `ctaAction` defaults to `"link"` at the JS
// level, so every slide saved before this change (which has no `ctaAction`
// at all) renders the EXACT SAME markup as before: a pill `Button` wrapping a
// plain anchor, no dialog markup added.
//
// NO LONGER FULLY STATELESS. The dialog branch owns `useRef`/`useState`/
// `useId`/a close-event `useEffect` — a direct, precedented mirror of
// `src/forms/FormDialog.tsx`'s native-`<dialog>` pattern (showModal()/close(),
// backdrop-click-to-close, an X button, the same dialog-shell classNames). A
// dialog's own open/closed affordance is not "content state" under the
// section/block purity rule, which targets state that stands in for content a
// merchant should instead be able to edit — FormDialog already established
// this exact precedent for dialog-owning components in this theme.
//
// The 4 link slots (`link1Label`/`link1Url` .. `link4Label`/`link4Url`) are
// fixed settings fields, not a repeating block list (blocks cannot contain
// blocks — HeroSlide is itself a block). Each slot is independently optional:
// a blank-after-trim label omits that slot's button entirely (mirrors
// `NavLink`'s `.trim()`-filtered child-slot pattern, WR-07 — a bare truthy
// check would let a lone space leak an empty button). Every `linkNUrl` is
// routed through `safeHref()` before reaching an `href`, since these are NEW
// sinks this task introduces (same posture `nav-link` used for its own new
// sinks). The pre-existing `ctaUrl` sink in the "link" branch stays
// UNGUARDED on purpose: the byte-identical backward-compat requirement for
// that branch is a hard constraint, and `safe-href.ts`'s own header comment
// already records theme-wide unguarded anchors as tracked follow-up debt, not
// new risk introduced here.
//
// All content arrives as props from the platform. Decorative elements are
// aria-hidden. Brand tokens only — no hex literals (FND-03). @/ imports only.
export interface HeroSlideProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    formats?: ImageFormats | null;
  };
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaAction?: "link" | "dialog";
  link1Label?: string;
  link1Url?: string;
  link2Label?: string;
  link2Url?: string;
  link3Label?: string;
  link3Url?: string;
  link4Label?: string;
  link4Url?: string;
  blockId?: string;
  blockType?: string;
}

export const HeroSlide = ({
  backgroundImage,
  heading,
  subtitle,
  ctaLabel,
  ctaUrl,
  ctaAction = "link",
  link1Label,
  link1Url,
  link2Label,
  link2Url,
  link3Label,
  link3Url,
  link4Label,
  link4Url,
}: HeroSlideProps): React.ReactNode => {
  // Hooks are called UNCONDITIONALLY — HeroSlide has no early return, so this
  // is safe as-is (Rules of Hooks).
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);
  const headingId = React.useId();

  const allLinks = [
    { label: link1Label, url: link1Url },
    { label: link2Label, url: link2Url },
    { label: link3Label, url: link3Url },
    { label: link4Label, url: link4Url },
  ];
  // `.trim()` is load-bearing, not tidiness (WR-07 / NavLink precedent): a
  // lone space typed into a linkNLabel field must not render an empty button.
  const activeLinks = allLinks.filter((entry) => !!entry.label?.trim());

  // Depends on `ctaAction`, not `[]`: the `<dialog>` element only exists in
  // the "dialog" branch, so if a merchant flips the setting in a live
  // customizer session without a remount, an empty dependency array would
  // leave the close-listener never attached (same fix NavLink applied via its
  // `hasSubmenu` dependency for the same class of problem). `if (!el) return`
  // still guards the "link" branch, which attaches nothing.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => setOpen(false);
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [ctaAction]);

  return (
    <article className="relative flex items-center overflow-hidden min-h-[30vh] md:min-h-[560px]">
      {/* Full-bleed per-slide background — url-guard (RESEARCH Pattern 2, D-04).
          When the image is set, paint it object-cover; otherwise a navy
          placeholder (no broken img, QA-01). First-viewport hero: eager +
          high fetch priority via ThemeImage's priority flag. */}
      <ThemeImage
        url={backgroundImage?.url}
        alt={backgroundImage?.alt ?? ""}
        width={backgroundImage?.width}
        height={backgroundImage?.height}
        formats={backgroundImage?.formats}
        sizesHint={FULL_BLEED_SIZES}
        priority
        placeholder={<div aria-hidden className="absolute inset-0 bg-brand-navy" />}
      />

      {/* Fixed ~50% dark overlay (matches design rgba(0,0,0,0.5); POL-02
          overlayOpacity is v2 — overlay stays fixed here). */}
      <div aria-hidden className="absolute inset-0 bg-black/50" />

      {/* Content layer — left-aligned column, vertically centered via the
          article's items-center. */}
      <div className="container relative mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-aku font-bold text-white text-4xl md:text-6xl lg:text-8xl">
            {heading ?? "Transportamos lo que necesitas del mundo a tus manos"}
          </h2>

          {subtitle && (
            <p className="font-gill text-white text-lg md:text-2xl">
              {subtitle}
            </p>
          )}

          {ctaLabel && ctaAction === "dialog" && (
            <>
              <Button
                size="lg"
                variant="pill"
                type="button"
                onClick={() => {
                  setOpen(true);
                  dialogRef.current?.showModal();
                }}
              >
                {ctaLabel}
              </Button>

              <dialog
                ref={dialogRef}
                aria-labelledby={headingId}
                className={cn(
                  "m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border",
                  "bg-background p-6 text-foreground shadow-xl",
                  "backdrop:bg-black/50",
                )}
                onClick={(event) => {
                  if (event.target === dialogRef.current) {
                    dialogRef.current?.close();
                  }
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 id={headingId} className="heading-sm">
                    {ctaLabel}
                  </h3>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => dialogRef.current?.close()}
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {activeLinks.map((entry, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <a href={safeHref(entry.url)}>{entry.label}</a>
                    </Button>
                  ))}
                </div>
              </dialog>
            </>
          )}

          {ctaLabel && ctaAction !== "dialog" && (
            <Button size="lg" variant="pill" asChild>
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export const heroSlideSettingsSchema = [
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Transportamos lo que necesitas del mundo a tus manos",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "Fixo Cargo Courier",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Buscar",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
  },
  {
    id: "ctaAction",
    label: "Acción del botón",
    type: "select",
    default: "link",
    options: [
      { value: "link", label: "Enlace directo" },
      { value: "dialog", label: "Abrir ventana" },
    ],
    info: "Elige si el botón navega directamente (Enlace directo) o abre una ventana con hasta 4 botones de enlace (Abrir ventana).",
  },
  {
    id: "link1Label",
    label: "Botón 1 - Texto",
    type: "text",
    default: "",
    info: "Solo se usa cuando la acción del botón es «Abrir ventana». Déjalo vacío para no mostrar este botón.",
  },
  {
    id: "link1Url",
    label: "Botón 1 - Enlace",
    type: "url",
    default: "#",
  },
  {
    id: "link2Label",
    label: "Botón 2 - Texto",
    type: "text",
    default: "",
    info: "Solo se usa cuando la acción del botón es «Abrir ventana». Déjalo vacío para no mostrar este botón.",
  },
  {
    id: "link2Url",
    label: "Botón 2 - Enlace",
    type: "url",
    default: "#",
  },
  {
    id: "link3Label",
    label: "Botón 3 - Texto",
    type: "text",
    default: "",
    info: "Solo se usa cuando la acción del botón es «Abrir ventana». Déjalo vacío para no mostrar este botón.",
  },
  {
    id: "link3Url",
    label: "Botón 3 - Enlace",
    type: "url",
    default: "#",
  },
  {
    id: "link4Label",
    label: "Botón 4 - Texto",
    type: "text",
    default: "",
    info: "Solo se usa cuando la acción del botón es «Abrir ventana». Déjalo vacío para no mostrar este botón.",
  },
  {
    id: "link4Url",
    label: "Botón 4 - Enlace",
    type: "url",
    default: "#",
  },
];
