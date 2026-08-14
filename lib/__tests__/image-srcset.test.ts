import { describe, expect, it } from "vitest";
// RED (Phase 11, Plan 02, Task 1): `../image-srcset` is built in this same task
// (D-01 frontend half). This suite MUST fail now (module absent) so the pure
// srcset/sizes builder has an automated gate before strapi-client.ts wires real
// Strapi `formats` data through it.
//
// Contract under test — buildSrcSet(formats, sizesHint?):
//   - orders entries ascending by width regardless of input key order
//   - never throws on null/undefined/malformed/empty input
//   - only returns srcSet/sizes keys when a srcSet was actually produced
import { buildSrcSet, resolveIntrinsicSize } from "../image-srcset";

describe("buildSrcSet — pure srcset/sizes builder (D-01)", () => {
  it("Test 1: builds an ascending-by-width srcSet + default 100vw sizes, regardless of input key order", () => {
    const formats = {
      large: { url: "/l.jpg", width: 1000 },
      thumbnail: { url: "/t.jpg", width: 245 },
      medium: { url: "/m.jpg", width: 750 },
      small: { url: "/s.jpg", width: 500 },
    };
    expect(buildSrcSet(formats)).toEqual({
      srcSet: "/t.jpg 245w, /s.jpg 500w, /m.jpg 750w, /l.jpg 1000w",
      sizes: "100vw",
    });
  });

  it("Test 2: returns {} for null/undefined formats — never throws, never undefined-valued keys", () => {
    expect(buildSrcSet(null)).toEqual({});
    expect(buildSrcSet(undefined)).toEqual({});
    expect(Object.keys(buildSrcSet(null))).toHaveLength(0);
    expect(Object.keys(buildSrcSet(undefined))).toHaveLength(0);
  });

  it("Test 3: skips a format entry missing width, keeps other valid entries", () => {
    const formats = {
      webp: { url: "/w.webp" },
      small: { url: "/s.jpg", width: 500 },
    };
    expect(buildSrcSet(formats)).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "100vw",
    });
  });

  it("Test 4: skips a format entry with a non-string url", () => {
    // Deliberately malformed for the defensive test (e.g. bad upstream data) —
    // cast bypasses the compile-time type since buildSrcSet must survive this at
    // runtime regardless of what TypeScript would otherwise forbid.
    const formats = {
      broken: { url: 12345, width: 300 },
      small: { url: "/s.jpg", width: 500 },
    } as unknown as Parameters<typeof buildSrcSet>[0];
    expect(buildSrcSet(formats)).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "100vw",
    });
  });

  it("Test 5: honors a sizesHint override instead of the 100vw default", () => {
    const formats = { small: { url: "/s.jpg", width: 500 } };
    expect(buildSrcSet(formats, "200px")).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "200px",
    });
  });

  it("Test 6: returns {} for an empty formats object — nothing to offer", () => {
    expect(buildSrcSet({})).toEqual({});
    expect(Object.keys(buildSrcSet({}))).toHaveLength(0);
  });

  // Debug session 2026-08-14 (image-quality-perf-regression): the `large`
  // Strapi format caps out at the configured breakpoint (1000px by default),
  // which is smaller than the display width on most desktop/retina
  // viewports for a full-bleed (100vw) image — the browser upscales the
  // capped candidate and the image renders blurry. Folding the true
  // original in as one more descriptor removes that ceiling.
  it("Test 7: includes the original as the largest srcset candidate when provided", () => {
    const formats = {
      large: { url: "/l.jpg", width: 1000 },
      small: { url: "/s.jpg", width: 500 },
    };
    expect(
      buildSrcSet(formats, "100vw", { url: "/original.jpg", width: 3840 })
    ).toEqual({
      srcSet: "/s.jpg 500w, /l.jpg 1000w, /original.jpg 3840w",
      sizes: "100vw",
    });
  });

  it("Test 8: original alone (no formats) produces NO srcSet", () => {
    // There is no ladder to extend, so there is nothing to cap: the browser
    // falls back to `src`, which is already the full-resolution original.
    // Emitting a one-candidate srcset would add no information and would put a
    // srcset on logos/small uploads that never carried one — the theme's
    // sections-chrome tests pin exactly that for SiteHeader/Footer logos.
    expect(buildSrcSet(null, "100vw", { url: "/original.jpg", width: 3840 })).toEqual(
      {}
    );
    expect(buildSrcSet({}, "100vw", { url: "/original.jpg", width: 3840 })).toEqual(
      {}
    );
  });

  it("Test 9: ignores a malformed original (missing/zero/negative width, blank url) without throwing", () => {
    const formats = { small: { url: "/s.jpg", width: 500 } };
    const expected = { srcSet: "/s.jpg 500w", sizes: "100vw" };
    expect(
      buildSrcSet(formats, "100vw", { url: "/original.jpg", width: 0 })
    ).toEqual(expected);
    expect(
      buildSrcSet(formats, "100vw", {
        url: "/original.jpg",
        width: -10,
      })
    ).toEqual(expected);
    // A blank url would otherwise emit a structurally broken " 900w" descriptor.
    expect(buildSrcSet(formats, "100vw", { url: "", width: 900 })).toEqual(expected);
    expect(buildSrcSet(formats, "100vw", null)).toEqual(expected);
  });

  it("Test 10: de-dups when the original's width collides with an existing format width", () => {
    const formats = { large: { url: "/l.jpg", width: 1000 } };
    // Same width as the `large` format — original wins the slot (pushed last
    // in candidate order, format entries are filtered first).
    expect(
      buildSrcSet(formats, "100vw", { url: "/original.jpg", width: 1000 })
    ).toEqual({ srcSet: "/l.jpg 1000w", sizes: "100vw" });
  });
});

// Phase 18 (item 12): the intrinsic-size half of the same theme-facing image
// contract buildSrcSet belongs to.
describe("resolveIntrinsicSize", () => {
  it("prefers the file's own width/height — the only authoritative source", () => {
    expect(
      resolveIntrinsicSize({
        width: 1600,
        height: 900,
        formats: { large: { url: "/l.jpg", width: 1000, height: 562 } },
      })
    ).toEqual({ width: 1600, height: 900 });
  });

  it("falls back to the LARGEST format variant when the file has no dimensions", () => {
    expect(
      resolveIntrinsicSize({
        formats: {
          thumbnail: { url: "/t.jpg", width: 245, height: 138 },
          large: { url: "/l.jpg", width: 1000, height: 562 },
          medium: { url: "/m.jpg", width: 750, height: 422 },
        },
      })
    ).toEqual({ width: 1000, height: 562 });
  });

  it("returns null rather than a half pair when only one dimension is known", () => {
    expect(resolveIntrinsicSize({ width: 1600 })).toBeNull();
    expect(resolveIntrinsicSize({ height: 900 })).toBeNull();
  });

  it("returns null when a format variant has a width but no height", () => {
    expect(
      resolveIntrinsicSize({ formats: { large: { url: "/l.jpg", width: 1000 } } })
    ).toBeNull();
  });

  it("rejects zero, negative and non-finite dimensions", () => {
    expect(resolveIntrinsicSize({ width: 0, height: 100 })).toBeNull();
    expect(resolveIntrinsicSize({ width: -10, height: 100 })).toBeNull();
    expect(resolveIntrinsicSize({ width: Number.NaN, height: 100 })).toBeNull();
    expect(resolveIntrinsicSize({ width: Infinity, height: 100 })).toBeNull();
  });

  it("never throws and returns null for nullish/malformed input", () => {
    expect(resolveIntrinsicSize(null)).toBeNull();
    expect(resolveIntrinsicSize(undefined)).toBeNull();
    expect(resolveIntrinsicSize({})).toBeNull();
    expect(resolveIntrinsicSize({ formats: null })).toBeNull();
    expect(
      resolveIntrinsicSize({ formats: "nope" as unknown as null })
    ).toBeNull();
  });
});
