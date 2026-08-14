import { describe, expect, it } from "vitest";
// RED (Phase 11, Plan 04, Task 1): `../src/lib/image-srcset` is built in this
// same task (D-01 theme-side half — this repo's own independent copy, cannot
// import across the repo boundary from templates/theme-site's Plan-02
// equivalent). This suite MUST fail now (module absent) so the pure
// srcset/sizes builder has an automated gate before ImageGuard/SiteHeader/
// Footer/HeroSlide wire it in (Tasks 2-3).
//
// Contract under test — buildSrcSet(formats, sizesHint?):
//   - orders entries ascending by width regardless of input key order
//   - never throws on null/undefined/malformed/empty input
//   - only returns srcSet/sizes keys when a srcSet was actually produced
import { buildSrcSet } from "@/lib/image-srcset";

describe("buildSrcSet — pure srcset/sizes builder (D-01)", () => {
  it("Test 1: builds an ascending-by-width srcSet + default 100vw sizes, regardless of input key order", () => {
    const formats = {
      large: { url: "/l.jpg", width: 1000 },
      thumbnail: { url: "/t.jpg", width: 245 },
    };
    expect(buildSrcSet(formats)).toEqual({
      srcSet: "/t.jpg 245w, /l.jpg 1000w",
      sizes: "100vw",
    });
  });

  it("Test 2: returns {} for null/undefined/empty formats — never throws, never undefined-valued keys", () => {
    expect(buildSrcSet(null)).toEqual({});
    expect(buildSrcSet(undefined)).toEqual({});
    expect(buildSrcSet({})).toEqual({});
    expect(Object.keys(buildSrcSet(null))).toHaveLength(0);
    expect(Object.keys(buildSrcSet(undefined))).toHaveLength(0);
    expect(Object.keys(buildSrcSet({}))).toHaveLength(0);
  });

  it("Test 3: skips an entry missing width or with a non-string url, keeps other valid entries", () => {
    const missingWidth = {
      webp: { url: "/w.webp" },
      small: { url: "/s.jpg", width: 500 },
    };
    expect(buildSrcSet(missingWidth)).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "100vw",
    });

    const badUrl = {
      broken: { url: 12345, width: 300 },
      small: { url: "/s.jpg", width: 500 },
    } as unknown as Parameters<typeof buildSrcSet>[0];
    expect(buildSrcSet(badUrl)).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "100vw",
    });
  });

  it("Test 4: honors a sizesHint override instead of the 100vw default", () => {
    const formats = { small: { url: "/s.jpg", width: 500 } };
    expect(buildSrcSet(formats, "200px")).toEqual({
      srcSet: "/s.jpg 500w",
      sizes: "200px",
    });
  });

  // Test 5-9 (debug session 2026-08-14): the original as a srcset candidate.
  // Without it the ladder is capped at Strapi's largest generated breakpoint
  // and every full-bleed image is CSS-upscaled on a wider viewport.
  it("Test 5: appends the original above the largest generated format", () => {
    const formats = {
      large: { url: "/l.jpg", width: 1000 },
      small: { url: "/s.jpg", width: 500 },
    };
    expect(buildSrcSet(formats, "100vw", { url: "/orig.jpg", width: 3840 })).toEqual({
      srcSet: "/s.jpg 500w, /l.jpg 1000w, /orig.jpg 3840w",
      sizes: "100vw",
    });
  });

  it("Test 6: de-duplicates when the original's width matches a generated format", () => {
    // srcset requires unique width descriptors; a duplicate is invalid markup.
    const formats = { large: { url: "/l.jpg", width: 1000 } };
    expect(buildSrcSet(formats, "100vw", { url: "/orig.jpg", width: 1000 })).toEqual({
      srcSet: "/l.jpg 1000w",
      sizes: "100vw",
    });
  });

  it("Test 7: emits NO srcSet from the original alone when there are no formats", () => {
    // Nothing to cap without a generated ladder — the browser falls back to
    // `src`, which is already the full-resolution original. Emitting a
    // one-candidate srcset would add no information and would put a srcset on
    // logos/small uploads that never had one (see sections-chrome.test.tsx).
    expect(buildSrcSet(null, "100vw", { url: "/orig.jpg", width: 800 })).toEqual({});
    expect(buildSrcSet({}, "100vw", { url: "/orig.jpg", width: 800 })).toEqual({});
  });

  it("Test 8: ignores a malformed original rather than emitting a broken candidate", () => {
    const formats = { small: { url: "/s.jpg", width: 500 } };
    const expected = { srcSet: "/s.jpg 500w", sizes: "100vw" };
    for (const bad of [
      { url: "/o.jpg", width: 0 },
      { url: "/o.jpg", width: -1 },
      { url: "/o.jpg", width: Number.NaN },
      { url: "", width: 900 },
    ]) {
      expect(
        buildSrcSet(formats, "100vw", bad as unknown as Parameters<typeof buildSrcSet>[2]),
      ).toEqual(expected);
    }
  });

  it("Test 9: omitting the original preserves the previous behavior exactly", () => {
    // The third argument is optional — every pre-existing call site must be
    // byte-identical in output.
    const formats = {
      large: { url: "/l.jpg", width: 1000 },
      thumbnail: { url: "/t.jpg", width: 245 },
    };
    expect(buildSrcSet(formats)).toEqual(buildSrcSet(formats, "100vw", null));
  });
});
