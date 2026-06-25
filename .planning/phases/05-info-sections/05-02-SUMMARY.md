---
phase: 05-info-sections
plan: 02
subsystem: ui
tags: [react, tailwind, theta-theme, section, block, registry, tdd]

# Dependency graph
requires:
  - phase: 05-info-sections (plan 05-01)
    provides: shared test/sections-info-sections.test.tsx + Sucursales/Branch registry entries
  - phase: 04-content-sections (Beneficios)
    provides: navy dark-band precedent (bg-brand-navy + dark SectionHeading + pill CTA + BlocksSlot)
provides:
  - EnviosNacionales dark section (key envios-nacionales) + enviosNacionalesSettingsSchema
  - FaqPill section-local block (key faq-pill) + faqPillSettingsSchema
  - Registry wiring for envios-nacionales (3 section maps) + faq-pill (localBlocks only, D-07)
  - Appended EnviosNacionales + FaqPill render-smoke describe blocks in the shared test file
affects: [05-info-sections plan 05-03 (Blogs/BlogCard appends to same shared test file)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Navy dark info section reusing Beneficios precedent (dark SectionHeading + pill CTA + stacking BlocksSlot)"
    - "Section-local block guarded-anchor: real <a href> only when url set, inert disabled button otherwise (D-05)"

key-files:
  created:
    - src/sections/EnviosNacionales/EnviosNacionales.tsx
    - src/sections/EnviosNacionales/index.ts
    - src/blocks/FaqPill/FaqPill.tsx
    - src/blocks/FaqPill/index.ts
  modified:
    - src/registry.ts
    - test/sections-info-sections.test.tsx

key-decisions:
  - "kicker maps to SectionHeading eyebrow (dark variant renders it yellow above the white H2)"
  - "body renders as a sibling <p> after the heading (not inside SectionHeading), only when set"
  - "Default BlocksSlot EmptyState kept (no empty={null}) so zero-pill section shows drop affordance (D-08)"
  - "faq-pill registered only in sectionBlocksConfig['envios-nacionales'].localBlocks; global block maps untouched (D-07)"

patterns-established:
  - "Guarded Buscar action: <a href={url}> when url set, inert disabled <button><span> otherwise — never emits href='' (D-05, T-05-07)"
  - "maxBlocks 8 for the single faq-pill slot (D-09), mirroring Sucursales"

requirements-completed: [INF-02]

# Metrics
duration: 6min
completed: 2026-06-25
status: complete
---

# Phase 5 Plan 02: EnviosNacionales + FaqPill Summary

**Navy dark "Envíos Nacionales" section (Beneficios precedent) with editable kicker/heading/body/real-anchor CTA over a stacking slot of section-local FaqPill blocks whose "Buscar" action is a real anchor only when a url is set.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-25T13:34:17Z
- **Completed:** 2026-06-25T13:40:00Z
- **Tasks:** 3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- FaqPill section-local block: always renders its `question`; "Buscar" is a real `<a href={url}>` only when `url` is set, otherwise an inert `disabled` button wrapping a `<span>` (never emits `href=""`).
- EnviosNacionales dark section on `bg-brand-navy`: dark `SectionHeading` (kicker → yellow eyebrow, white H2), real yellow-pill "Conoce más" CTA anchor, optional body paragraph, and a stacking `BlocksSlot` (`flex flex-col gap-4`) of `faq-pill` blocks with the default EmptyState kept.
- Registry wired: `envios-nacionales` added to all three section maps; `faq-pill` added as the single `localBlocks` entry (`maxBlocks: 8`); global block maps (`blocksComponents`/`blockSettingsSchemas`) left unchanged (D-07).
- Shared test file extended with FaqPill, EnviosNacionales, and EnviosNacionales-registry describe blocks; full suite green (143 tests / 7 files) and `yarn build` exits 0 with the bundle registering under `fixocargo`.

## Task Commits

Each task was committed atomically (TDD: test appended alongside implementation per task):

1. **Task 1: Implement FaqPill section-local block** - `d0b2478` (feat)
2. **Task 2: Implement EnviosNacionales dark section + wire registry** - `0443e85` (feat)
3. **Task 3: Append EnviosNacionales + FaqPill render-smoke describe blocks** - covered by `d0b2478` (FaqPill describe) and `0443e85` (EnviosNacionales + registry describes); no separate commit needed because the TDD flow added each describe block in the same commit as its implementation.

## Files Created/Modified
- `src/blocks/FaqPill/FaqPill.tsx` - FaqPill block + `faqPillSettingsSchema` (ids: question, url)
- `src/blocks/FaqPill/index.ts` - Barrel export for FaqPill
- `src/sections/EnviosNacionales/EnviosNacionales.tsx` - EnviosNacionales dark section + `enviosNacionalesSettingsSchema` (ids: kicker, heading, body, ctaLabel, ctaUrl)
- `src/sections/EnviosNacionales/index.ts` - Barrel export for EnviosNacionales
- `src/registry.ts` - Added `envios-nacionales` (3 section maps) + `faq-pill` localBlocks entry
- `test/sections-info-sections.test.tsx` - Appended FaqPill, EnviosNacionales, EnviosNacionales-registry describe blocks

## Decisions Made
None beyond the plan's pre-recorded decisions (D-05/D-06/D-07/D-08/D-09). Implementation followed the plan and the Beneficios precedent exactly.

## Deviations from Plan

None - plan executed exactly as written.

The only structural note: Task 3 ("append describe blocks") was satisfied incrementally during Tasks 1 and 2 because TDD requires each describe block to land before (and commit with) its implementation. The resulting test file matches Task 3's acceptance criteria verbatim (Wave-2 marker comment + three describe blocks with the exact literal assertion strings; the 05-01 Sucursales/Branch blocks untouched).

## Issues Encountered
- The fresh worktree had no `node_modules`; ran `yarn install` (Yarn 4.9.3, node-modules linker) before tests. This is environment setup, not a code change.

## Known Stubs
None. All fields are wired to editable settings; no placeholder/empty data sources.

## Threat Flags
None. Text fields render as JSX children (React auto-escapes); no `dangerouslySetInnerHTML`; `body` is a plain `textarea`; `ctaUrl`/`url` use the platform-validated `url` setting with a `|| "#"` fallback. The FaqPill empty-url path renders an inert `disabled` button (T-05-07 mitigated).

## Next Phase Readiness
- Two of three info sections shipped (Sucursales 05-01, EnviosNacionales 05-02). The shared test file and registry are ready for plan 05-03 (Blogs + BlogCard) to append alongside.
- No blockers.

## Self-Check: PASSED

- FOUND: src/blocks/FaqPill/FaqPill.tsx
- FOUND: src/blocks/FaqPill/index.ts
- FOUND: src/sections/EnviosNacionales/EnviosNacionales.tsx
- FOUND: src/sections/EnviosNacionales/index.ts
- FOUND commit: d0b2478 (Task 1)
- FOUND commit: 0443e85 (Task 2)

---
*Phase: 05-info-sections*
*Completed: 2026-06-25*
