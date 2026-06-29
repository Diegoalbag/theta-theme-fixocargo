import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// RichText sink audit (D-04, T-07-07) — env is `node`, no DOM.
//
// v1.0 of this theme enforced a "ZERO dangerouslySetInnerHTML" convention by
// hand-written comments only. Phase 07 introduces exactly ONE deliberate sink
// (the XSS-sanitized src/lib/rich-text.tsx). This audit EVOLVES the convention
// into a machine-checked invariant: exactly one sink, in the allowlisted file.
//
// LOAD-BEARING DISTINCTION — count the ATTRIBUTE-ASSIGNMENT form
// (`dangerouslySetInnerHTML\s*=`), NOT a bare-substring/`.includes` match. The
// repo already contains 4 documentation comments that merely MENTION the bare
// token (Branch.tsx, FooterColumn.tsx, AddressCard.tsx, Footer.tsx), each
// followed by `)` or `.`, never `=`. A bare-substring walk would count those 4
// doc mentions plus the real sink and wrongly report 5. Matching only the
// `=` assignment form excludes the comments and isolates the genuine sink.
// ---------------------------------------------------------------------------

const SRC = resolve(__dirname, "../src");
const ALLOWLISTED = resolve(SRC, "lib/rich-text.tsx");
const SINK_ATTR = /dangerouslySetInnerHTML\s*=/g;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(entry.name) ? [p] : [];
  });
}

describe("richtext sink audit (D-04) — exactly one allowlisted sink", () => {
  const files = walk(SRC);

  // Per-file count of the attribute-assignment form, summed across all of src/.
  const matches = files.flatMap((file) => {
    const content = readFileSync(file, "utf-8");
    const count = (content.match(SINK_ATTR) ?? []).length;
    return count > 0 ? [{ file, count }] : [];
  });
  const total = matches.reduce((sum, m) => sum + m.count, 0);

  it("has exactly one dangerouslySetInnerHTML= attribute usage across src/", () => {
    expect(total).toBe(1);
  });

  it("the sole sink lives in the allowlisted src/lib/rich-text.tsx", () => {
    expect(matches).toHaveLength(1);
    expect(resolve(matches[0].file)).toBe(ALLOWLISTED);
  });

  it("ignores the pre-existing doc-comment mentions of the bare token", () => {
    // The 4 doc mentions are bare-token references (followed by `)`/`.`), so the
    // attribute-form regex never matches them — proven by total staying at 1
    // even though several src files contain the substring in comments.
    const bareSubstringFiles = files.filter((file) =>
      readFileSync(file, "utf-8").includes("dangerouslySetInnerHTML"),
    );
    // More files MENTION the token than ASSIGN it: the doc comments are present
    // but excluded from the assignment-form count.
    expect(bareSubstringFiles.length).toBeGreaterThan(matches.length);
  });
});
