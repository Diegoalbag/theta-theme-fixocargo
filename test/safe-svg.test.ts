import { describe, it, expect } from "vitest";

import { safeSvgDataUri } from "@/lib/safe-svg";

// safeSvgDataUri (quick task 260828) — the guard behind the "Icono
// personalizado (SVG)" textarea, where a merchant pastes raw SVG markup.
//
// The PRIMARY control is architectural, not textual: the result is only ever
// used as an <img src>, and an SVG loaded that way is in the browser's secure
// static mode (no scripting, no external fetches). These tests pin the
// defence-in-depth layer on top of that — the shapes accepted, and the fact
// that nothing executable survives into the encoded attribute.

const decode = (uri?: string) =>
  uri ? decodeURIComponent(uri.replace(/^data:image\/svg\+xml,/, "")) : "";

describe("safeSvgDataUri — accepted shapes", () => {
  it("returns undefined for empty/missing input", () => {
    expect(safeSvgDataUri()).toBeUndefined();
    expect(safeSvgDataUri("")).toBeUndefined();
    expect(safeSvgDataUri("   ")).toBeUndefined();
  });

  it("encodes a plain SVG into a data: URI", () => {
    const out = safeSvgDataUri('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
    expect(out).toMatch(/^data:image\/svg\+xml,/);
    expect(decode(out)).toContain("<path");
  });

  it("tolerates surrounding whitespace and a newline-formatted paste", () => {
    const out = safeSvgDataUri('\n  <svg xmlns="x">\n  <circle r="2"/>\n</svg>\n');
    expect(out).toBeDefined();
    expect(decode(out)).toContain("<circle");
  });

  it("rejects anything that is not an <svg> root", () => {
    expect(safeSvgDataUri("https://example.com/icon.svg")).toBeUndefined();
    expect(safeSvgDataUri('<img src="x.svg">')).toBeUndefined();
    expect(safeSvgDataUri("just some text")).toBeUndefined();
    // A leading <div> wrapper is a paste mistake, not an SVG.
    expect(safeSvgDataUri("<div><svg></svg></div>")).toBeUndefined();
  });

  it("rejects an oversized paste rather than truncating it", () => {
    const huge = `<svg>${"<path d='M0 0'/>".repeat(2000)}</svg>`;
    expect(huge.length).toBeGreaterThan(12_000);
    expect(safeSvgDataUri(huge)).toBeUndefined();
  });
});

describe("safeSvgDataUri — nothing executable survives", () => {
  it("strips a <script> element and its contents", () => {
    const out = safeSvgDataUri(
      '<svg><script>alert(1)</script><path d="M0 0"/></svg>',
    );
    expect(decode(out)).not.toContain("alert");
    expect(decode(out)).not.toContain("script");
    expect(decode(out)).toContain("<path");
  });

  it("strips <foreignObject>, the classic SVG-to-HTML bypass", () => {
    const out = safeSvgDataUri(
      "<svg><foreignObject><body onload=alert(1)>hi</body></foreignObject></svg>",
    );
    expect(decode(out)).not.toContain("foreignObject");
    expect(decode(out)).not.toContain("onload");
  });

  it("strips inline event handlers in every quoting style", () => {
    const out = safeSvgDataUri(
      `<svg onload="alert(1)"><rect onclick='alert(2)'/><circle onmouseover=alert(3)/></svg>`,
    );
    const decoded = decode(out);
    expect(decoded).not.toContain("onload");
    expect(decoded).not.toContain("onclick");
    expect(decoded).not.toContain("onmouseover");
    expect(decoded).not.toContain("alert");
  });

  it("strips javascript: and nested data: schemes", () => {
    const out = safeSvgDataUri(
      '<svg><a href="javascript:alert(1)"><image href="data:text/html,x"/></a></svg>',
    );
    const decoded = decode(out);
    expect(decoded).not.toContain("javascript:");
    expect(decoded).not.toContain("data:");
  });

  it("catches an entity-obfuscated scheme", () => {
    const out = safeSvgDataUri(
      '<svg><a href="&#106;avascript:alert(1)">x</a></svg>',
    );
    expect(decode(out)).not.toContain("javascript:");
  });

  it("catches a control-character-split scheme", () => {
    const out = safeSvgDataUri('<svg><a href="java	script:alert(1)">x</a></svg>');
    expect(decode(out)).not.toContain("javascript:");
  });

  it("returns undefined when scrubbing leaves no SVG behind", () => {
    // The whole payload was the dangerous element — emit nothing rather than a
    // truncated fragment.
    expect(safeSvgDataUri("<svg><script>alert(1)</script>")).toBeDefined();
    expect(safeSvgDataUri("<script>alert(1)</script>")).toBeUndefined();
  });

  it("never emits a raw < or > into the attribute value (encoding holds)", () => {
    const out = safeSvgDataUri('<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>');
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain('"');
  });
});
