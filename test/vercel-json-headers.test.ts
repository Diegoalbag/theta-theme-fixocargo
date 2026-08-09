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

describe("vercel.json — theme asset cache headers (PERF-04, theta-theme-fixocargo)", () => {
  it("is valid JSON with a headers array of exactly six rules", () => {
    const config = loadConfig();
    expect(Array.isArray(config.headers)).toBe(true);
    expect(config.headers).toHaveLength(6);
  });

  it("has exactly two rules per canonical artifact (versioned + un-versioned)", () => {
    const config = loadConfig();
    for (const source of CANONICAL_SOURCES) {
      const rulesForSource = config.headers.filter((r) => r.source === source);
      expect(rulesForSource).toHaveLength(2);
    }
  });

  it("targets no path other than the three canonical artifacts", () => {
    const config = loadConfig();
    for (const rule of config.headers) {
      expect(CANONICAL_SOURCES).toContain(rule.source);
    }
  });

  it("no rule's source carries a query string — source matches pathname only", () => {
    const config = loadConfig();
    for (const rule of config.headers) {
      expect(rule.source.includes("?")).toBe(false);
    }
  });

  it("every rule whose Cache-Control contains immutable also carries a `has` condition on query key v", () => {
    const config = loadConfig();
    const immutableRules = config.headers.filter((r) =>
      cacheControlValue(r)?.includes("immutable"),
    );
    expect(immutableRules.length).toBeGreaterThan(0);
    for (const rule of immutableRules) {
      expect(hasQueryCondition(rule.has, "v")).toBe(true);
      expect(cacheControlValue(rule)).toBe(IMMUTABLE_VALUE);
    }
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
