import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormRenderer } from "@/forms/FormRenderer";

export interface ContactFormProps {
  heading?: string;
  description?: string;
  /** Form key, set by the customizer's form_picker setting. */
  formKey?: string;
  /** Render the form in the page, or behind a button that opens a dialog. */
  display?: "inline" | "modal";
  /** Label for the button that opens the dialog. Ignored when display is inline. */
  triggerLabel?: string;
  layout?: "centered" | "split";
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
}

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Renders a form built in the platform's Forms dashboard.
 *
 * The section holds only presentation; the fields come from the bound form's
 * definition, fetched by FormRenderer at runtime. That split is what lets a client
 * add or reorder fields without a theme redeploy.
 *
 * Style settings are a FIXED vocabulary (the alignmentClasses map above, the two
 * layouts, the two display modes) rather than free-form values, because Tailwind
 * compiles this theme in CI long before a client picks anything — a class name
 * assembled from a client-chosen value would be purged and simply not exist at
 * runtime.
 */
export const ContactForm = ({
  heading,
  description,
  formKey,
  display = "inline",
  triggerLabel = "Escríbenos",
  layout = "centered",
  backgroundColor,
  textAlignment = "left",
}: ContactFormProps) => {
  const isSplit = layout === "split";
  const isModal = display === "modal";

  return (
    <section
      className="section-padding-y"
      style={backgroundColor ? { backgroundColor } : undefined}
      aria-labelledby={heading ? "contact-form-heading" : undefined}
    >
      <div
        className={cn(
          "container-padding-x container mx-auto",
          // The split layout puts the copy BESIDE the form. In modal mode there is
          // no form in the page to sit beside — only a button — so split collapses
          // back to the centred column rather than leaving a stranded empty half.
          isSplit && !isModal
            ? "flex flex-col gap-10 lg:flex-row lg:gap-16"
            : "max-w-2xl"
        )}
      >
        {(heading || description) && (
          <div
            className={cn(
              "flex flex-col gap-3",
              isSplit && !isModal ? "flex-1" : "mb-8",
              alignmentClasses[textAlignment]
            )}
          >
            {heading && (
              <h2 id="contact-form-heading" className="heading-lg">
                {heading}
              </h2>
            )}
            {description && (
              <p className="text-base text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {isModal ? (
          <div className={alignmentClasses[textAlignment]}>
            <ContactFormDialog formKey={formKey} triggerLabel={triggerLabel} />
          </div>
        ) : (
          <div className={isSplit ? "flex-1" : undefined}>
            <FormRenderer formKey={formKey} />
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Button + native <dialog> wrapper around FormRenderer.
 *
 * Native <dialog> rather than a dialog library on purpose: `showModal()` supplies
 * the focus trap, Escape-to-close, the backdrop and `inert`-ing the rest of the
 * page for free. A library would reimplement all of that in JS AND ship in the
 * bundle — Radix is not in vite.config.ts's `external` list, so unlike React or
 * lucide-react it would be bundled into theme.bundle.js and every page would pay
 * for it, form or no form.
 *
 * FormRenderer is mounted only while the dialog is open. Its definition fetch runs
 * in a mount effect, so this makes the network call lazy: a visitor who never opens
 * the form never costs a round trip to the tenant's /api/forms/:key.
 *
 * Nothing here touches `document` or `window` during render — only inside handlers
 * and effects — because this theme is server-rendered and the SSR sandbox has no
 * document.
 */
function ContactFormDialog({
  formKey,
  triggerLabel,
}: {
  formKey?: string;
  triggerLabel: string;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);

  // Escape and the backdrop close the dialog WITHOUT going through the close
  // button, so React state has to follow the element's own `close` event rather
  // than be the only source of truth. Without this, a dialog dismissed with Escape
  // would leave `open` true and never unmount the renderer.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => setOpen(false);
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, []);

  // Nothing bound yet — render nothing rather than a button that opens an empty
  // dialog. Same posture as FormRenderer itself: never show site visitors an error
  // about the site's own configuration.
  if (!formKey) return null;

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setOpen(true);
          dialogRef.current?.showModal();
        }}
      >
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="contact-form-dialog-heading"
        // `m-auto` centres it: a <dialog> is positioned by the UA, and without an
        // explicit margin it pins to the top of the viewport.
        className={cn(
          // `100%` rather than `100vw`: a modal dialog resolves percentages
          // against the viewport too, but without counting the scrollbar, which
          // is the horizontal-overflow source test/static-audit.test.tsx bans.
          "m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border",
          "bg-background p-6 text-foreground shadow-xl",
          "backdrop:bg-black/50"
        )}
        // A backdrop click reports the dialog element ITSELF as the target; a click
        // on anything inside reports that child, and must not close.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id="contact-form-dialog-heading" className="heading-sm">
            {triggerLabel}
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

        {open && <FormRenderer formKey={formKey} />}
      </dialog>
    </>
  );
}

export const contactFormSettingsSchema = [
  {
    id: "formKey",
    label: "Formulario",
    type: "form_picker",
    info: "Crea formularios en Contenido → Formularios.",
  },
  {
    id: "display",
    label: "Presentación",
    type: "select",
    default: "inline",
    options: [
      { value: "inline", label: "En la página" },
      { value: "modal", label: "Al hacer clic en un botón" },
    ],
  },
  {
    id: "triggerLabel",
    label: "Texto del botón",
    type: "text",
    default: "Escríbenos",
    info: "Solo se usa cuando la presentación es «Al hacer clic en un botón».",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Contáctanos",
  },
  {
    id: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Texto de apoyo (opcional)",
  },
  {
    id: "layout",
    label: "Diseño",
    type: "select",
    default: "centered",
    options: [
      { value: "centered", label: "Centrado" },
      { value: "split", label: "Texto junto al formulario" },
    ],
  },
  {
    id: "textAlignment",
    label: "Alineación del texto",
    type: "text_alignment",
    default: "left",
  },
  {
    id: "backgroundColor",
    label: "Color de fondo",
    type: "color",
  },
];
