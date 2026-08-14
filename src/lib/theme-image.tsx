import type React from "react";

import { buildSrcSet, type ImageFormats } from "@/lib/image-srcset";

/**
 * ThemeImage — the full-bleed image seam (Phase 17 Plan 11, PERF-03 gap
 * closure).
 *
 * This is the counterpart to `ImageGuard` (`@/lib/image-guard`): where
 * `ImageGuard` boxes an image to a fixed aspect ratio or fills its own
 * positioned parent, `ThemeImage` covers TWO other shapes every section in
 * this theme actually needs:
 *
 *   - `positioning="fill"` (the default) — the full-bleed, absolutely
 *     positioned, `object-cover` background pattern eight sections/blocks
 *     hand-rolled identically (`absolute inset-0 h-full w-full object-cover`)
 *     before this seam existed: HeroSlide, PromoBanner, Beneficios,
 *     ServiciosHero, NosotrosHero, BlogHero, EnviosNacionales, DescargaApp.
 *   - `positioning="custom"` — an escape hatch for the few images that are
 *     neither full-bleed-cover nor an ImageGuard-shaped box: the inline
 *     `SiteHeader`/`Footer` logos (natural flow, fixed height, `w-auto`) and
 *     `DecorativeBackdrop`'s custom absolutely-positioned decorative image
 *     (`object-contain`, caller-computed width/height/transform/opacity/
 *     z-index via `style`). In this mode the caller's `className`/`style`
 *     are used exactly as given — this seam adds NO base classes — so a
 *     conversion changes zero visual behavior at any of those three sites.
 *
 * Every mode:
 *   - calls the SAME `buildSrcSet` this theme's boxed guard and the three
 *     previously-wired paths already used, so there is exactly one place the
 *     width-descriptor `srcSet`/`sizes` decision lives across both seams.
 *   - degrades to the caller's own `placeholder` (default: render nothing)
 *     when `url` is absent — never a broken `<img>`, and never a change to
 *     a section's pre-existing empty state.
 *   - accepts a `priority` flag so exactly one call site (the first-viewport
 *     hero) can be eager + high fetch priority; every other image stays lazy
 *     with async decoding, matching the measured page's existing 10-of-12
 *     lazy baseline (Task 3 must not regress that).
 *
 * `sizesHint` (deliberately NOT named `sizes`, see `test/no-bare-img.test.ts`'s
 * sibling acceptance criterion): the layout-appropriate `sizes` value for
 * this image's role — a full-viewport hint for a full-bleed background, a
 * narrow fixed hint for a logo/badge, a container-relative hint for a boxed
 * content image. Required, not defaulted, so a future call site cannot
 * silently blanket-apply "100vw" to a box that isn't full-viewport (T-17-45).
 *
 * Pure and stateless: no hooks, no event handlers, no render-time
 * window/document access — every section that uses it stays safe to render
 * under `renderToStaticMarkup` on the server shell.
 */

export interface ThemeImageValue {
  id?: string | number | null;
  url?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  formats?: ImageFormats | null;
}

export interface ThemeImageProps {
  url?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  formats?: ImageFormats | null;
  /** Layout-appropriate `sizes` hint — see file header. Required. */
  sizesHint: string;
  /** Eager + high fetch priority (first-viewport hero only). Default: lazy. */
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Only meaningful in `positioning="fill"` (the default). */
  objectFit?: "cover" | "contain";
  /**
   * "fill" (default): the shared full-bleed `absolute inset-0 h-full w-full
   * object-{cover|contain}` base, with `className` appended.
   * "custom": no base classes at all — `className`/`style` are used exactly
   * as given, for shapes that are neither full-bleed nor an ImageGuard box.
   */
  positioning?: "fill" | "custom";
  /** Rendered instead of an `<img>` when `url` is absent. Default: nothing. */
  placeholder?: React.ReactNode;
}

export const ThemeImage = ({
  url,
  alt = "",
  width,
  height,
  formats,
  sizesHint,
  priority = false,
  className,
  style,
  objectFit = "cover",
  positioning = "fill",
  placeholder = null,
}: ThemeImageProps): React.ReactNode => {
  if (!url) return <>{placeholder}</>;

  // `width` is the ORIGINAL's intrinsic width (same source as the `width`
  // attribute below), so passing it here offers the full-resolution image as a
  // srcset candidate above Strapi's largest generated breakpoint. Without this
  // the ladder stops at `large` (1000px) and every full-bleed image is
  // CSS-upscaled — see buildSrcSet's OriginalImageCandidate docs. Omitted when
  // `width` is unknown, in which case behavior is exactly as before.
  const { srcSet, sizes } = buildSrcSet(
    formats,
    sizesHint,
    width != null ? { url, width } : null,
  );

  const objectFitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const resolvedClassName =
    positioning === "custom"
      ? (className ?? "")
      : ["absolute inset-0 h-full w-full", objectFitClass, className]
          .filter(Boolean)
          .join(" ");

  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={resolvedClassName}
      style={style}
    />
  );
};
