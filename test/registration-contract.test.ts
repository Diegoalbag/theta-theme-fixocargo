import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import { JSDOM } from "jsdom";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as cva from "class-variance-authority";
import * as clsx from "clsx";
import * as twMerge from "tailwind-merge";
import * as LucideReact from "lucide-react";
import { assertContract } from "./contract-assertions";

// Theme registration contract — the build gate.
//
// Loads the freshly-built local dist/theme.bundle.js inside a jsdom window
// (with the externalized globals the IIFE reads shimmed) and asserts the
// bundle self-registered on window.__THETA_THEMES__ under its package.json
// name with non-empty sections.
//
// Security (ASVS V14): this test ONLY ever evals the locally-built
// dist/theme.bundle.js — a controlled, in-repo build artifact — never a
// remote/untrusted URL.

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);
const EXPECTED_NAME: string = pkg.name; // read from package.json — never hardcoded

describe("theme registration contract", () => {
  let win: any;

  beforeAll(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      runScripts: "dangerously", // allow the IIFE to execute
    });
    win = dom.window;

    // Shim the external globals the IIFE invocation reads. React stays an
    // external peer; cva/clsx/twMerge/LucideReact may be read by the bundle's
    // IIFE invocation. ReactDOM is referenced by the invocation but never
    // called during registration, so an object shim is sufficient and avoids
    // importing the react-dom peer.
    win.React = React;
    win.ReactDOM = {};
    win.jsxRuntime = jsxRuntime;
    win.cva = cva;
    win.clsx = clsx;
    win.twMerge = twMerge;
    win.LucideReact = LucideReact;
    win.__THETA_THEMES__ = {};
    // The library build does not statically replace process.env.NODE_ENV, so
    // the bundled deps read it at eval time. jsdom has no `process` — provide a
    // minimal shim so the controlled local bundle can register.
    win.process = { env: { NODE_ENV: "production" } };

    // Eval ONLY the freshly-built local bundle (never a remote URL — V14).
    const bundle = readFileSync(
      resolve(__dirname, "../dist/theme.bundle.js"),
      "utf-8",
    );
    win.eval(bundle);
  });

  it("registers under the package.json name", () => {
    expect(win.__THETA_THEMES__[EXPECTED_NAME]).toBeDefined();
  });

  it("registration key is NOT a stale hardcoded literal", () => {
    expect(Object.keys(win.__THETA_THEMES__)).toEqual([EXPECTED_NAME]);
  });

  it("has non-empty sections", () => {
    const mod = win.__THETA_THEMES__[EXPECTED_NAME];
    expect(Object.keys(mod.sectionsComponents ?? {}).length).toBeGreaterThan(0);
  });

  it("module name matches the registration key", () => {
    expect(win.__THETA_THEMES__[EXPECTED_NAME].name).toBe(EXPECTED_NAME);
  });

  it("passes the shared assertContract helper end-to-end", () => {
    expect(() => assertContract(win, EXPECTED_NAME)).not.toThrow();
  });
});
