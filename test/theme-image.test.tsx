import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

// RED (Phase 17, Plan 11, Task 2): `../src/lib/theme-image` is built in this
// same task (the full-bleed image seam, the counterpart to the existing
// boxed `ImageGuard`). This suite MUST fail now (module absent) so the seam
// has an automated gate before Task 3 converts every full-bleed/custom-
// positioned render path to it.
//
// Contract under test (ThemeImage):
//   - formats with 2+ usable entries -> a real srcSet (ascending by width)
//     and the caller's sizesHint.
//   - formats with exactly 1 usable entry -> a one-descriptor srcSet, sizes
//     still set (a single-variant image is a valid narrow case, not empty).
//   - null/undefined/empty/all-unusable formats -> NEITHER attribute is
//     present (checked via attribute absence, not empty-string equality).
//   - null/empty url -> the caller's placeholder, no <img> at all.
//   - intrinsic width/height pass through when present.
//   - positioning="fill" (default): absolute inset-0 h-full w-full
//     object-cover base; positioning="custom": no base classes at all.
//   - priority flag: eager + fetchPriority=high when true, lazy otherwise.
import { ThemeImage } from "@/lib/theme-image";

describe("ThemeImage — the full-bleed/custom-positioned image seam (Phase 17 Plan 11)", () => {
  it("Test 1: renders a real srcSet (ascending by width) + the caller's sizesHint when formats has 2+ usable entries", () => {
    const html = renderToStaticMarkup(
      <ThemeImage
        url="https://e/x.jpg"
        formats={{
          large: { url: "https://e/x-large.jpg", width: 1000 },
          thumbnail: { url: "https://e/x-thumb.jpg", width: 245 },
        }}
        sizesHint="50vw"
      />,
    );
    // React 19's renderToStaticMarkup emits the literal `srcSet` prop casing.
    expect(html).toMatch(/srcset="https:\/\/e\/x-thumb\.jpg 245w, https:\/\/e\/x-large\.jpg 1000w"/i);
    expect(html).toContain('sizes="50vw"');
  });

  it("Test 2: a single usable formats entry still yields a one-descriptor srcSet and a set sizes", () => {
    const html = renderToStaticMarkup(
      <ThemeImage
        url="https://e/x.jpg"
        formats={{ small: { url: "https://e/x-small.jpg", width: 500 } }}
        sizesHint="200px"
      />,
    );
    expect(html).toMatch(/srcset="https:\/\/e\/x-small\.jpg 500w"/i);
    expect(html).toContain('sizes="200px"');
  });

  it("Test 3: null formats emits neither srcset nor sizes (attribute absence, not empty string)", () => {
    const html = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" formats={null} sizesHint="100vw" />,
    );
    expect(html).not.toMatch(/srcset=/i);
    expect(html).not.toMatch(/\bsizes=/i);
  });

  it("Test 3b: an empty formats object emits neither srcset nor sizes", () => {
    const html = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" formats={{}} sizesHint="100vw" />,
    );
    expect(html).not.toMatch(/srcset=/i);
    expect(html).not.toMatch(/\bsizes=/i);
  });

  it("Test 3c: a formats object whose only entry lacks a numeric width emits neither attribute", () => {
    const html = renderToStaticMarkup(
      <ThemeImage
        url="https://e/x.jpg"
        formats={{ webp: { url: "https://e/x.webp" } as never }}
        sizesHint="100vw"
      />,
    );
    expect(html).not.toMatch(/srcset=/i);
    expect(html).not.toMatch(/\bsizes=/i);
  });

  it("Test 4: a null url renders the caller's placeholder and no <img> element at all", () => {
    const html = renderToStaticMarkup(
      <ThemeImage
        url={null}
        sizesHint="100vw"
        placeholder={<div data-testid="placeholder">Agrega una imagen</div>}
      />,
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("Agrega una imagen");
  });

  it("Test 4b: an absent url with no placeholder renders nothing (never a broken <img>)", () => {
    const html = renderToStaticMarkup(<ThemeImage sizesHint="100vw" />);
    expect(html).not.toContain("<img");
  });

  it("Test 5: intrinsic width/height pass through when present", () => {
    const html = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" width={800} height={600} sizesHint="100vw" />,
    );
    expect(html).toContain('width="800"');
    expect(html).toContain('height="600"');
  });

  it("Test 6: positioning=\"fill\" (default) renders the shared full-bleed object-cover base, with className appended", () => {
    const html = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" sizesHint="100vw" className="rounded-2xl" />,
    );
    expect(html).toContain("absolute inset-0 h-full w-full object-cover rounded-2xl");
  });

  it("Test 6b: objectFit=\"contain\" swaps the object-fit class in fill mode", () => {
    const html = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" sizesHint="100vw" objectFit="contain" />,
    );
    expect(html).toContain("object-contain");
    expect(html).not.toContain("object-cover");
  });

  it("Test 7: positioning=\"custom\" emits ONLY the caller's className/style — no base classes at all", () => {
    const html = renderToStaticMarkup(
      <ThemeImage
        url="https://e/x.jpg"
        sizesHint="200px"
        positioning="custom"
        className="h-10 w-auto object-contain"
        style={{ opacity: 0.5 }}
      />,
    );
    expect(html).toContain('class="h-10 w-auto object-contain"');
    expect(html).not.toContain("inset-0");
    expect(html).toContain("opacity:0.5");
  });

  it("Test 8: priority=true renders eager loading + fetchPriority=high; default is lazy + async decoding", () => {
    const eagerHtml = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" sizesHint="100vw" priority />,
    );
    expect(eagerHtml).toContain('loading="eager"');
    expect(eagerHtml).toMatch(/fetchpriority="high"/i);

    const lazyHtml = renderToStaticMarkup(
      <ThemeImage url="https://e/x.jpg" sizesHint="100vw" />,
    );
    expect(lazyHtml).toContain('loading="lazy"');
    expect(lazyHtml).toContain('decoding="async"');
    expect(lazyHtml).not.toMatch(/fetchpriority/i);
  });

  it("Test 9: reuses buildSrcSet — never hardcodes a format key set (grep-verified in acceptance criteria too)", () => {
    // A future 'avif' key, never mentioned anywhere in this seam's source,
    // is still picked up automatically because ThemeImage delegates entirely
    // to buildSrcSet's key-agnostic iteration.
    const html = renderToStaticMarkup(
      <ThemeImage
        url="https://e/x.jpg"
        formats={{ avif: { url: "https://e/x.avif", width: 900 } }}
        sizesHint="100vw"
      />,
    );
    expect(html).toMatch(/srcset="https:\/\/e\/x\.avif 900w"/i);
  });
});
