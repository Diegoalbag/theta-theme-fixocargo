import type React from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { buildSrcSet, type ImageFormats } from "@/lib/image-srcset";

export interface ImageGuardProps {
  url?: string | null;
  alt?: string;
  ratio?: number;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  formats?: ImageFormats | null;
}

// Renders an <img> when a url is present, otherwise a neutral placeholder box
// — never a broken <img> or collapsed layout.
//
// Two modes:
//  - default (ratio): the image/placeholder is boxed at `ratio` via AspectRatio.
//  - fill (`fill`): the image/placeholder fills its RELATIVE parent (absolute
//    inset-0, object-cover), so the parent controls the size — use when the
//    parent already has a height (e.g. a stretched flex column). The caller
//    MUST give the parent `position: relative` and a resolved height.
export const ImageGuard = ({
  url,
  alt = "",
  ratio = 16 / 9,
  fill = false,
  className,
  width,
  height,
  formats,
}: ImageGuardProps): React.ReactNode => {
  if (fill) {
    const { srcSet, sizes } = buildSrcSet(formats, "100vw");
    return url ? (
      <img
        src={url}
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full rounded-2xl object-cover ${className ?? ""}`}
      />
    ) : (
      <div className="bg-secondary text-secondary-foreground absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm">
        Agrega una imagen
      </div>
    );
  }

  const { srcSet, sizes } = buildSrcSet(formats, undefined);
  return (
    <AspectRatio ratio={ratio}>
      {url ? (
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          srcSet={srcSet}
          sizes={sizes}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full rounded-2xl object-contain ${className ?? ""}`}
        />
      ) : (
        <div className="bg-secondary text-secondary-foreground absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm">
          Agrega una imagen
        </div>
      )}
    </AspectRatio>
  );
};
