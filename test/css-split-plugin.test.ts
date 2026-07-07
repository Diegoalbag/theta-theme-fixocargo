import { describe, expect, it } from "vitest";
// Phase 11, Plan 05, Task 1 (D-05/D-06/D-07): pure CSS-split logic that backs
// the `theme-css-split` Vite plugin (vite-plugins/css-split.ts). These
// functions are framework-free (no fs/vite/rollup) so they are fully
// unit-testable in isolation from an actual Vite build.
import {
  kebabToPascalCase,
  isCriticalModule,
  extractClassTokens,
  splitCssBySelectors,
} from "../vite-plugins/css-split";

describe("kebabToPascalCase", () => {
  it("Test 1: converts kebab-case section/block keys to their PascalCase directory name", () => {
    expect(kebabToPascalCase("site-header")).toBe("SiteHeader");
    expect(kebabToPascalCase("hero-slide")).toBe("HeroSlide");
    expect(kebabToPascalCase("hero")).toBe("Hero");
  });
});

describe("isCriticalModule", () => {
  const criticalSections = ["site-header", "hero", "hero-slide"];

  it("Test 2: a section/block module under a critical key is critical; others are not; src/index.css is always critical", () => {
    expect(
      isCriticalModule(
        "/repo/src/sections/SiteHeader/SiteHeader.tsx",
        criticalSections,
      ),
    ).toBe(true);
    expect(
      isCriticalModule(
        "/repo/src/blocks/HeroSlide/HeroSlide.tsx",
        criticalSections,
      ),
    ).toBe(true);
    expect(
      isCriticalModule(
        "/repo/src/sections/Footer/Footer.tsx",
        criticalSections,
      ),
    ).toBe(false);
    expect(isCriticalModule("/repo/src/index.css", [])).toBe(true);
    expect(isCriticalModule("/repo/src/index.css", criticalSections)).toBe(
      true,
    );
  });
});

describe("extractClassTokens", () => {
  it("Test 3: extracts tailwind-shaped tokens from every quoted string literal, split on whitespace", () => {
    expect(
      extractClassTokens('className="flex items-center gap-4"'),
    ).toEqual(["flex", "items-center", "gap-4"]);

    const cnCall =
      'className={cn("bg-brand-navy", condition && "text-white")}';
    const tokens = extractClassTokens(cnCall);
    expect(tokens).toContain("bg-brand-navy");
    expect(tokens).toContain("text-white");

    expect(extractClassTokens("const x = 5; function noop() {}")).toEqual(
      [],
    );
  });
});

describe("splitCssBySelectors", () => {
  it("Test 4: partitions flat rules by criticalClassNames membership", () => {
    const css = ".header-rule{color:red}.hero-rule{color:blue}.footer-rule{color:green}";
    const { critical, deferred } = splitCssBySelectors(
      css,
      new Set(["header-rule", "hero-rule"]),
    );
    expect(critical).toContain(".header-rule");
    expect(critical).toContain(".hero-rule");
    expect(critical).not.toContain(".footer-rule");
    expect(deferred).toContain(".footer-rule");
    expect(deferred).not.toContain(".header-rule");
    expect(deferred).not.toContain(".hero-rule");
  });

  it("Test 5: :root and @font-face are always critical regardless of criticalClassNames", () => {
    const css =
      ':root{--x:1}@font-face{font-family:"X";src:url(x.woff2)}.footer-rule{color:green}';
    const { critical, deferred } = splitCssBySelectors(css, new Set());
    expect(critical).toContain(":root{--x:1}");
    expect(critical).toContain('@font-face{font-family:"X";src:url(x.woff2)}');
    expect(deferred).not.toContain(":root");
    expect(deferred).not.toContain("@font-face");
  });

  it("Test 6: an entire @media block is re-wrapped in the same condition when its rule is not critical", () => {
    const css =
      "@media (min-width:768px){.md\\:footer-rule{display:flex}}";
    const { critical, deferred } = splitCssBySelectors(css, new Set());
    expect(deferred).toBe(
      "@media (min-width:768px){.md\\:footer-rule{display:flex}}",
    );
    expect(critical).toBe("");
  });

  it("Test 7: exhaustive partition — every selector lands in exactly one output, never both/neither", () => {
    const css =
      ".header-rule{color:red}.hero-rule{color:blue}.footer-rule{color:green}:root{--x:1}@media (min-width:768px){.md\\:footer-rule{display:flex}}";
    const { critical, deferred } = splitCssBySelectors(
      css,
      new Set(["header-rule", "hero-rule"]),
    );
    const combined = critical + deferred;
    for (const selector of [
      ".header-rule",
      ".hero-rule",
      ".footer-rule",
      ":root",
      ".md\\:footer-rule",
    ]) {
      expect(combined).toContain(selector);
    }
  });

  it("Test 8: malformed input (unbalanced braces) fails safe — everything stays critical", () => {
    const malformed = ".header-rule{color:red";
    const { critical, deferred } = splitCssBySelectors(malformed, new Set());
    expect(critical).toBe(malformed);
    expect(deferred).toBe("");
  });

  it("regression: Tailwind's backslash-escaped quote chars in a selector (e.g. content-[''] arbitrary values) never toggle string-tracking state", () => {
    // Real Tailwind v4 output: .marker\:content-\[\'\'\] ::marker{--tw-content:""}
    // followed by an unrelated rule — the escaped `\'` chars inside the
    // selector must NOT be mistaken for CSS string delimiters, or the parser
    // loses brace-depth sync for the rest of the file (production bug found
    // building theta-theme-fixocargo — fails safe to single-critical-file
    // instead of throwing, but must actually split correctly).
    const css =
      ".marker\\:content-\\[\\'\\'\\]::marker{--tw-content:\"\"}.footer-rule{color:green}";
    const { critical, deferred } = splitCssBySelectors(css, new Set());
    expect(deferred).toContain(".footer-rule");
    expect(critical).not.toBe(css); // must NOT have fallen back to the fail-safe (which would equal the full input)
  });
});
