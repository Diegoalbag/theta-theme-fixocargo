import { describe, it, expect } from "vitest";

import { safeAnchorId } from "@/lib/safe-anchor";

// safeAnchorId is the theme's guard for merchant-supplied fragment identifiers
// (quick task 260814-a07 — FAQ deep links).
//
// The contract has three halves and all three matter:
//
//   1. BACK-COMPAT. A blank / absent / whitespace-only anchor must return
//      `undefined`, NOT `""`. React omits an attribute whose value is
//      `undefined` but happily emits `id=""` for an empty string, so this
//      return type is the exact mechanism that keeps every already-saved
//      faq-item byte-identical to today.
//
//   2. ALLOWLIST. Every non-undefined return matches /^[a-z0-9_-]{1,64}$/.
//      Not a denylist and not an escaper: the point is that the surviving
//      value is provably well-formed, which is what makes a selector-free
//      design possible in the first place.
//
//   3. IDEMPOTENCE. The block compares a normalized URL fragment against a
//      normalized merchant setting. That comparison is only sound if
//      normalizing an already-normalized value is a no-op.

const FIXTURES = [
  undefined,
  "",
  "   ",
  "q4",
  "#q4",
  "  Q4  ",
  "Envío Rápido",
  "a   b",
  "--q4--",
  "!!!",
  "---",
  '"><img src=x onerror=alert(1)>',
  "#  Envío 4 ",
  "a".repeat(200),
];

describe("safeAnchorId — values that survive to nothing", () => {
  it("returns undefined (never an empty string) for blank input", () => {
    // `undefined` rather than `""` is REQUIRED: it is what makes React drop
    // the id attribute entirely instead of rendering id="".
    expect(safeAnchorId(undefined)).toBeUndefined();
    expect(safeAnchorId("")).toBeUndefined();
    expect(safeAnchorId("   ")).toBeUndefined();
  });

  it("returns undefined when nothing survives the allowlist", () => {
    expect(safeAnchorId("!!!")).toBeUndefined();
    expect(safeAnchorId("---")).toBeUndefined();
    expect(safeAnchorId("#")).toBeUndefined();
    expect(safeAnchorId("   ¿?  ")).toBeUndefined();
  });
});

describe("safeAnchorId — normalization", () => {
  it("passes an already-clean value straight through", () => {
    expect(safeAnchorId("q4")).toBe("q4");
    expect(safeAnchorId("envio-express_2")).toBe("envio-express_2");
  });

  it("strips a leading fragment marker (merchants paste what they see)", () => {
    expect(safeAnchorId("#q4")).toBe("q4");
    expect(safeAnchorId("#  Envío 4 ")).toBe("envio-4");
  });

  it("trims and lowercases", () => {
    expect(safeAnchorId("  Q4  ")).toBe("q4");
    expect(safeAnchorId("PREGUNTA")).toBe("pregunta");
  });

  it("folds Spanish accents instead of dropping the letter", () => {
    // NFD splits the accented character into base letter + combining mark and
    // the combining-marks range is stripped — same idiom as the `fold` helper
    // in src/sections/Sucursales/Sucursales.tsx.
    expect(safeAnchorId("Envío Rápido")).toBe("envio-rapido");
    expect(safeAnchorId("Añadir")).toBe("anadir");
  });

  it("collapses a RUN of disallowed characters to a single dash", () => {
    expect(safeAnchorId("a   b")).toBe("a-b");
    expect(safeAnchorId("a // ? b")).toBe("a-b");
  });

  it("trims dashes off both edges of the result", () => {
    expect(safeAnchorId("--q4--")).toBe("q4");
    expect(safeAnchorId(" ??? q4 ??? ")).toBe("q4");
  });
});

describe("safeAnchorId — the allowlist is the guarantee", () => {
  it("lets no quote, angle bracket or space through", () => {
    const out = safeAnchorId('"><img src=x onerror=alert(1)>');
    expect(out).toBeDefined();
    expect(out).toMatch(/^[a-z0-9_-]+$/);
    expect(out).not.toContain('"');
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain(" ");
  });

  it("caps the result at 64 characters", () => {
    expect(safeAnchorId("a".repeat(200))).toHaveLength(64);
    // A cap that lands mid-run must not leave a trailing dash behind.
    expect(safeAnchorId(`${"a".repeat(63)} bcdef`)).toBe("a".repeat(63));
  });

  it("every non-undefined return matches /^[a-z0-9_-]{1,64}$/", () => {
    for (const fixture of FIXTURES) {
      const out = safeAnchorId(fixture);
      if (out !== undefined) expect(out).toMatch(/^[a-z0-9_-]{1,64}$/);
    }
  });
});

describe("safeAnchorId — idempotence", () => {
  it("is idempotent: normalize(normalize(x)) === normalize(x)", () => {
    // Not decoration. The faq-item block compares a normalized location.hash
    // against its normalized `anchorId` prop; if normalizing twice moved the
    // value, that comparison would silently stop matching.
    for (const fixture of FIXTURES) {
      const once = safeAnchorId(fixture);
      expect(safeAnchorId(once)).toBe(once);
    }
  });
});
