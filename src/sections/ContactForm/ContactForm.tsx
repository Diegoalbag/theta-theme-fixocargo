import { cn } from "@/lib/utils";
import { FormRenderer } from "@/forms/FormRenderer";
import { FormDialog } from "@/forms/FormDialog";

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
            <FormDialog formKey={formKey} triggerLabel={triggerLabel} heading={heading} />
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
