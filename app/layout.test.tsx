import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

// Render-smoke test for the root layout's <main> landmark (D-09,
// landmark-one-main). The vitest environment is `node` (no jsdom), so we render
// DOM-free with renderToStaticMarkup and assert on the returned HTML string —
// matches the theta-theme-fixocargo/test/sections-*.test.tsx convention.
//
// This single wrapper in the root layout covers EVERY render branch of the app
// (normal render, app/[slug]/page.tsx's Configuration Error branch, and
// app/not-found.tsx) by construction, since all routes render through this
// layout — so testing it here is sufficient, no per-branch duplication needed.
import RootLayout from "./layout";

describe("RootLayout — single <main> landmark (D-09)", () => {
  it("renders exactly one <main> element wrapping arbitrary children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Arbitrary page content</div>
      </RootLayout>
    );

    const mainOpenTagMatches = html.match(/<main/g) ?? [];
    expect(mainOpenTagMatches).toHaveLength(1);
    expect(html).toContain("Arbitrary page content");
  });
});
