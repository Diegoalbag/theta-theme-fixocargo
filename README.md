# theta-theme-starter

A boilerplate starter for building a theme on the Theta platform. It ships the
full build/registration/test contract plus one example section and two example
blocks (including a metaobject reference). Clone it, rename it, and start
building.

## What's inside

```
theta-theme-starter/
├── package.json          # name = the theme identity (single source of truth)
├── vite.config.ts        # IIFE library build → dist/theme.bundle.{js,css}
├── vitest.config.ts
├── tsconfig.json
├── claude.md             # full section/block + settings-type API reference
├── test/
│   ├── contract-assertions.ts        # shared registration assertions
│   ├── registration-contract.test.ts # build gate: bundle self-registers correctly
│   └── contract-hardfail.test.ts     # proves the gate rejects a wrong-key bundle
└── src/
    ├── index.ts          # registration envelope (window.__THETA_THEMES__)
    ├── index.css         # neutral design tokens (Tailwind v4)
    ├── registry.ts       # the 5 maps: sections, blocks, schemas, block config
    ├── lib/utils.ts      # cn() helper
    ├── components/ui/     # button, aspect-ratio (shadcn-style)
    ├── sections/Hero/     # example section (accepts child blocks)
    └── blocks/
        ├── Feature/       # example block (inline settings)
        └── ExampleRef/    # example metaobject_ref block (defensive rendering)
```

## How it works

The theme is built as a single **IIFE bundle**. At runtime the platform injects
`React`/`ReactDOM` as globals and loads `dist/theme.bundle.js`, which
self-registers on `window.__THETA_THEMES__[<name>]`. The `<name>` is injected at
build time from `package.json` `name` (via `__THEME_NAME__` in `vite.config.ts`),
so the name lives in exactly one place.

`yarn build` runs the Vite build **and then** a contract test that loads the
freshly-built bundle in jsdom and asserts it registered under the package name
with non-empty sections. If you accidentally ship a bundle registered under the
wrong key, the build fails.

## Getting started

```bash
yarn install
yarn build      # vite build + contract test
yarn watch      # rebuild on change (for live dev against the platform)
yarn test       # run the full test suite
```

Build outputs (git-ignored):

- `dist/theme.bundle.js` — the IIFE bundle (JS + inlined runtime)
- `dist/theme.bundle.css` — compiled Tailwind CSS
- `dist/public/` — copied public assets (if you add a `public/` folder)

## Renaming this starter for a new theme

1. **`package.json` → `name`**: set your kebab-case theme name (e.g.
   `acme-theme`). This drives the registration key, the build-time
   `__THEME_NAME__`, and the PascalCase IIFE global (derived automatically in
   `vite.config.ts`). Make it match the name the platform expects
   (`NEXT_PUBLIC_THEME_NAME`).
2. Rename the directory to match (convention).
3. Run `yarn build` — the contract test confirms the rename is consistent.

Everything else (sections, blocks, schemas, tokens) is plain TypeScript/React —
edit freely.

## Building your theme

- **Add a section**: create `src/sections/MySection/`, export the component +
  its `settingsSchema`, then register it in `src/registry.ts`
  (`sectionsComponents` + `sectionSettingsSchemas`).
- **Add a block**: create `src/blocks/MyBlock/`, export the component + schema,
  register it in `blocksComponents` + `blockSettingsSchemas`, and let sections
  accept it via `sectionBlocksConfig`.
- **Rebrand**: edit the OKLCH tokens in `src/index.css` — all components read
  through them.

See [`claude.md`](./claude.md) for the complete API: injected props, every
settings type, the `metaobject_ref` defensive contract, local/private blocks,
and the `@theme` wildcard.
