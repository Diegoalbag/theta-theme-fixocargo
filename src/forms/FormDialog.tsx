import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormRenderer } from "@/forms/FormRenderer";

/**
 * A button that opens a platform-built form in a modal dialog.
 *
 * SHARED ON PURPOSE. Any section that wants "a button that opens a form" mounts
 * its OWN copy of this — ContactForm in `display: modal` mode, and
 * FranquiciasInternacionales' CTA. There is deliberately no page-global dialog
 * and no cross-section event bus or context:
 *
 *   • Sections are rendered by three different hosts — the tenant site's client
 *     page-renderer, its SSR server-shell, and the customizer's iframe. A shared
 *     provider would have to be installed in all three, and all three live in the
 *     PLATFORM, not in this theme. Local composition needs no platform change and
 *     behaves identically in all three.
 *   • Two sections each owning a dialog is also the more honest model: each one
 *     binds its own form, so a merchant can put a franchise-enquiry form on the
 *     franchises CTA and a general contact form further down the same page.
 *
 * Native <dialog> rather than a dialog library: showModal() supplies the focus
 * trap, Escape-to-close, the backdrop and inert-ing the rest of the page for
 * free. A library would reimplement that in JS and ship in the bundle, since
 * Radix is not in vite.config.ts's `external` list.
 *
 * FormRenderer is mounted only while the dialog is open. Its definition fetch
 * runs in a mount effect, so the network call is lazy: a visitor who never opens
 * the form never costs a round trip to /api/forms/:key.
 *
 * Nothing here touches `document` or `window` during render — only inside
 * handlers and effects — because this theme is server-rendered and the SSR
 * sandbox has no document.
 */
export function FormDialog({
  formKey,
  triggerLabel,
  heading,
  size,
  variant = "default",
  className,
}: {
  /** Bound by a `form_picker` setting. Nothing renders without one. */
  formKey?: string;
  triggerLabel: string;
  /** Dialog heading. Falls back to the trigger's own label. */
  heading?: string;
  size?: "default" | "sm" | "lg";
  /** Any Button variant — lets each section keep its own CTA styling. */
  variant?: "default" | "outline" | "pill" | "pill-outline" | "navy" | "secondary";
  className?: string;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);
  // Unique per instance, so two dialogs on one page cannot share an id and have
  // aria-labelledby point at the wrong heading.
  const headingId = React.useId();

  // Escape and the backdrop close the dialog WITHOUT going through the close
  // button, so React state has to follow the element's own `close` event rather
  // than be the only source of truth. Without this, a dialog dismissed with
  // Escape would leave `open` true and never unmount the renderer.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => setOpen(false);
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, []);

  // Nothing bound yet — render nothing rather than a button that opens an empty
  // dialog. Same posture as FormRenderer itself: never show site visitors an
  // error about the site's own configuration.
  if (!formKey) return null;

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => {
          setOpen(true);
          dialogRef.current?.showModal();
        }}
      >
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className={cn(
          // `m-auto` centres it: a <dialog> is positioned by the UA, and without
          // an explicit margin it pins to the top of the viewport.
          //
          // `100%` rather than `100vw`: a modal dialog resolves percentages
          // against the viewport too, but without counting the scrollbar, which
          // is the horizontal-overflow source test/static-audit.test.tsx bans.
          "m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border",
          "bg-background p-6 text-foreground shadow-xl",
          "backdrop:bg-black/50"
        )}
        // A backdrop click reports the dialog element ITSELF as the target; a
        // click on anything inside reports that child, and must not close.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id={headingId} className="heading-sm">
            {heading || triggerLabel}
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
