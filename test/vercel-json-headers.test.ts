import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Shape test only (Phase 17-08, PERF-04, theta-theme-fixocargo adoption).
 * This does NOT and cannot prove the header reaches a deployed response —
 * see the plan's blocking checkpoint / `.planning/BASELINE.md` in the
 * platform repo (project-theta-fe) for the live `curl -I` step that settles
 * that question. This test only pins the SHAPE of this repo's own
 * `vercel.json`, copied from the platform's
 * `templates/theme-repository/vercel.json` (per THEME_DEVELOPMENT.md
 * section 8), so a future edit to this file cannot silently widen the
 * `immutable` rule to cover an un-versioned request.
 *
 * FONT RULE (Phase 17-09, PERF-01): the seventh rule, `/fonts/(.*)`, is
 * deliberately NOT query-gated like the three canonical bundle artifacts
 * above. Those get a stable-alias URL that is byte-identical across every
 * rebuild, so an un-versioned request must revalidate. Font filenames are
 * content-stable brand assets (anton.woff2, inter.woff2, etc.) that are
 * replaced BY NAME ONLY during a deliberate, infrequent, maintainer-driven
 * licensed-font swap — there is no per-rebuild churn to protect against, so
 * a year-long immutable lifetime with no version query is safe here. The
 * rule also carries `Access-Control-Allow-Origin: *` because the font is
 * fetched cross-origin: theme.bundle.css lives on the theme's own asset
 * Vercel project, but the browser loading it is rendering the tenant
 * document on a different origin.
 */

const VERCEL_JSON_PATH = path.resolve(__dirname, "..", "vercel.json");

interface HeaderCondition {
  type: string;
  key: string;
}

interface HeaderRule {
  source: string;
  has?: HeaderCondition[];
  missing?: HeaderCondition[];
  headers: Array<{ key: string; value: string }>;
}

interface VercelConfig {
  headers: HeaderRule[];
}

const IMMUTABLE_VALUE = "public, max-age=31536000, immutable";
const REVALIDATE_VALUE = "public, max-age=0, must-revalidate";
const CANONICAL_SOURCES = [
  "/theme.bundle.js",
  "/theme.bundle.css",
  "/theme.bundle.deferred.css",
];

function loadConfig(): VercelConfig {
  const raw = fs.readFileSync(VERCEL_JSON_PATH, "utf-8");
  return JSON.parse(raw) as VercelConfig;
}

function cacheControlValue(rule: HeaderRule): string | undefined {
  return rule.headers.find((h) => h.key === "Cache-Control")?.value;
}

function hasQueryCondition(
  conditions: HeaderCondition[] | undefined,
  key: string,
): boolean {
  return (
    Array.isArray(conditions) &&
    conditions.some((c) => c.type === "query" && c.key === key)
  );
}

const FONT_RULE_SOURCE = "/fonts/(.*)";

describe("vercel.json — theme asset cache headers (PERF-04, theta-theme-fixocargo)", () => {
  it("is valid JSON with a headers array of exactly seven rules (six bundle + one font)", () => {
    const config = loadConfig();
    expect(Array.isArray(config.headers)).toBe(true);
    expect(config.headers).toHaveLength(7);
  });

  it("has exactly two rules per canonical artifact (versioned + un-versioned)", () => {
    const config = loadConfig();
    for (const source of CANONICAL_SOURCES) {
      const rulesForSource = config.headers.filter((r) => r.source === source);
      expect(rulesForSource).toHaveLength(2);
    }
  });

  it("targets no path other than the three canonical artifacts and the font rule", () => {
    const config = loadConfig();
    for (const rule of config.headers) {
      expect([...CANONICAL_SOURCES, FONT_RULE_SOURCE]).toContain(rule.source);
    }
  });

  it("no rule's source carries a query string — source matches pathname only", () => {
    const config = loadConfig();
    for (const rule of config.headers) {
      expect(rule.source.includes("?")).toBe(false);
    }
  });

  it("every QUERY-GATED rule whose Cache-Control contains immutable also carries a `has` condition on query key v", () => {
    // The font rule is deliberately excluded — it is immutable WITHOUT a
    // query gate (see header comment: content-stable filenames, no
    // per-rebuild churn to protect against), unlike the three canonical
    // bundle artifacts whose stable-alias URL is byte-identical every build.
    const config = loadConfig();
    const bundleRules = config.headers.filter((r) => r.source !== FONT_RULE_SOURCE);
    const immutableRules = bundleRules.filter((r) =>
      cacheControlValue(r)?.includes("immutable"),
    );
    expect(immutableRules.length).toBeGreaterThan(0);
    for (const rule of immutableRules) {
      expect(hasQueryCondition(rule.has, "v")).toBe(true);
      expect(cacheControlValue(rule)).toBe(IMMUTABLE_VALUE);
    }
  });

  it("the font rule carries both Access-Control-Allow-Origin and an immutable, un-gated Cache-Control", () => {
    const config = loadConfig();
    const fontRule = config.headers.find((r) => r.source === FONT_RULE_SOURCE);
    expect(fontRule).toBeDefined();
    expect(fontRule?.has).toBeUndefined();
    expect(fontRule?.missing).toBeUndefined();
    expect(
      fontRule?.headers.find((h) => h.key === "Access-Control-Allow-Origin")
        ?.value,
    ).toBe("*");
    expect(cacheControlValue(fontRule as HeaderRule)).toBe(IMMUTABLE_VALUE);
  });

  it("no rule pairs immutable with a `missing` condition (the inverse of the safety property)", () => {
    const config = loadConfig();
    for (const rule of config.headers) {
      if (cacheControlValue(rule)?.includes("immutable")) {
        expect(hasQueryCondition(rule.missing, "v")).toBe(false);
      }
    }
  });

  it("every un-versioned (missing v) rule gets must-revalidate, never immutable", () => {
    const config = loadConfig();
    const unversionedRules = config.headers.filter((r) =>
      hasQueryCondition(r.missing, "v"),
    );
    expect(unversionedRules.length).toBeGreaterThan(0);
    for (const rule of unversionedRules) {
      expect(cacheControlValue(rule)).toBe(REVALIDATE_VALUE);
      expect(hasQueryCondition(rule.has, "v")).toBe(false);
    }
  });

  it("for each canonical artifact, the versioned and un-versioned rules are mutually exclusive conditions", () => {
    const config = loadConfig();
    for (const source of CANONICAL_SOURCES) {
      const rulesForSource = config.headers.filter((r) => r.source === source);
      const versioned = rulesForSource.filter((r) => hasQueryCondition(r.has, "v"));
      const unversioned = rulesForSource.filter((r) =>
        hasQueryCondition(r.missing, "v"),
      );
      expect(versioned).toHaveLength(1);
      expect(unversioned).toHaveLength(1);
      expect(cacheControlValue(versioned[0])).toBe(IMMUTABLE_VALUE);
      expect(cacheControlValue(unversioned[0])).toBe(REVALIDATE_VALUE);
    }
  });
});
