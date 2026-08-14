// safeAnchorId — the theme's guard for merchant-supplied FRAGMENT IDENTIFIERS
// (quick task 260814-a07, T-A07-01/02/03).
//
// A merchant types an anchor like `q4` into a faq-item's "Ancla (enlace
// directo)" field and it is written straight into a live `id` attribute on the
// published page. React escapes an attribute's VALUE but does not constrain its
// SHAPE, so without a guard an id could carry spaces, quotes, angle brackets or
// a stray `#` — none of which make a usable fragment target.
//
// This is an ALLOWLIST, not a denylist and NOT an escaper. Only
// `[a-z0-9_-]` survives; every run of anything else collapses to a single dash.
// The distinction matters: an escaper (CSS.escape) only helps if you are
// building a selector, and this design deliberately builds none. An allowlist
// instead yields a canonical FORM, which is the thing both sides of the
// comparison can agree on.
//
// Deliberately shared by BOTH paths, and that sharing is the whole trick:
//   • the id-rendering path (what lands in the served markup), and
//   • the hash-comparison path (what a visitor's `location.hash` is measured
//     against inside the faq-item effect).
// Because the same function normalizes both operands, a merchant who saved
// `#Envío 4` and a visitor who arrives on `#envio-4` converge on `envio-4` and
// match. That is more forgiving than the browser's own case-sensitive fragment
// matching, on purpose. It is also why IDEMPOTENCE is a tested property rather
// than an incidental one — normalizing an already-normalized value must be a
// no-op or the comparison would drift.
//
// Returning `undefined` (never `""`) is a CONTRACT, not a style choice. React
// omits an attribute whose value is `undefined` but emits `id=""` for an empty
// string, and the locked back-compat rule for this task is that a blank anchor
// renders no `id` attribute at all — so every faq-item saved before this change
// stays byte-identical.
//
// No imports — this must stay dependency-free, matching src/lib/safe-href.ts
// (nothing new may be bundled).

// A SINGLE leading fragment marker, stripped because merchants paste the thing
// they see in the address bar. A second `#` is not special-cased: it simply
// falls through to the disallowed-run collapse below.
const LEADING_MARKER = /^#/;

// The Unicode combining-marks range. NFD splits "í" into "i" + combining acute,
// so stripping this range folds Spanish accents to their base letter instead of
// deleting the letter. Same idiom as the `fold` helper in
// src/sections/Sucursales/Sucursales.tsx.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

// Everything outside the allowlist, matched as a RUN so "a   b" becomes "a-b"
// rather than "a---b".
const DISALLOWED_RUN = /[^a-z0-9_-]+/g;

// Dashes at either edge of the result — an artifact of the collapse above
// (" q4 " would otherwise become "-q4-").
const EDGE_DASHES = /^-+|-+$/g;

// Trailing dashes only, re-applied after the length cap in case truncation cut
// through the middle of a collapsed run.
const TRAILING_DASHES = /-+$/;

// Long enough for any human-readable anchor, short enough to keep the attribute
// sane if a merchant pastes a paragraph.
const MAX_LENGTH = 64;

export const safeAnchorId = (value?: string): string | undefined => {
  if (!value) return undefined;

  const folded = value
    .trim()
    .replace(LEADING_MARKER, "")
    .trim()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase();

  const allowed = folded.replace(DISALLOWED_RUN, "-").replace(EDGE_DASHES, "");
  if (!allowed) return undefined;

  const capped = allowed.slice(0, MAX_LENGTH).replace(TRAILING_DASHES, "");
  return capped || undefined;
};
