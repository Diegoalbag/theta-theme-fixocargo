import { describe, expect, it } from "vitest";
// Request-time live-theme BUNDLE resolution (Finding 4 / Open Q3, MT-04, D-03/D-04).
//
// The deployed public bundle URL was baked at deploy (NEXT_PUBLIC_THEME_BUNDLE_URL),
// so switching Site.liveTheme to a DIFFERENT theme rendered new content but the OLD
// bundle. resolveLiveBundle(site, env) resolves the bundle at REQUEST time from
// Site.liveTheme.builtAssetUrl/name so a different-theme go-live swaps the rendered
// bundle with no redeploy; env vars remain the fallback (migration window /
// single-theme tenant).
//
// Contract under test — resolveLiveBundle(site, env):
//   - live theme's builtAssetUrl/name WIN over env
//   - null liveTheme -> env fallback (themeName defaults to "default")
//   - liveTheme missing builtAssetUrl -> env bundle url, but liveTheme.name still preferred
//   - two different live themes -> two different { themeBundleUrl, themeName }
import { resolveLiveBundle } from "../live-resolve";

const env = {
  NEXT_PUBLIC_THEME_BUNDLE_URL: "https://cdn.example/baked/theme.js",
  NEXT_PUBLIC_THEME_NAME: "baked-theme",
};

describe("resolveLiveBundle — request-time bundle resolution (Finding 4 / Q3, MT-04)", () => {
  it("the live theme's builtAssetUrl/name WIN over env", () => {
    const site = {
      liveTheme: {
        documentId: "theme-live",
        name: "Aurora",
        builtAssetUrl: "https://cdn.example/aurora/theme.js",
      },
    };
    expect(resolveLiveBundle(site, env)).toEqual({
      themeBundleUrl: "https://cdn.example/aurora/theme.js",
      themeName: "Aurora",
    });
  });

  it("null liveTheme falls back to env (themeName defaults to 'default' when env name absent)", () => {
    const site = { liveTheme: null };
    expect(resolveLiveBundle(site, env)).toEqual({
      themeBundleUrl: "https://cdn.example/baked/theme.js",
      themeName: "baked-theme",
    });
    expect(resolveLiveBundle({ liveTheme: null }, { NEXT_PUBLIC_THEME_BUNDLE_URL: "u" })).toEqual({
      themeBundleUrl: "u",
      themeName: "default",
    });
  });

  it("liveTheme missing builtAssetUrl falls back to env bundle url but keeps liveTheme.name", () => {
    const site = {
      liveTheme: { documentId: "theme-live", name: "Aurora", builtAssetUrl: null },
    };
    expect(resolveLiveBundle(site, env)).toEqual({
      themeBundleUrl: "https://cdn.example/baked/theme.js",
      themeName: "Aurora",
    });
  });

  it("two different live themes resolve to two different bundles (observable go-live)", () => {
    const siteA = {
      liveTheme: { documentId: "a", name: "Aurora", builtAssetUrl: "https://cdn.example/a.js" },
    };
    const siteB = {
      liveTheme: { documentId: "b", name: "Borealis", builtAssetUrl: "https://cdn.example/b.js" },
    };
    const a = resolveLiveBundle(siteA, env);
    const b = resolveLiveBundle(siteB, env);
    expect(a).toEqual({ themeBundleUrl: "https://cdn.example/a.js", themeName: "Aurora" });
    expect(b).toEqual({ themeBundleUrl: "https://cdn.example/b.js", themeName: "Borealis" });
    expect(a.themeBundleUrl).not.toBe(b.themeBundleUrl);
    expect(a.themeName).not.toBe(b.themeName);
  });
});
