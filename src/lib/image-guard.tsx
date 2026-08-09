import type React from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { ImageFormats } from "@/lib/image-srcset";
import { ThemeImage } from "@/lib/theme-image";

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
  // Shared placeholder — identical markup in both modes (D-01, unchanged).
  const placeholder = (
    <div className="bg-secondary text-secondary-foreground absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm">
      Agrega una imagen
    </div>
  );

  if (fill) {
    // `positioning="custom"` (ThemeImage, @/lib/theme-image) so the exact
    // pre-existing className string is preserved byte-for-byte — this is a
    // refactor to share the srcSet/sizes decision with the seam, not a
    // redesign of this guard's own behavior (Phase 17 Plan 11 Task 2).
    return (
      <ThemeImage
        url={url}
        alt={alt}
        width={width}
        height={height}
        formats={formats}
        sizesHint="100vw"
        positioning="custom"
        className={`absolute inset-0 h-full w-full rounded-2xl object-cover ${className ?? ""}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <AspectRatio ratio={ratio}>
      <ThemeImage
        url={url}
        alt={alt}
        width={width}
        height={height}
        formats={formats}
        sizesHint="100vw"
        positioning="custom"
        className={`absolute inset-0 h-full w-full rounded-2xl object-contain ${className ?? ""}`}
        placeholder={placeholder}
      />
    </AspectRatio>
  );
};
