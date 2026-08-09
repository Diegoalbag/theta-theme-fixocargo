import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";

// Source-level gate (Phase 17 Plan 11 Task 3, PERF-03): the 2026-08-08 live
// measurement found nine of twelve render paths writing a bare `<img>`
// element directly, bypassing `buildSrcSet` even though it was already
// available and already called from three other paths — the theme shipped
// zero responsive images because the convention was only documented, never
// enforced. This test is the enforcement: every image render path must go
// through one of the two shared seams (`ThemeImage` / `ImageGuard`, both
// under `src/lib/`), so a new bare `<img>` written into a section or block
// fails this suite immediately, the same way `test/static-audit.test.tsx`
// enforces the coordinate-free/hex-free convention.
//
// Mirrors `test/static-audit.test.tsx`'s structure: read component SOURCE
// TEXT (not rendered HTML — a source scan catches every render branch, not
// just the one a given prop combination happens to hit), strip comments
// first (this repo's own comments legitimately use the word "<img>" in
// prose explaining the convention), then regex-match the stripped source.
//
// Scope: every `.tsx` file under `src/sections/` and `src/blocks/` — a
// directory walk, not the registry (`sectionsComponents`/`blocksComponents`
// only lists top-level registrations; several converted files here are
// section-local blocks, e.g. `HeroSlide`/`PromoBanner`, that never appear in
// either registry map directly). `src/lib/theme-image.tsx` and
// `src/lib/image-guard.tsx` are the only two files in this theme allowed to
// contain a raw `<img` element — they are outside this scan's scope by
// construction (it never walks `src/lib/`).

const ROOTS = ["src/sections", "src/blocks"];

const strip = (code: string): string =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

function walkTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkTsxFiles(full));
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

const files = ROOTS.flatMap((root) => walkTsxFiles(resolve(__dirname, "..", root)));

describe("no-bare-img — every section/block routes images through the shared seams (PERF-03, Phase 17 Plan 11)", () => {
  it(`found at least 11 .tsx files to scan under ${ROOTS.join(", ")} (sanity check on the walker itself)`, () => {
    expect(files.length).toBeGreaterThanOrEqual(11);
  });

  it.each(files.map((f) => [f.replace(resolve(__dirname, ".."), ""), f] as const))(
    "%s has no raw <img> element (must use ThemeImage or ImageGuard from @/lib)",
    (_relative, file) => {
      const code = strip(readFileSync(file, "utf-8"));
      expect(code, `${file}: contains a raw <img element — route it through ThemeImage or ImageGuard instead`).not.toMatch(/<img\b/);
    },
  );
});
