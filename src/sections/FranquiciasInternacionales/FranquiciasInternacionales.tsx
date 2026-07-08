import * as React from "react";
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  Building2,
  TrendingUp,
  Headphones,
  Lightbulb,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// FranquiciasInternacionales (quick task 260708-dm3) — a fully self-contained,
// settings-only section for the FixoCargo homepage: NO renderBlocks prop, NO
// BlocksSlot, NO sectionBlocksConfig entry at all (matches the no-block
// "Pattern 4" precedent in PlanReferimiento). The offer/why lists are FLAT
// EDITABLE SETTINGS FIELDS per the locked decision — never a blocks slot,
// never hardcoded non-editable text. Each list's icon is fixed decorative
// JSX (module-scoped arrays pairing a fixed lucide-react component with
// settings-driven text) — never merchant-selectable.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface FranquiciasInternacionalesProps {
  kicker?: string;
  heading?: string;
  body?: string;
  country1?: string;
  country2?: string;
  country3?: string;
  offerHeading?: string;
  offer1Title?: string;
  offer1Body?: string;
  offer2Title?: string;
  offer2Body?: string;
  offer3Title?: string;
  offer3Body?: string;
  offer4Title?: string;
  offer4Body?: string;
  whyHeading?: string;
  why1Title?: string;
  why1Body?: string;
  why2Title?: string;
  why2Body?: string;
  why3Title?: string;
  why3Body?: string;
  whySupportingText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sectionId?: string;
  sectionName?: string;
}

export const FranquiciasInternacionales = ({
  kicker = "Crece con nosotros",
  heading = "Franquicias Internacionales",
  body = "Expandimos nuestras operaciones más allá de las fronteras, ofreciendo oportunidades de franquicia en República Dominicana, Puerto Rico y Paraguay. Al unirte a nuestra red, aprovechas la sólida reputación, el sistema probado y la marca reconocida de Fixo Cargo.",
  country1 = "República Dominicana",
  country2 = "Puerto Rico",
  country3 = "Paraguay",
  offerHeading = "Lo que ofrecemos a nuestras franquicias",
  offer1Title = "Know-How Integral",
  offer1Body = "Accede a nuestro completo conocimiento y experiencia en el sector logístico y de envíos.",
  offer2Title = "Sistema Efectivo",
  offer2Body = "Utiliza nuestro sistema de operaciones, optimizado para eficiencia y efectividad.",
  offer3Title = "Marca Establecida",
  offer3Body = "Benefíciate del prestigio y reconocimiento de la marca Fixo Cargo en el mercado.",
  offer4Title = "Apoyo desde Miami",
  offer4Body = "Soporte continuo desde nuestras operaciones centrales en Miami, con flujo constante de recursos.",
  whyHeading = "Por qué elegir Fixo Cargo",
  why1Title = "Expansión Estratégica",
  why1Body = "Un plan de expansión diseñado para maximizar el éxito en nuevos mercados.",
  why2Title = "Soporte Continuo",
  why2Body = "Apoyo constante en marketing, operaciones y gestión.",
  why3Title = "Innovación y Crecimiento",
  why3Body = "Una marca que invierte en innovación y crecimiento continuo.",
  whySupportingText = "¿Interesado en explorar oportunidades de franquicia? Completa el formulario para iniciar la conversación.",
  ctaLabel = "Llenar el formulario",
  ctaUrl = "#",
}: FranquiciasInternacionalesProps): React.ReactNode => {
  const offerItems = [
    { Icon: GraduationCap, title: offer1Title, body: offer1Body },
    { Icon: ClipboardCheck, title: offer2Title, body: offer2Body },
    { Icon: Award, title: offer3Title, body: offer3Body },
    { Icon: Building2, title: offer4Title, body: offer4Body },
  ];

  const whyItems = [
    { Icon: TrendingUp, title: why1Title, body: why1Body },
    { Icon: Headphones, title: why2Title, body: why2Body },
    { Icon: Lightbulb, title: why3Title, body: why3Body },
  ];

  return (
    <section className="bg-muted section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3 max-w-3xl">
          {kicker && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {kicker}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
          {body && (
            <p className="pt-1 font-gill text-base text-muted-foreground lg:text-lg">
              {body}
            </p>
          )}
        </div>

        {(country1 || country2 || country3) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {[country1, country2, country3].filter(Boolean).map((country) => (
              <span
                key={country}
                className="flex h-11 items-center gap-2.5 rounded-full bg-brand-navy px-6"
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-brand-yellow"
                />
                <span className="font-gotham text-sm font-bold text-white">
                  {country}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <Card variant="surface" className="flex flex-col gap-6 p-8 lg:p-10">
            {offerHeading && (
              <h3 className="font-gotham text-2xl font-bold text-brand-navy">
                {offerHeading}
              </h3>
            )}
            <div className="flex flex-col gap-5">
              {offerItems.map((item, i) => (
                <div key={`offer-${i}`} className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-brand-navy">
                    <item.Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    {item.title && (
                      <span className="font-gotham text-base font-bold text-brand-navy">
                        {item.title}
                      </span>
                    )}
                    {item.body && (
                      <span className="font-gill text-sm text-muted-foreground">
                        {item.body}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="navy-dark" className="flex flex-col gap-6 p-8 lg:p-10">
            {whyHeading && (
              <h3 className="font-gotham text-2xl font-bold text-white">
                {whyHeading}
              </h3>
            )}
            <div className="flex flex-col gap-5">
              {whyItems.map((item, i) => (
                <div key={`why-${i}`} className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-yellow">
                    <item.Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    {item.title && (
                      <span className="font-gotham text-base font-bold text-white">
                        {item.title}
                      </span>
                    )}
                    {item.body && (
                      <span className="font-gill text-sm text-white/70">
                        {item.body}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4 pt-4">
              {whySupportingText && (
                <p className="font-gill text-sm text-white/70 lg:text-base">
                  {whySupportingText}
                </p>
              )}
              <Button size="lg" variant="pill" asChild className="w-fit">
                <a href={ctaUrl || "#"}>{ctaLabel}</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Exactly 25 editable fields, ids → camelCase props.
export const franquiciasInternacionalesSettingsSchema = [
  {
    id: "kicker",
    label: "Etiqueta superior",
    type: "text",
    default: "Crece con nosotros",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Franquicias Internacionales",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Expandimos nuestras operaciones más allá de las fronteras, ofreciendo oportunidades de franquicia en República Dominicana, Puerto Rico y Paraguay. Al unirte a nuestra red, aprovechas la sólida reputación, el sistema probado y la marca reconocida de Fixo Cargo.",
  },
  {
    id: "country1",
    label: "País 1",
    type: "text",
    default: "República Dominicana",
  },
  {
    id: "country2",
    label: "País 2",
    type: "text",
    default: "Puerto Rico",
  },
  {
    id: "country3",
    label: "País 3",
    type: "text",
    default: "Paraguay",
  },
  {
    id: "offerHeading",
    label: "Título de ofrecemos",
    type: "text",
    default: "Lo que ofrecemos a nuestras franquicias",
  },
  {
    id: "offer1Title",
    label: "Oferta 1 - Título",
    type: "text",
    default: "Know-How Integral",
  },
  {
    id: "offer1Body",
    label: "Oferta 1 - Descripción",
    type: "textarea",
    default:
      "Accede a nuestro completo conocimiento y experiencia en el sector logístico y de envíos.",
  },
  {
    id: "offer2Title",
    label: "Oferta 2 - Título",
    type: "text",
    default: "Sistema Efectivo",
  },
  {
    id: "offer2Body",
    label: "Oferta 2 - Descripción",
    type: "textarea",
    default:
      "Utiliza nuestro sistema de operaciones, optimizado para eficiencia y efectividad.",
  },
  {
    id: "offer3Title",
    label: "Oferta 3 - Título",
    type: "text",
    default: "Marca Establecida",
  },
  {
    id: "offer3Body",
    label: "Oferta 3 - Descripción",
    type: "textarea",
    default:
      "Benefíciate del prestigio y reconocimiento de la marca Fixo Cargo en el mercado.",
  },
  {
    id: "offer4Title",
    label: "Oferta 4 - Título",
    type: "text",
    default: "Apoyo desde Miami",
  },
  {
    id: "offer4Body",
    label: "Oferta 4 - Descripción",
    type: "textarea",
    default:
      "Soporte continuo desde nuestras operaciones centrales en Miami, con flujo constante de recursos.",
  },
  {
    id: "whyHeading",
    label: "Título de por qué elegirnos",
    type: "text",
    default: "Por qué elegir Fixo Cargo",
  },
  {
    id: "why1Title",
    label: "Razón 1 - Título",
    type: "text",
    default: "Expansión Estratégica",
  },
  {
    id: "why1Body",
    label: "Razón 1 - Descripción",
    type: "textarea",
    default:
      "Un plan de expansión diseñado para maximizar el éxito en nuevos mercados.",
  },
  {
    id: "why2Title",
    label: "Razón 2 - Título",
    type: "text",
    default: "Soporte Continuo",
  },
  {
    id: "why2Body",
    label: "Razón 2 - Descripción",
    type: "textarea",
    default: "Apoyo constante en marketing, operaciones y gestión.",
  },
  {
    id: "why3Title",
    label: "Razón 3 - Título",
    type: "text",
    default: "Innovación y Crecimiento",
  },
  {
    id: "why3Body",
    label: "Razón 3 - Descripción",
    type: "textarea",
    default: "Una marca que invierte en innovación y crecimiento continuo.",
  },
  {
    id: "whySupportingText",
    label: "Texto de apoyo",
    type: "textarea",
    default:
      "¿Interesado en explorar oportunidades de franquicia? Completa el formulario para iniciar la conversación.",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Llenar el formulario",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
