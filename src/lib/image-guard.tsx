import type React from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface ImageGuardProps {
  url?: string | null;
  alt?: string;
  ratio?: number;
  className?: string;
}

// Renders an <img> when a url is present, otherwise a neutral placeholder box
// at the element's aspect ratio — never a broken <img> or collapsed layout.
export const ImageGuard = ({
  url,
  alt = "",
  ratio = 16 / 9,
  className,
}: ImageGuardProps): React.ReactNode => (
  <AspectRatio ratio={ratio}>
    {url ? (
      <img
        src={url}
        alt={alt}
        className={`absolute inset-0 h-full w-full rounded-2xl object-contain ${className ?? ""}`}
      />
    ) : (
      <div className="bg-secondary text-muted-foreground absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm">
        Agrega una imagen
      </div>
    )}
  </AspectRatio>
);
