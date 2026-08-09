import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/**
 * Build-output weight test (Phase 17-09, PERF-01).
 *
 * MEASURED BEFORE-STATE (theta-theme-fixocargo, pre-fix, 2026-08-09):
 *   dist/theme.bundle.css was 394,462 B uncompressed, of which 322,225 B
 *   (81.7%) was seven base64-inlined font payloads (@font-face src urls with
 *   a `data:font/...;base64,` scheme) and only 72,237 B was actual CSS.
 *   Compressed: 202,951 B gzip / 182,158 B brotli.
 *
 * MECHANISM: the theme's vite.config.ts sets `build.lib`, and Vite documents
 * that when `build.lib` is present `build.assetsInlineLimit` is ignored —
 * every asset Vite's pipeline sees is inlined regardless of size. The seven
 * font files referenced by relative `src: url("./fonts/...")` paths in
 * src/index.css were therefore embedded directly in the render-blocking
 * stylesheet the browser must parse before it can paint.
 *
 * THE FIX: move the referenced font files into the Vite `public/` directory
 * (copied verbatim into dist/, never rewritten by Vite's asset pipeline) and
 * rewrite the `@font-face` `src` values to root-absolute `/fonts/<file>`
 * paths. This test is what stops a future change from putting them back —
 * it fails on any re-inlined font payload or on a stylesheet-weight
 * regression.
 */

const DIST_CSS_PATH = path.resolve(__dirname, "..", "dist", "theme.bundle.css");
const DIST_FONTS_DIR = path.resolve(__dirname, "..", "dist", "fonts");

const UNCOMPRESSED_CEILING = 100_000;
const BROTLI_CEILING = 40_000;

function loadCss(): string {
  return fs.readFileSync(DIST_CSS_PATH, "utf-8");
}

describe("critical CSS weight (PERF-01, theta-theme-fixocargo)", () => {
  it("contains no base64-inlined font payload", () => {
    const css = loadCss();
    const urlMatches = css.match(/url\(([^)]*)\)/g) ?? [];
    const base64FontUrls = urlMatches.filter((u) =>
      /^url\(\s*['"]?data:font/i.test(u),
    );
    expect(base64FontUrls).toHaveLength(0);
  });

  it("is under the 100,000 B uncompressed ceiling (was 394,462 B)", () => {
    const bytes = fs.statSync(DIST_CSS_PATH).size;
    expect(bytes).toBeLessThan(UNCOMPRESSED_CEILING);
  });

  it("is under the 40,000 B brotli-compressed ceiling (was 182,158 B)", () => {
    const buf = fs.readFileSync(DIST_CSS_PATH);
    const brotliSize = zlib.brotliCompressSync(buf).length;
    expect(brotliSize).toBeLessThan(BROTLI_CEILING);
  });

  it("emits one dist/fonts file for every @font-face rule carrying a src URL", () => {
    const css = loadCss();
    const fontFaceBlocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    const urlBearingFaces = fontFaceBlocks.filter((block) =>
      /src\s*:[^;]*url\(/.test(block),
    );
    const fontFiles = fs.existsSync(DIST_FONTS_DIR)
      ? fs.readdirSync(DIST_FONTS_DIR).filter((f) => !f.startsWith("."))
      : [];
    expect(fontFiles.length).toBe(urlBearingFaces.length);
  });
});
