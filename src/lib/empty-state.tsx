import type React from "react";

export interface EmptyStateProps {
  heading?: string;
  body?: string;
}

// Rendered when a section has zero child blocks — never leave a blank gap.
// Usage: {hasBlocks ? renderBlocks() : <EmptyState />}
export const EmptyState = ({
  heading = "Sin elementos",
  body = "Agrega bloques desde el panel del editor para ver el contenido aquí.",
}: EmptyStateProps): React.ReactNode => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-8 text-center">
    <p className="font-gotham text-brand-navy font-bold">{heading}</p>
    <p className="text-muted-foreground font-opensans text-sm">{body}</p>
  </div>
);
