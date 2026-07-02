import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

import { sectionsComponents } from "@/registry";

// ---------------------------------------------------------------------------
// Registry-driven cross-section static audit (QA-06, D-01).
//
// This is the SINGLE source of truth for the "coordinate-free / hex-free /
// overflow-free" rule across every registered section. It iterates the LIVE
// registry (Object.keys(sectionsComponents)) rather than a hardcoded path list,
// so any future section auto-enrolls with zero per-name maintenance — add a
// section to the registry and it is instantly under this guard.
//
// It reads component SOURCE TEXT (like test/richtext-sink-audit.test.ts), not
// rendered HTML: a source scan catches forbidden class strings that never reach
// a given render branch. It COMPLEMENTS — does NOT replace — the narrower
// per-section rendered-className assertions in test/sections-*.test.tsx (those
// pin a stronger "this specific section must never emit `absolute` at all"
// invariant; they draw dividers on the wrapper). Reconcile, do not delete guards.
//
// SCOPE (deliberately precise — see 10-RESEARCH.md § Pattern 1 / Pitfall 1):
//   The forbidden thing is Figma-export BRACKETED PIXEL COORDINATES
//   (`left-[247px]`), oversized fixed widths, `w-screen`/`100vw`, and hex
//   literals — all grep-verified absent today, so this audit is GREEN on the
//   unmodified src/ tree on first run. A red first run signals a mis-scoped
//   pattern, NOT a real violation.
//
//   We intentionally do NOT ban bare Tailwind-scale `absolute` positioning:
//   five shipped sections (Hero carousel arrows, SiteHeader mobile dropdown,
//   Sucursales map overlay, BlogList featured badge, and `absolute inset-0`
//   overlays) use it legitimately and would red-line on day one.
//
//   We also do NOT add a blanket `h-[` ban: `h-[` appears on non-text elements
//   (search bars, logo, map iframe, carousel container). Per RESEARCH open
//   question A3, "fixed h-[ on text" is DEFERRED to the UAT checklist and the
//   per-section render tests (a regex cannot reliably tell a heading from a
//   search bar). It is intentionally omitted from this automated audit.
// ---------------------------------------------------------------------------

// Map a kebab-case registry key to its PascalCase source file. VERIFIED against
// all section dirs: every key resolves to src/sections/<Pascal>/<Pascal>.tsx
// (e.g. "nosotros-hero" -> NosotrosHero). A missing file makes readFileSync
// throw — a FEATURE that also pins the PascalCase naming convention.
const keyToSource = (key: string): string => {
  const pascal = key
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");
  return resolve(__dirname, `../src/sections/${pascal}/${pascal}.tsx`);
};

// MANDATORY comment-strip BEFORE scanning. The codebase's OWN comments explain
// the convention using the forbidden words ("absolute coordinates", "no hex
// literals") — a raw scan would false-positive on the very prose documenting
// the rule. Strip block comments then line comments.
const strip = (code: string): string =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

// The four precisely-scoped forbidden patterns. ALL pass clean on the current
// tree (grep-verified 0/0/0/0). Exact regexes from 10-RESEARCH.md § Pattern 1.
const FORBIDDEN: Array<{ name: string; re: RegExp }> = [
  // 1. Figma-export bracketed pixel offset — the actual anti-pattern.
  { name: "bracketed positional offset", re: /\b(left|top|right|bottom)-\[/ },
  // 2. Oversized fixed width that breaks mobile — 4+ digit px. Small boxes
  //    (w-[140px]) and max-w-[500px] are allowed.
  { name: "oversized fixed width", re: /\bw-\[\d{4,}px\]/ },
  // 3. Full-viewport width — a horizontal-overflow source.
  { name: "viewport width", re: /\bw-screen\b|100vw/ },
  // 4. Hex color literal in a component — brand color flows through tokens only.
  { name: "hex color literal", re: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/ },
];

describe("static audit — every registered section is coordinate-free & hex-free (QA-06, D-01)", () => {
  it.each(Object.keys(sectionsComponents))(
    "section %s has no bracketed offset / oversized width / viewport width / hex literal",
    (key) => {
      const code = strip(readFileSync(keyToSource(key), "utf-8"));
      for (const { name, re } of FORBIDDEN) {
        expect(code, `${key}: ${name}`).not.toMatch(re);
      }
    },
  );
});
