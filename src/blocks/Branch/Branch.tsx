import * as React from "react";
import { Phone, Mail, Clock, Calendar, ArrowRight } from "lucide-react";

// Branch (INF-01) — section-local block for the Sucursales section. The design
// card: a white rounded panel (name in Gotham bold, guarded phone/email rows in
// Gill Sans with icons) and a navy circular directions button (yellow arrow).
//
// The card emits `data-branch-*` attributes (query/name/phone/mapurl/address)
// that the Sucursales section reads via a delegated click listener to re-center
// its interactive map and fill the map overlay. The "show on map" trigger is the
// navy arrow <button> (a REAL interactive element): the customizer's selection
// overlay only lets clicks on button/a/input through to component handlers, so a
// <div> trigger would be swallowed for block-selection. Phone/email anchors are
// interactive too, so they also re-center. The block stays stateless; the
// section owns the (no-useState) interactivity. On the published site (no
// overlay) clicking anywhere on the card re-centers.
//
// Guard (D-04 / QA-01 / Pitfall 1): NEVER emit an empty tel:/mailto: href — the
// phone/email rows render only when set, and stay the no-JS contact path.
//
// Stateless: no useState, no event handlers. Text is auto-escaped JSX (no
// dangerouslySetInnerHTML). Brand tokens only — no hex literals. @/ imports.
export interface BranchProps {
  name?: string;
  phone?: string;
  email?: string;
  /** Opening hours. Optional and intentionally WITHOUT a fallback default —
   *  branches saved before this field existed have no key and must render
   *  exactly as they did before (no schedule row at all). */
  horario?: string;
  /** Days open. Optional and intentionally WITHOUT a fallback default —
   *  branches saved before this field existed have no key and must render
   *  exactly as they did before (no days-open row at all). */
  diasAbierto?: string;
  address?: string;
  mapUrl?: string;
  mapQuery?: string;
  blockId?: string;
  blockType?: string;
}

export const Branch = ({
  name = "SD | Av. Independencia",
  phone,
  email,
  horario,
  diasAbierto,
  address,
  mapUrl,
  mapQuery,
}: BranchProps): React.ReactNode => {
  // Fall back to the branch name as the map query so branches saved before the
  // mapQuery field existed are still mappable (name usually carries a place).
  const query = mapQuery || name;
  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg bg-card px-4 lg:px-7 py-2 lg:py-5 shadow-md"
      // CONTENT-INDEPENDENT card marker (WR-05). Every other data-branch-*
      // attribute is conditional on merchant content — clear BOTH name and
      // mapQuery and even data-branch-query disappears. The section's filter
      // uses this marker to enumerate cards and to count them while resolving a
      // hide target, so it MUST be present unconditionally: a card that vanishes
      // from that count both escapes filtering itself and corrupts the walk for
      // its siblings.
      data-branch-card=""
      data-branch-query={query || undefined}
      data-branch-name={name}
      data-branch-phone={phone || undefined}
      data-branch-mapurl={mapUrl || undefined}
      data-branch-address={address || undefined}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-gotham font-bold text-brand-navy text-base lg:text-xl leading-8">
          {name}
        </h3>

        {/* GUARD (D-04 / QA-01): NEVER emit href="tel:"/"mailto:" empty. Wraps on
            narrow cards instead of overflowing (audit overflow item). */}
        {(phone || email) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2.5 font-gill text-base text-brand-navy"
              >
                <Phone aria-hidden="true" className="size-4 shrink-0" />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex min-w-0 items-center gap-2.5 font-gill text-base text-brand-navy"
              >
                <Mail aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{email}</span>
              </a>
            )}
          </div>
        )}

        {/* Opening hours. Guarded exactly like the contact rows above: an unset
            or empty value emits NOTHING (no empty row, no stray icon, no gap),
            which is what keeps pre-horario saved branches byte-identical.
            `data-branch-horario` is a test/consumer marker on this INNER node —
            distinct from the card-root data-branch-* attributes the section's
            click/filter listeners read. It is deliberately NOT part of the
            search haystack (search matches name + address only). */}
        {horario && (
          <div className="flex items-center gap-2.5 font-gill text-sm text-brand-navy/80">
            <Clock aria-hidden="true" className="size-4 shrink-0" />
            <p data-branch-horario={horario}>{horario}</p>
          </div>
        )}

        {/* Days open. Guarded exactly like the horario row above: an unset or
            empty value emits NOTHING (no empty row, no stray icon, no gap),
            which is what keeps pre-diasAbierto saved branches byte-identical.
            `data-branch-diasabierto` is a test/consumer marker on this INNER
            node — distinct from the card-root data-branch-* attributes the
            section's click/filter listeners read. It is deliberately NOT part
            of the search haystack (search matches name + address only). */}
        {diasAbierto && (
          <div className="flex items-center gap-2.5 font-gill text-sm text-brand-navy/80">
            <Calendar aria-hidden="true" className="size-4 shrink-0" />
            <p data-branch-diasabierto={diasAbierto}>{diasAbierto}</p>
          </div>
        )}
      </div>

      {/* Navy circular "show on map" trigger (yellow arrow). A real <button> so
          the customizer's selection overlay passes the click through to the
          section's map-recenter listener instead of selecting the block. */}
      <button
        type="button"
        aria-label={`Ver ${name} en el mapa`}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-yellow"
      >
        <ArrowRight aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
};

// Eight editable fields, ids → camelCase props. `address` feeds the Sucursales
// map overlay; `mapQuery` is where the map centers on selection. `horario` and
// `diasAbierto` default to the EMPTY string on purpose — that empty default is
// the backward-compat contract for branches saved before the field existed.
export const branchSettingsSchema = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    default: "SD | Av. Independencia",
  },
  {
    id: "phone",
    label: "Teléfono",
    type: "text",
    default: "809-285-4230",
  },
  {
    id: "email",
    label: "Correo",
    type: "text",
    default: "info@fixocargo.com",
  },
  {
    id: "horario",
    label: "Horario",
    type: "text",
    default: "",
    placeholder: "Lun-Vie 9:00am-6:00pm, Sáb 9:00am-1:00pm",
    info: "Horario de atención. Déjalo vacío para no mostrar esta línea en la tarjeta.",
  },
  {
    id: "address",
    label: "Dirección",
    type: "textarea",
    default: "",
    placeholder: "Calle, número, sector, ciudad…",
    info: "Se muestra en la tarjeta superpuesta del mapa al seleccionar la sucursal.",
  },
  {
    id: "mapUrl",
    label: "Enlace de mapa",
    type: "url",
    default: "#",
    placeholder: "https://maps.google.com/…",
  },
  {
    id: "mapQuery",
    label: "Ubicación (mapa)",
    type: "text",
    default: "Av. Independencia, Santo Domingo",
    placeholder: "Dirección o lat,lng",
    info: "Lugar que el mapa centra al seleccionar esta sucursal.",
  },
  {
    id: "diasAbierto",
    label: "Días de atención",
    type: "text",
    default: "",
    placeholder: "Lunes a Sábado",
    info: "Días de atención. Déjalo vacío para no mostrar esta línea en la tarjeta.",
  },
];
