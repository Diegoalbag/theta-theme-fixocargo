import type React from "react";

// "Get it on Google Play" badge rendered as a single-color (currentColor)
// mark: rounded outline pill + Play triangle glyph + wordmark. Monochrome so
// the link/IconChip controls color via brand tokens (FND-03 — no hex literals).
// Accepts `className` for sizing (set height; width auto-scales via viewBox).
export const GooglePlay: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M17.5 12.2a1.4 1.4 0 0 0-.32.97v13.66c0 .4.12.73.33.96l.05.04 7.65-7.65v-.18l-7.66-7.8z" />
    <path d="M27.78 23.32l-2.56-2.56v-.18l2.56-2.56.06.03 3.03 1.72c.87.49.87 1.3 0 1.8l-3.09 1.75z" />
    <path d="M27.84 23.29l-2.62-2.62-7.7 7.7c.29.3.76.34 1.29.04l9.03-5.12" />
    <path d="M27.84 18.05l-9.03-5.13c-.53-.3-1-.26-1.29.05l7.7 7.7 2.62-2.62z" />
    <text
      x="42"
      y="16"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="7"
    >
      GET IT ON
    </text>
    <text
      x="42"
      y="31"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="15"
      fontWeight="600"
    >
      Google Play
    </text>
  </svg>
);
