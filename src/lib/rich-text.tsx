import type React from "react";
import DOMPurify, { type Config } from "dompurify"; // bundled (NOT externalized); ships own types
import { EmptyState } from "@/lib/empty-state";

// THE theme's FIRST and ONLY HTML-injection sink (D-03/D-04). The platform
// stores merchant richtext HTML raw (ZERO sanitization), so this helper is the
// sole sanitization layer before that HTML reaches a visitor's browser.
//
// Two execution contexts, two sanitizers:
//   • Browser (published site, `window` present): DOMPurify — a real DOM-based
//     allow-list sanitizer — is the authoritative control. `import DOMPurify`
//     auto-binds the default export to the global `window` at import time, so
//     `DOMPurify.sanitize` is a bound function here.
//   • No-DOM (SSR/node prerender + the node-env vitest runner): `stringStrip`,
//     the portable regex baseline below.
//
// SECURITY (D-02 / Pitfall 1): DOMPurify silently NO-OPS without a DOM — calling
// it in the no-`window` branch would pass hostile HTML straight through. The
// `typeof window` guard is therefore a SECURITY control, not a convenience: the
// no-DOM branch MUST route to `stringStrip`, never a pass-through DOMPurify.

// Portable, no-DOM baseline. NOT a parser — defense-in-depth for pre-hydration
// HTML strings only; the browser DOMPurify path is the authoritative
// execution-time control. Its job is to keep <script>/onerror/javascript: out
// of any HTML string produced where no DOM exists.
export function stringStrip(html: string): string {
  return html
    .replace(
      /<\s*(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(/<\s*(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "") // on*= handlers
    .replace(
      /(href|src|xlink:href)\s*=\s*("|')?\s*(javascript|vbscript|data)\s*:[^"'>\s]*("|')?/gi,
      "",
    ) // bad-protocol URIs
    .replace(/(javascript|vbscript)\s*:/gi, ""); // residual protocol tokens
}

// Allow-list config shared with DOMPurify. NO style/class/id in ALLOWED_ATTR —
// brand control flows exclusively through the scoped `.article-body` CSS (07-04),
// and excluding `style` closes the inline-CSS injection surface (T-07-06).
export const RICHTEXT_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "hr",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"], // NO style/class/id
  // Restrict link protocols to safe schemes (default DOMPurify behavior, made
  // explicit) — blocks javascript:/data:/vbscript: hrefs (T-07-03).
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
} as const;

// Register ONCE at module load, but ONLY when a DOM exists. The bundled
// DOMPurify default export is an UNINITIALIZED factory without a `window`
// (carry-forward from 07-01): `addHook`/`sanitize` are not bound until a DOM is
// present, so an unconditional module-scope `DOMPurify.addHook(...)` throws
// under the node-env vitest runner. Guarding with `typeof window` also keeps all
// DOM access out of the no-DOM path. The hook forces noopener/noreferrer on any
// target=_blank link to close the reverse-tabnabbing surface (T-07-04); it only
// fires inside the browser `DOMPurify.sanitize` branch below.
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (
      node.tagName === "A" &&
      (node as Element).getAttribute("target") === "_blank"
    ) {
      (node as Element).setAttribute("rel", "noopener noreferrer");
    }
  });
}

export interface RichTextProps {
  html?: string;
  className?: string;
}

// THE ONE AND ONLY dangerouslySetInnerHTML IN THE CODEBASE (D-03/D-04).
// Pinned by test/richtext-sink-audit.test.ts.
export const RichText = ({
  html,
  className,
}: RichTextProps): React.ReactNode => {
  // Empty/undefined/whitespace never builds a `__html` from the empty value
  // (D-03) — guard FIRST, before any sanitizer touches the input.
  if (!html || !html.trim()) {
    return (
      <EmptyState
        heading="Sin contenido"
        body="Agrega contenido en el editor."
      />
    );
  }

  // SECURITY: never call DOMPurify without a DOM — it silently no-ops, passing
  // hostile HTML through. Guard first; the no-DOM branch takes stringStrip.
  const clean =
    typeof window !== "undefined"
      ? // RICHTEXT_CONFIG is `as const` (readonly) for precise test introspection;
        // cast to DOMPurify's mutable Config at the call site only.
        DOMPurify.sanitize(html, RICHTEXT_CONFIG as unknown as Config)
      : stringStrip(html);

  return (
    <div
      className={`article-body ${className ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
