// @vitest-environment jsdom
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { RichText } from "@/lib/rich-text";

// ---------------------------------------------------------------------------
// RichText sink — AUTHORITATIVE DOMPurify path (jsdom env; D-03, QA-06/SC4).
//
// This is the jsdom-env TWIN of test/rich-text.test.tsx (node/stringStrip path).
// The `// @vitest-environment jsdom` docblock on the VERY FIRST line is
// load-bearing: it makes a real `window` exist BEFORE `src/lib/rich-text.tsx`
// is imported, so at module load the `afterSanitizeAttributes` hook registers,
// and at render time the sink takes the `DOMPurify.sanitize(html,
// RICHTEXT_CONFIG)` branch instead of `stringStrip` (rich-text.tsx:115-120).
//
// That DOMPurify branch is the control that actually protects a published
// visitor's browser (the platform stores richtext raw, ZERO sanitization).
// Without the docblock this file would silently exercise the node baseline and
// prove nothing about the published control (Pitfall 3). `vitest.config.ts`
// env stays default `node`; this override is per-file only.
//
// Together the two files cover BOTH execution contexts of the single sink:
//   • node  → stringStrip           (test/rich-text.test.tsx)
//   • jsdom → DOMPurify.sanitize    (this file)
// Assertions are on the `renderToStaticMarkup` HTML string produced by the real
// RichText/DOMPurify output — never a bespoke stripper (that proves nothing).
// ---------------------------------------------------------------------------

const render = (html: string) =>
  renderToStaticMarkup(<RichText html={html} />);

describe("RichText XSS — authoritative DOMPurify path (jsdom)", () => {
  // Vector 1 — T-10-01: <script> element and its content removed.
  it("drops <script> and its content", () => {
    const h = render("<script>alert(1)</script>");
    expect(h).not.toContain("<script");
    expect(h).not.toContain("alert(1)");
  });

  // Vector 2 — T-10-01: <img onerror> element removed (event handler gone).
  it("removes <img onerror>", () => {
    const h = render("<img src=x onerror=alert(1)>");
    expect(h).not.toContain("<img");
    expect(h).not.toContain("onerror");
  });

  // Vector 3 — T-10-02: javascript: href neutralized, anchor text preserved.
  it("neutralizes javascript: href, keeps text", () => {
    const h = render('<a href="javascript:alert(1)">x</a>');
    expect(h.toLowerCase()).not.toContain("javascript:");
    expect(h).toContain("x");
  });

  // Vector 4 — T-10-01: <svg onload> element removed (SVG vector gone).
  it("removes <svg onload>", () => {
    const h = render("<svg onload=alert(1)></svg>");
    expect(h).not.toContain("<svg");
    expect(h).not.toContain("onload");
  });

  // Vector 5 — T-10-02: malformed/unclosed markup — DOMPurify normalizes and
  // drops the bad javascript: href.
  it("drops the bad href from malformed/unclosed markup", () => {
    const h = render('<a href="javascript:alert(1)"><b>y');
    expect(h.toLowerCase()).not.toContain("javascript:");
  });

  // Vector 6 — T-10-01: nested mutation-XSS — the <scr<script>ipt> construct is
  // NEUTRALIZED, not reassembled into an executable <script>. A naive regex
  // stripper that deletes the inner "<script>" would reassemble "scr"+"ipt>" into
  // a live "<script>"; DOMPurify does not — it strips the script tags and leaves
  // the residual ("ipt>alert(1)") as HTML-ESCAPED inert text ("ipt&gt;alert(1)").
  // The security guarantee is that NO executable <script> element survives and
  // the residual "<" / ">" are escaped (inert), NOT that the literal payload text
  // is absent — inert escaped text is not an XSS.
  it("neutralizes nested mutation-XSS script constructs (no reassembled <script>)", () => {
    const h = render("<scr<script>ipt>alert(1)</script>");
    // No executable script element is reconstituted.
    expect(h.toLowerCase()).not.toContain("<script");
    // Any residual angle brackets are HTML-escaped (inert text, not live markup),
    // proving DOMPurify escaped rather than reassembled the construct.
    expect(h).toContain("&gt;");
    expect(h).not.toMatch(/<\/?script/i);
  });

  // Vector 7 — T-10-03 (HOOK PROOF): benign target=_blank anchor is kept and the
  // afterSanitizeAttributes hook adds rel="noopener noreferrer". This assertion
  // is what PROVES the jsdom DOMPurify path (and its hook) actually ran — a
  // node-baseline run would fail it.
  it("forces rel=noopener on target=_blank (hook runs)", () => {
    const h = render('<a href="/ok" target="_blank">z</a>');
    expect(h).toContain('rel="noopener noreferrer"');
  });
});
