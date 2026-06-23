import type React from "react";

// "Download on the App Store" badge rendered as a single-color (currentColor)
// mark: rounded outline pill + Apple glyph + wordmark. Monochrome treatment so
// the link/IconChip controls color via brand tokens (FND-03 — no hex literals;
// official guidelines permit an all-white/all-black monochrome badge). Accepts
// `className` for sizing (set height; width auto-scales via the viewBox).
export const AppStore: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 120 40"
    role="img"
    aria-hidden="true"
    fill="currentColor"
    className={className}
  >
    <rect
      x="0.75"
      y="0.75"
      width="118.5"
      height="38.5"
      rx="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M28.77 20.3c-.02-2.06 1.69-3.06 1.77-3.11-.97-1.41-2.47-1.6-3-1.62-1.26-.13-2.49.75-3.13.75-.65 0-1.65-.74-2.72-.71-1.37.02-2.65.81-3.36 2.04-1.45 2.51-.37 6.21 1.02 8.24.69 1 1.51 2.11 2.58 2.07 1.04-.04 1.43-.66 2.69-.66 1.25 0 1.61.66 2.7.64 1.12-.02 1.83-1 2.5-2.01.8-1.15 1.13-2.27 1.14-2.33-.03-.01-2.17-.83-2.19-3.29zm-2.06-6.05c.56-.7.95-1.66.84-2.62-.81.04-1.83.56-2.42 1.24-.52.6-.98 1.59-.86 2.52.91.07 1.85-.46 2.44-1.14z" />
    <text
      x="42"
      y="16"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="7"
    >
      Download on the
    </text>
    <text
      x="42"
      y="31"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="16"
      fontWeight="600"
    >
      App Store
    </text>
  </svg>
);
