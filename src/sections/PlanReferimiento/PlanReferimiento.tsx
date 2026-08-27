import * as React from "react";

import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { Button } from "@/components/ui/button";
import { RichText } from "@/lib/rich-text";

// PlanReferimiento (quick task 260706-qqi) — a fully self-contained,
// settings-only section for the FixoCargo "Beneficios" page: NO renderBlocks
// prop, NO BlocksSlot, NO child-block slot at all — matches the no-block
// pattern in src/sections/ArticleBody/ArticleBody.tsx.
//
// LEFT card ("¿Cómo Funciona?"): a hardcoded heading + TWO numbered
// process steps, an editable prizeCalloutTitle/Body callout, and a yellow pill
// CTA (editable label/url).
//
// STEPS (quick task 260827): the two steps were previously LITERAL text on the
// grounds that the design shows exactly two fixed steps. The count is still
// fixed at two, but the COPY is now settings (`step1Title`/`step1Body`,
// `step2Title`/`step2Body`) — the 2026-08 copy revision rewrote both sentences
// and added a bold lead-in title to each, which literal text made impossible
// to publish without a code change. Their destructured defaults carry that
// revised copy: every page rendered the SAME hardcoded sentences before, so
// there is no per-merchant value to preserve, and a page saved before these
// settings existed correctly picks up the new wording instead of freezing the
// superseded text.
// RIGHT card ("Términos y Condiciones"): a hardcoded heading + a scrollable
// richtext `terms` field rendered EXCLUSIVELY through RichText — the theme's
// single audited HTML sink (@/lib/rich-text). No new dangerouslySetInnerHTML
// is introduced here.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface PlanReferimientoProps {
  eyebrow?: string;
  heading?: string;
  step1Title?: string;
  step1Body?: string;
  step2Title?: string;
  step2Body?: string;
  prizeCalloutTitle?: string;
  prizeCalloutBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  terms?: string;
  sectionId?: string;
  sectionName?: string;
}

export const PlanReferimiento = ({
  eyebrow = "Refiere y gana",
  heading = "Plan de referidos",
  step1Title = "Comparte tu enlace",
  step1Body = "Solicita tu enlace de referido y compártelo con amigos y familiares.",
  step2Title = "Acumula oportunidades para ganar",
  step2Body = "Cada vez que una persona se registre a través de tu enlace y realice su primer envío, recibirás automáticamente un boleto electrónico para participar.",
  prizeCalloutTitle = "Premios del sorteo",
  prizeCalloutBody = "AirPods, gift cards, iPads y otros premios seleccionados por Fixo Cargo.",
  ctaLabel = "¡Solicita tu enlace!",
  ctaUrl = "#",
  terms = "",
}: PlanReferimientoProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3">
          {eyebrow && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
          <Card variant="navy-dark" className="flex flex-col gap-6 p-8 lg:p-11">
            <h3 className="font-gotham font-bold text-white text-2xl lg:text-3xl">
              ¿Cómo Funciona?
            </h3>

            {[
              { number: "1", title: step1Title, body: step1Body },
              { number: "2", title: step2Title, body: step2Body },
            ].map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <IconChip background="yellow" size="md">
                  <span className="font-gotham font-bold text-brand-navy text-lg">
                    {step.number}
                  </span>
                </IconChip>
                <div className="flex flex-col gap-1">
                  {step.title && (
                    <p className="font-gotham font-bold text-white text-lg leading-6">
                      {step.title}
                    </p>
                  )}
                  {step.body && (
                    <p className="font-gill text-white/80 text-lg leading-6">
                      {step.body}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-white/5 p-6 flex flex-col gap-2">
              {prizeCalloutTitle && (
                <p className="font-gotham font-bold text-brand-yellow text-base">
                  {prizeCalloutTitle}
                </p>
              )}
              {prizeCalloutBody && (
                <p className="font-gill text-white/80 text-base leading-5">
                  {prizeCalloutBody}
                </p>
              )}
            </div>

            <Button size="lg" variant="pill" asChild className="w-fit">
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          </Card>

          <Card variant="surface" className="flex flex-col gap-5 p-8 lg:p-10">
            <h3 className="font-gotham font-bold text-brand-navy text-2xl lg:text-3xl">
              Términos y Condiciones
            </h3>
            <div className="max-h-[420px] overflow-y-auto pr-4">
              <RichText html={terms} />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Eleven editable fields, ids → camelCase props. The step count stays fixed at
// two; only their copy is editable.
export const planReferimientoSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Refiere y gana",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Plan de referidos",
  },
  {
    id: "step1Title",
    label: "Paso 1 · Título",
    type: "text",
    default: "Comparte tu enlace",
  },
  {
    id: "step1Body",
    label: "Paso 1 · Descripción",
    type: "textarea",
    default:
      "Solicita tu enlace de referido y compártelo con amigos y familiares.",
  },
  {
    id: "step2Title",
    label: "Paso 2 · Título",
    type: "text",
    default: "Acumula oportunidades para ganar",
  },
  {
    id: "step2Body",
    label: "Paso 2 · Descripción",
    type: "textarea",
    default:
      "Cada vez que una persona se registre a través de tu enlace y realice su primer envío, recibirás automáticamente un boleto electrónico para participar.",
  },
  {
    id: "prizeCalloutTitle",
    label: "Título del premio",
    type: "text",
    default: "Premios del sorteo",
  },
  {
    id: "prizeCalloutBody",
    label: "Descripción del premio",
    type: "textarea",
    default:
      "AirPods, gift cards, iPads y otros premios seleccionados por Fixo Cargo.",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "¡Solicita tu enlace!",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
  {
    id: "terms",
    label: "Términos y condiciones",
    type: "richtext",
    default: "",
  },
];
