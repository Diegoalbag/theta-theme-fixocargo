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
// LEFT card ("¿Cómo Funciona?"): a hardcoded heading + TWO hardcoded numbered
// process-step sentences (locked decision — the design shows exactly 2 fixed
// steps, so they are literal text, not settings), an editable
// prizeCalloutTitle/Body callout, and a yellow pill CTA (editable label/url).
// RIGHT card ("Términos y Condiciones"): a hardcoded heading + a scrollable
// richtext `terms` field rendered EXCLUSIVELY through RichText — the theme's
// single audited HTML sink (@/lib/rich-text). No new dangerouslySetInnerHTML
// is introduced here.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface PlanReferimientoProps {
  eyebrow?: string;
  heading?: string;
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
  heading = "Plan de Referimiento",
  prizeCalloutTitle = "Premios del sorteo",
  prizeCalloutBody = "AirPods, gift cards, iPads y otros artículos seleccionados por Fixo Cargo.",
  ctaLabel = "¡Solicita el enlace aquí!",
  ctaUrl = "#",
  terms = "",
}: PlanReferimientoProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
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

            <div className="flex items-start gap-4">
              <IconChip background="yellow" size="md">
                <span className="font-gotham font-bold text-brand-navy text-lg">
                  1
                </span>
              </IconChip>
              <p className="font-gill text-white/80 text-lg leading-6">
                Solicita tu enlace de referidor y compártelo con tus amigos y
                familiares.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <IconChip background="yellow" size="md">
                <span className="font-gotham font-bold text-brand-navy text-lg">
                  2
                </span>
              </IconChip>
              <p className="font-gill text-white/80 text-lg leading-6">
                Cada vez que alguien se registre y realice un pedido a través
                de tu enlace, recibirás automáticamente un boleto electrónico.
              </p>
            </div>

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

// Exactly 7 editable fields, ids → camelCase props.
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
    default: "Plan de Referimiento",
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
      "AirPods, gift cards, iPads y otros artículos seleccionados por Fixo Cargo.",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "¡Solicita el enlace aquí!",
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
