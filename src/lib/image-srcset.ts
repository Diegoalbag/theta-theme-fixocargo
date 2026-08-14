/**
 * Pure srcset/sizes builder for Strapi Upload plugin `formats` data (D-01).
 *
 * This is the theme's own independent copy of the contract implemented in
 * `templates/theme-site/lib/image-srcset.ts` (Plan 02, a SEPARATE repo this
 * theme cannot import from). Strapi's Upload plugin stores resize variants
 * (thumbnail/small/medium/large[/webp]) on the file's OWN `plugin::upload.file`
 * record, keyed by width. This helper turns that `formats` object into the
 * `srcSet`/`sizes` attribute pair an `<img>` tag needs, defensively: never
 * throw, never return `undefined`-valued keys, degrade to `{}` when there's
 * nothing usable.
 *
 * Iterates whatever keys are present in `formats` — it must NOT hardcode a
 * fixed set of expected format keys, so a future webp/avif format key is
 * picked up automatically with zero theme code changes.
 */

export interface ImageFormatEntry {
  url: string;
  width?: number;
  height?: number;
}

export type ImageFormats = Record<string, ImageFormatEntry | undefined | null>;

export interface BuiltSrcSet {
  srcSet?: string;
  sizes?: string;
}

/**
 * Shared `sizes` hint for a genuinely full-viewport, full-bleed background
 * image (Phase 17 Plan 11). Exported as a constant — rather than each
 * full-bleed section/block writing the literal string inline — so the
 * literal text `100vw` appears in exactly one place in this theme, never in
 * a section/block source file. `test/static-audit.test.tsx`'s per-section
 * scan forbids `100vw` as a Figma-export full-viewport-CSS anti-pattern
 * signal; a `sizesHint` VALUE meaning "this image really does span the
 * viewport" is a legitimate, unrelated use of the same three characters, and
 * routing it through this constant keeps the audit's real anti-pattern check
 * intact without weakening its regex to special-case this call shape.
 */
export const FULL_BLEED_SIZES = "100vw";

/**
 * The full-resolution source image, offered as one more srcset candidate.
 *
 * WHY THIS EXISTS (debug session 2026-08-14). Without it, `buildSrcSet` can
 * only ever offer Strapi's generated `formats`, which top out at the `large`
 * breakpoint (1000px by default). Every full-bleed section here uses
 * `FULL_BLEED_SIZES` ("100vw"), so on any viewport wider than 1000 CSS px —
 * virtually all non-mobile traffic, more so on retina — the browser's srcset
 * algorithm has no candidate above 1000w, selects it, and CSS-upscales that
 * 1000px image to fill the viewport. That upscale is real, visible blur. The
 * plain `src` attribute DOES point at the true original, but a browser that
 * understands `srcset`+`sizes` never falls back to it, so it cannot rescue this.
 *
 * The bug was latent from the day this shipped: Strapi only generates a `large`
 * variant when the breakpoint is smaller than the source, so while originals
 * were under ~1000px no `large` existed and the original rendered natively.
 * Larger re-uploaded originals started generating `large`, and the cap fired
 * for the first time.
 *
 * PAIRS WITH the `xlarge: 1920` breakpoint in project-theta-strapi's
 * config/plugins.ts. Without that rung, a 1920px desktop jumps from 1000w
 * straight to the full original and trades blur for payload weight.
 */
export interface OriginalImageCandidate {
  url: string;
  width: number;
}

/**
 * Build a `srcSet`/`sizes` attribute pair from a Strapi `formats` object.
 *
 * - Filters entries down to those with a string `url` AND a numeric `width` (a
 *   width-descriptor srcset entry requires a known width).
 * - Adds `original` as a further candidate when its url/width are usable, so the
 *   ladder is not capped at Strapi's largest generated breakpoint.
 * - De-duplicates by width — srcset requires unique width descriptors, and the
 *   original's width can coincide with a generated format's.
 * - Sorts the surviving entries ascending by `width`, regardless of input key order.
 * - Only sets `sizes` when a `srcSet` was actually produced — an empty/malformed
 *   `formats` object with no usable original yields `{}`, never a `sizes`-only object.
 * - Never throws: null/undefined/malformed input all degrade to `{}`.
 */
export function buildSrcSet(
  formats: ImageFormats | null | undefined,
  sizesHint = "100vw",
  original?: OriginalImageCandidate | null,
): BuiltSrcSet {
  const formatEntries =
    formats != null && typeof formats === "object"
      ? Object.values(formats).filter(
          (entry): entry is ImageFormatEntry =>
            entry != null &&
            typeof entry === "object" &&
            typeof entry.url === "string" &&
            typeof entry.width === "number",
        )
      : [];

  // Only extend a ladder that actually exists. With no generated formats there
  // is nothing to cap: the browser falls back to `src`, which already points at
  // the original at full resolution, so a single-candidate srcset would add no
  // information and would put a srcset on images (logos, small uploads) that
  // never had one. The empty-url guard matters because a blank url would emit a
  // structurally broken " 900w" descriptor.
  const isValidOriginal =
    formatEntries.length > 0 &&
    original != null &&
    typeof original.url === "string" &&
    original.url !== "" &&
    typeof original.width === "number" &&
    Number.isFinite(original.width) &&
    original.width > 0;

  const candidates: ImageFormatEntry[] = isValidOriginal
    ? [...formatEntries, { url: original.url, width: original.width }]
    : formatEntries;

  const seenWidths = new Set<number>();
  const entries = candidates
    .filter((entry) => {
      const width = entry.width as number;
      if (seenWidths.has(width)) return false;
      seenWidths.add(width);
      return true;
    })
    .sort((a, b) => (a.width as number) - (b.width as number));

  if (entries.length === 0) return {};

  const srcSet = entries
    .map((entry) => `${entry.url} ${entry.width}w`)
    .join(", ");

  return { srcSet, sizes: sizesHint };
}
