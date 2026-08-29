// safeSvgDataUri — turns merchant-PASTED SVG markup into a passive image URL
// (quick task 260828).
//
// WHY A data: URI AND NOT AN HTML SINK. The obvious implementation of "paste an
// SVG and we render it" is dangerouslySetInnerHTML, which would inline the
// markup into the live document — where <script>, event handlers and
// <foreignObject> all execute in the page's origin (in the customizer that
// origin is the platform editor, not the merchant's own site). This theme
// allows exactly ONE HTML sink, the sanitized src/lib/rich-text.tsx, and
// test/richtext-sink-audit.test.ts enforces that count. So this takes the other
// road: serialize the markup into `data:image/svg+xml,…` and hand it to an
// <img src> through ThemeImage.
//
// That is not a workaround, it is the stronger guarantee. An SVG loaded via
// <img> is in the SVG spec's "secure static mode": scripting is disabled,
// external references (xlink:href, <image>, fonts, CSS @import) are not
// fetched, and declarative animation is off. The browser enforces this, so the
// safety does not rest on this file's regexes being exhaustive — a bar no
// hand-rolled HTML sanitizer clears.
//
// The scrubbing below is therefore DEFENCE IN DEPTH, not the primary control.
// It exists so a hostile payload is never even encoded into the attribute, and
// so the string stays safe if a future caller renders it some other way.
//
// TRADE-OFF worth knowing: because it is a real image and not inline DOM, the
// glyph cannot inherit `currentColor` from the IconChip. A pasted SVG paints in
// whatever colors it declares. That is the deliberate cost of not opening a
// second HTML sink.
//
// No imports — dependency-free, matching src/lib/safe-href.ts and
// src/lib/safe-anchor.ts (nothing new may be bundled).

// Must actually be an SVG document. Anything else (an <img> tag, a bare URL, a
// paragraph pasted by mistake) is rejected outright rather than coerced.
const SVG_ROOT = /^<svg[\s>]/i;

// Whole elements that must never survive, tags AND contents. `script` is the
// obvious one; `foreignObject` is the one people forget — it embeds arbitrary
// HTML inside SVG and is the standard bypass for naive tag filters.
const DANGEROUS_ELEMENTS =
  /<(script|foreignObject|iframe|embed|object|animate|set|handler)\b[\s\S]*?<\/\1\s*>/gi;

// …and their self-closing / unterminated forms, which the paired regex misses.
const DANGEROUS_SELF_CLOSING =
  /<(script|foreignObject|iframe|embed|object|animate|set|handler)\b[^>]*\/?>/gi;

// Inline event handlers in any quoting style, including unquoted.
const EVENT_HANDLERS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

// Scheme-bearing values. `javascript:` is the payload; `data:` is blocked too
// because a nested data: URI is a known smuggling vector. Entity-encoded and
// control-char-split variants are folded by the normalization below so this
// single pattern catches them.
const DANGEROUS_SCHEME = /(?:javascript|vbscript|data)\s*:/gi;

// HTML entities, the usual way a scheme hides from a literal match
// (`&#106;avascript:`).
const ENTITIES = /&#x?[0-9a-f]+;?/gi;

// Control characters (C0 range plus DEL) — the other way a scheme hides, by
// splitting the token ("java<TAB>script:").
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/**
 * Keep the attribute sane if a merchant pastes an entire illustration.
 *
 * EXPORTED so the customizer field that collects this markup caps itself at the
 * same number. `customIconSetting` (src/components/ui/theme-icon.tsx) sets `max`
 * from this: without it the platform's TextareaInput falls back to
 * `setting.max ?? 500` and puts that on the textarea's `maxLength`, so a pasted
 * SVG is silently truncated at 500 characters — about 4% of what this validator
 * accepts, and shorter than essentially every real icon. The truncated fragment
 * then fails SVG_ROOT below and renders nothing, with no error anywhere.
 */
export const SVG_MAX_LENGTH = 12_000;

export const safeSvgDataUri = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!SVG_ROOT.test(trimmed)) return undefined;
  if (trimmed.length > SVG_MAX_LENGTH) return undefined;

  // Fold the hiding tricks BEFORE the scrub, so the patterns below see the
  // payload in its plain form.
  const normalized = trimmed.replace(ENTITIES, "").replace(CONTROL_CHARS, "");

  const scrubbed = normalized
    .replace(DANGEROUS_ELEMENTS, "")
    .replace(DANGEROUS_SELF_CLOSING, "")
    .replace(EVENT_HANDLERS, "")
    .replace(DANGEROUS_SCHEME, "");

  // The scrub can empty out a payload that was nothing but a <script>; re-check
  // rather than emitting a truncated fragment.
  if (!SVG_ROOT.test(scrubbed)) return undefined;

  // encodeURIComponent (not base64) keeps the value readable in devtools and
  // avoids a btoa/Buffer branch that differs between SSR and browser.
  return `data:image/svg+xml,${encodeURIComponent(scrubbed)}`;
};
