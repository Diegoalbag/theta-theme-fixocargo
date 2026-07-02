---
phase: 10-quality-hardening-page-composition-uat
plan: 02
subsystem: testing / security
tags: [xss, dompurify, richtext, jsdom, vitest, security-test]
status: complete
requirements: [QA-06]
dependency_graph:
  requires:
    - "src/lib/rich-text.tsx (RichText sink + RICHTEXT_CONFIG + afterSanitizeAttributes hook, Phase 7)"
    - "test/rich-text.test.tsx (node/stringStrip analog — harness source)"
  provides:
    - "test/richtext-xss.test.tsx (jsdom-env DOMPurify XSS-vector suite — automated half of QA-06/SC4)"
  affects:
    - "CI test suite (adds 7 XSS-vector assertions on the authoritative browser sanitizer path)"
tech_stack:
  added: []
  patterns:
    - "Per-file `// @vitest-environment jsdom` docblock to flip a single test file into a DOM env (vitest.config default stays node)"
    - "Assert on real RichText/DOMPurify output via renderToStaticMarkup — never a bespoke stripper"
    - "Hook-ran proof: target=_blank → rel=\"noopener noreferrer\" confirms the jsdom-only DOMPurify branch executed"
key_files:
  created:
    - "test/richtext-xss.test.tsx"
  modified: []
decisions:
  - "Vector 6 (nested mutation-XSS `<scr<script>ipt>`) asserts the real DOMPurify guarantee — no reassembled `<script>` element and residual angle brackets HTML-escaped/inert — rather than the plan's literal `not.toContain(\"alert(1)\")`, because DOMPurify correctly leaves the payload as inert escaped text (not an XSS)."
metrics:
  duration: "~5 min"
  completed: "2026-07-02"
  tasks: 1
  files_created: 1
  files_modified: 0
---

# Phase 10 Plan 02: jsdom-env DOMPurify XSS Suite Summary

Added `test/richtext-xss.test.tsx`, the jsdom-environment twin of the existing node `test/rich-text.test.tsx`, driving seven known XSS vectors through the authoritative `DOMPurify.sanitize` branch of the single `src/lib/rich-text.tsx` sink and asserting each is neutralized with an exact, checkable outcome — including a `rel="noopener noreferrer"` hook-ran proof that confirms the browser control (not the SSR baseline) executed.

## What Was Built

**Task 1 — jsdom-env DOMPurify XSS-vector suite (D-03, QA-06/SC4)** — commit `ca0beef`

- New file `test/richtext-xss.test.tsx` with `// @vitest-environment jsdom` as the load-bearing first line. This makes a real `window` exist before `src/lib/rich-text.tsx` is imported, so (a) the module-level `afterSanitizeAttributes` hook registers and (b) the `RichText` sink takes the `DOMPurify.sanitize(html, RICHTEXT_CONFIG)` branch instead of the `stringStrip` node baseline.
- Copies the harness from the node analog: `renderToStaticMarkup(<RichText html={...} />)` render helper, `vitest` `describe/it/expect`, `RichText` imported via the `@/lib/rich-text` alias.
- Seven vectors, each asserted against the real sanitizer output:
  1. `<script>alert(1)</script>` → no `<script`, no `alert(1)`.
  2. `<img src=x onerror=alert(1)>` → no `<img`, no `onerror`.
  3. `<a href="javascript:alert(1)">x</a>` → no `javascript:`, text `x` kept.
  4. `<svg onload=alert(1)></svg>` → no `<svg`, no `onload`.
  5. `<a href="javascript:alert(1)"><b>y` (malformed) → no `javascript:`.
  6. `<scr<script>ipt>alert(1)</script>` (nested mutation-XSS) → no reassembled `<script`, residual escaped (`&gt;`, inert).
  7. `<a href="/ok" target="_blank">z</a>` → `rel="noopener noreferrer"` present (hook-ran proof).
- `test/rich-text.test.tsx` (node path) left unchanged; the two files together cover both execution contexts of the one sink.

## Verification

- `yarn test run test/richtext-xss.test.tsx` — 7/7 pass.
- `yarn test` (full suite) — 319 pass across 15 files, 0 failures.
- `yarn typecheck` — clean (exit 0).
- `yarn build` — bundle builds (`dist/theme.bundle.js` 143.84 kB); required so the pre-existing `test/registration-contract.test.ts` (which reads the built bundle) passes in a fresh worktree.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Vector 6 assertion corrected to match real DOMPurify behavior**
- **Found during:** Task 1 (first test run — vector 6 failed).
- **Issue:** The plan specified vector 6 (`<scr<script>ipt>alert(1)</script>`) should result in output that "does not contain `alert(1)`". DOMPurify's actual (correct, secure) behavior strips the inner `<script>` tags and leaves the residual `ipt>alert(1)` as **HTML-escaped inert text** (`ipt&gt;alert(1)`). The literal string `alert(1)` remains as inert visible text, which is not an XSS — so the plan's literal assertion was wrong for this mutation vector.
- **Fix:** Assert the true security guarantee instead: no reassembled `<script`/`</script` element survives (case-insensitive) and the residual angle brackets are HTML-escaped (`&gt;`, proving DOMPurify escaped rather than reassembled the construct). This is a stronger, accurate check of mutation-XSS neutralization.
- **Files modified:** `test/richtext-xss.test.tsx`
- **Commit:** `ca0beef`

### Environment note (not a deviation)

- The fresh worktree had no `node_modules`; ran `yarn install` to materialize already-declared, previously-vetted deps (`jsdom`, `dompurify` from Phase 7). No new packages were added (threat register T-10-SC: zero installs — upheld).

## Threat Model Coverage

All `mitigate` dispositions in the plan's STRIDE register are now exercised by CI-repeatable assertions on the authoritative browser control:

| Threat ID | Covered by |
|-----------|-----------|
| T-10-01 (stored XSS: script/img/svg/nested) | vectors 1, 2, 4, 6 |
| T-10-02 (bad-protocol URI) | vectors 3, 5 |
| T-10-03 (reverse tabnabbing) | vector 7 (also the jsdom-path proof) |
| T-10-06 (DOMPurify no-op without a DOM) | jsdom env forces the real sanitizer; node path stays covered by `test/rich-text.test.tsx` |
| T-10-SC (dependency installs) | accept — zero new packages (verified) |

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: `test/richtext-xss.test.tsx`
- FOUND: `.planning/phases/10-quality-hardening-page-composition-uat/10-02-SUMMARY.md`
- FOUND commit: `ca0beef` (test)
- FOUND commit: `6c17130` (summary)
