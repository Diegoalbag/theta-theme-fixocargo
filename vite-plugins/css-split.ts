// Generic, reusable Vite build-plugin that splits a theme's single emitted
// `theme.bundle.css` into a synchronously-critical chunk (global tokens/reset
// + whatever sections a theme author marks as "critical") and a
// `theme.bundle.deferred.css` chunk (everything else) — Phase 11 Plan 05,
// D-05/D-06/D-07.
//
// This file lives OUTSIDE `src/` on purpose: it is build-time-only Node
// tooling consumed exclusively by `vite.config.ts` and never bundled into the
// shipped theme (see `vite.config.ts`'s `plugins` array).
//
// Design constraint (RESEARCH Pitfall 3): Rollup does not support multiple
// entries for `iife`/`umd` output, so `cssCodeSplit: true` is a no-op for this
// build shape. The split below is a `generateBundle` POST-PROCESSING step on
// the single CSS asset Vite already emits — it never touches the JS build
// path (`theme.bundle.js`, `entryFileNames`, `chunkFileNames`).
//
// Every exported function down to `createCssSplitPlugin` is pure (no fs, no
// Vite/Rollup imports) so it is fully unit-testable in isolation
// (test/css-split-plugin.test.ts). Only `createCssSplitPlugin`'s return type
// references a Vite `Plugin` type, via `import type` (erased at compile time,
// never bundled or executed).

import type { Plugin } from "vite";

/**
 * "site-header" -> "SiteHeader", "hero-slide" -> "HeroSlide", "hero" -> "Hero".
 * Mirrors the PascalCase directory names under `src/sections/` / `src/blocks/`.
 */
export function kebabToPascalCase(key: string): string {
  return key
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

/**
 * True if `moduleId` belongs to a section/block a theme author has marked as
 * "critical" (first-viewport, ships synchronously), OR is the theme's global
 * `src/index.css` (tokens/reset/fonts — always needed immediately regardless
 * of `criticalSections` content).
 */
export function isCriticalModule(
  moduleId: string,
  criticalSections: string[],
): boolean {
  if (moduleId.endsWith("/src/index.css")) return true;

  return criticalSections.some((key) => {
    const pascal = kebabToPascalCase(key);
    return (
      moduleId.includes(`/src/sections/${pascal}/`) ||
      moduleId.includes(`/src/blocks/${pascal}/`)
    );
  });
}

// Matches every quoted string literal (double, single, or template-literal
// delimited) in a source file, tolerant of escaped quote characters inside.
const STRING_LITERAL_RE =
  /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;

// A literal counts as "tailwind-token shaped" if every character in it is one
// of: letters, digits, `:`, `.`, `/`, `%`, `[`, `]`, `_`, `-`, or whitespace
// (whitespace is allowed because a single literal may contain several
// space-separated tokens, e.g. `className="flex items-center gap-4"`).
const LITERAL_SHAPE_RE = /^[a-zA-Z0-9:._/%[\]_\-\s]+$/;

/**
 * Scans ALL quoted string literals in `sourceCode` (not just simple
 * `className="..."` — also `cn("a", cond && "b")`, template literals, etc.),
 * keeps only tailwind-token-shaped literals, splits each on whitespace,
 * flattens, and dedupes.
 */
export function extractClassTokens(sourceCode: string): string[] {
  const found = new Set<string>();
  STRING_LITERAL_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = STRING_LITERAL_RE.exec(sourceCode))) {
    const literal = match[1] ?? match[2] ?? match[3] ?? "";
    if (!literal || !LITERAL_SHAPE_RE.test(literal)) continue;
    for (const token of literal.split(/\s+/)) {
      if (token) found.add(token);
    }
  }
  return Array.from(found);
}

// ---------------------------------------------------------------------------
// splitCssBySelectors — brace-depth-tracking CSS statement splitter.
// ---------------------------------------------------------------------------

interface CssStatement {
  /** Trimmed prelude text before `{` (or before the terminating `;`). */
  head: string;
  /** Raw inner content between `{`/`}` — null for a `;`-terminated statement. */
  body: string | null;
  /** The full original statement text, byte-for-byte, for verbatim re-emission. */
  raw: string;
}

/** Finds the index of the `}` matching the `{` at `openIndex`, string-aware. */
function findMatchingBrace(text: string, openIndex: number): number {
  let depth = 0;
  let i = openIndex;
  let inString: string | null = null;
  while (i < text.length) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  throw new Error("splitCssBySelectors: unbalanced braces");
}

/** Splits `text` into top-level CSS statements (brace-blocks or `;`-terminated). */
function parseTopLevelStatements(text: string): CssStatement[] {
  const statements: CssStatement[] = [];
  let i = 0;
  let start = 0;
  let inString: string | null = null;
  while (i < text.length) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "{") {
      const close = findMatchingBrace(text, i);
      const head = text.slice(start, i).trim();
      const body = text.slice(i + 1, close);
      const raw = text.slice(start, close + 1);
      statements.push({ head, body, raw });
      i = close + 1;
      start = i;
      continue;
    }
    if (ch === ";") {
      const head = text.slice(start, i).trim();
      if (head.length > 0) {
        const raw = text.slice(start, i + 1);
        statements.push({ head, body: null, raw });
      }
      i++;
      start = i;
      continue;
    }
    i++;
  }
  const remainder = text.slice(start).trim();
  if (remainder.length > 0) {
    throw new Error(
      `splitCssBySelectors: unexpected trailing content: ${remainder.slice(0, 80)}`,
    );
  }
  return statements;
}

/** Extracts+unescapes every `.class-token` present in a selector prelude. */
function extractSelectorClassTokens(selectorHead: string): string[] {
  const tokens: string[] = [];
  const re = /\.((?:\\.|[a-zA-Z0-9_-])+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(selectorHead))) {
    tokens.push(m[1].replace(/\\(.)/g, "$1"));
  }
  return tokens;
}

const ALWAYS_CRITICAL_SELECTOR_RE = /^(:root|:host|\*|html|body)\b/;

function classifyStatement(
  stmt: CssStatement,
  criticalClassNames: Set<string>,
): { critical: string; deferred: string } {
  const head = stmt.head;

  // `;`-terminated statements (`@import url(...);`, a bare `@layer name;`
  // layer-order declaration) carry no nested selectors to lose — always critical.
  if (stmt.body === null) {
    return { critical: stmt.raw, deferred: "" };
  }

  // @media(...) { ... } — recurse into inner content; re-wrap only the
  // non-empty side(s) in the SAME @media condition (Test 6).
  if (/^@media\b/.test(head)) {
    const inner = splitStatementsInternal(stmt.body, criticalClassNames);
    const critical = inner.critical.trim()
      ? `${head}{${inner.critical}}`
      : "";
    const deferred = inner.deferred.trim()
      ? `${head}{${inner.deferred}}`
      : "";
    return { critical, deferred };
  }

  // @layer <name> { ... }
  const layerMatch = /^@layer\s+([a-zA-Z0-9_-]+)/.exec(head);
  if (layerMatch) {
    const layerName = layerMatch[1];
    if (layerName === "utilities") {
      const inner = splitStatementsInternal(stmt.body, criticalClassNames);
      const critical = inner.critical.trim()
        ? `@layer utilities{${inner.critical}}`
        : "";
      const deferred = inner.deferred.trim()
        ? `@layer utilities{${inner.deferred}}`
        : "";
      return { critical, deferred };
    }
    // Any other named layer (theme, base, properties, components, or a
    // theme-author-defined custom layer) is ALWAYS-CRITICAL, appended verbatim.
    return { critical: stmt.raw, deferred: "" };
  }

  // @font-face / @keyframes / any other unrecognized at-rule with a body
  // (e.g. @property, @supports, @page) — fail-safe default: keep critical.
  if (head.startsWith("@")) {
    return { critical: stmt.raw, deferred: "" };
  }

  // :root / :host / * / html / body bare selector(s), possibly comma-separated
  // (e.g. ":root,:host") — always critical.
  const selectorParts = head.split(",").map((s) => s.trim());
  if (selectorParts.every((s) => ALWAYS_CRITICAL_SELECTOR_RE.test(s))) {
    return { critical: stmt.raw, deferred: "" };
  }

  // Leaf rule: extract every `.class` token referenced by the selector and
  // route by overlap with criticalClassNames. A selector with NO class tokens
  // at all (bare tag/id/attribute selector we don't otherwise recognize)
  // defaults to critical — safer than silently deferring unknown content.
  const classTokens = extractSelectorClassTokens(head);
  if (classTokens.length === 0) {
    return { critical: stmt.raw, deferred: "" };
  }
  const hasCriticalToken = classTokens.some((tok) => criticalClassNames.has(tok));
  return hasCriticalToken
    ? { critical: stmt.raw, deferred: "" }
    : { critical: "", deferred: stmt.raw };
}

function splitStatementsInternal(
  cssText: string,
  criticalClassNames: Set<string>,
): { critical: string; deferred: string } {
  const statements = parseTopLevelStatements(cssText);
  let critical = "";
  let deferred = "";
  for (const stmt of statements) {
    const result = classifyStatement(stmt, criticalClassNames);
    critical += result.critical;
    deferred += result.deferred;
  }
  return { critical, deferred };
}

/**
 * Partitions every top-level CSS statement in `cssText` into `critical` or
 * `deferred` based on `criticalClassNames` membership — never drops a rule
 * (Test 7). On ANY parse error (e.g. unbalanced braces), fails safe: returns
 * `{ critical: cssText, deferred: "" }` (Test 8) — everything stays critical
 * rather than a rule silently vanishing.
 */
export function splitCssBySelectors(
  cssText: string,
  criticalClassNames: Set<string>,
): { critical: string; deferred: string } {
  try {
    return splitStatementsInternal(cssText, criticalClassNames);
  } catch {
    return { critical: cssText, deferred: "" };
  }
}

// ---------------------------------------------------------------------------
// createCssSplitPlugin — the Vite plugin wiring.
// ---------------------------------------------------------------------------

/**
 * Creates the `theme-css-split` Vite plugin. `enforce: 'post'` so its
 * `generateBundle` hook observes the FINAL, already-minified `theme.bundle.css`
 * asset emitted by Vite's internal `vite:css-post` plugin — running any
 * earlier would see partial/pre-minification content or nothing at all.
 */
export function createCssSplitPlugin(options: {
  criticalSections: string[];
}): Plugin {
  let criticalClassNames = new Set<string>();

  return {
    name: "theme-css-split",
    enforce: "post",
    buildStart() {
      criticalClassNames = new Set<string>();
    },
    transform(code, id) {
      if (isCriticalModule(id, options.criticalSections)) {
        for (const token of extractClassTokens(code)) {
          criticalClassNames.add(token);
        }
      }
      return null;
    },
    generateBundle(_outputOptions, bundle) {
      try {
        const cssAsset = bundle["theme.bundle.css"];
        if (!cssAsset || cssAsset.type !== "asset") return;

        const source =
          typeof cssAsset.source === "string"
            ? cssAsset.source
            : Buffer.from(cssAsset.source).toString("utf-8");

        const { critical, deferred } = splitCssBySelectors(
          source,
          criticalClassNames,
        );

        if (!deferred || deferred.trim().length === 0) return;

        cssAsset.source = critical;
        this.emitFile({
          type: "asset",
          fileName: "theme.bundle.deferred.css",
          source: deferred,
        });
      } catch (err) {
        console.error(
          "[css-split] failed, shipping single unsplit CSS file:",
          err,
        );
      }
    },
  };
}
