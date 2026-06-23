# Testing Patterns

**Analysis Date:** 2026-06-23

## Test Framework

**Runner:**
- Vitest v4.1.9
- Config: `vitest.config.ts`

**Environment:**
- Node (jsdom not used as default environment)
- Tests manually construct JSDOM windows for browser-specific testing (contract tests)

**Assertion Library:**
- Vitest built-in `expect()` API
- No external assertion library required

**Run Commands:**
```bash
yarn test                  # Run all tests (vitest run)
yarn test:contract        # Run registration contract test only (build gate)
yarn build                # Build + run contract gate (vite build && yarn test:contract)
```

## Test File Organization

**Location:**
- `test/` directory at project root
- Co-located testing not used (tests separated from source)

**Naming:**
- Pattern: `*.test.ts` for test files
- Example: `registration-contract.test.ts`, `contract-hardfail.test.ts`

**Structure:**
```
test/
├── registration-contract.test.ts   # Build gate (positive case)
├── contract-hardfail.test.ts       # Automated negative proof
└── contract-assertions.ts          # Shared assertion helpers
```

## Test Structure

**Suite Organization:**
```typescript
describe("theme registration contract", () => {
  let win: any;

  beforeAll(() => {
    // Setup: initialize jsdom window, shim globals
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      runScripts: "dangerously", // allow IIFE execution
    });
    win = dom.window;
    
    // Shim external globals the IIFE reads
    win.React = React;
    win.ReactDOM = {};
    win.jsxRuntime = jsxRuntime;
    win.cva = cva;
    win.clsx = clsx;
    win.twMerge = twMerge;
    win.LucideReact = LucideReact;
    
    // Load the built bundle and eval in jsdom context
    const bundle = readFileSync(
      resolve(__dirname, "../dist/theme.bundle.js"),
      "utf-8",
    );
    win.eval(bundle);
  });

  it("registers under the package.json name", () => {
    expect(win.__THETA_THEMES__[EXPECTED_NAME]).toBeDefined();
  });

  it("has non-empty sections", () => {
    const mod = win.__THETA_THEMES__[EXPECTED_NAME];
    expect(Object.keys(mod.sectionsComponents ?? {}).length).toBeGreaterThan(0);
  });
});
```

**Patterns:**
- `beforeAll()` for expensive setup (jsdom initialization, bundle eval)
- `let win: any` for shared window state across tests in a suite
- Direct window object assertions (e.g., `win.__THETA_THEMES__[EXPECTED_NAME]`)
- Type narrowing with optional chaining and nullish coalescing

## Contract Testing (Build Gate)

**What it Tests:**
- Theme bundle self-registers on `window.__THETA_THEMES__` under the package.json name
- Registration key is NOT a hardcoded literal (guards against shipping stale theme copies)
- Bundle has non-empty sections (platform requirement)
- Module name matches the registration key

**Key Files:**
- `test/registration-contract.test.ts` — loads the built `dist/theme.bundle.js` in jsdom and verifies contract
- `test/contract-hardfail.test.ts` — automated negative proof: synthesizes a wrong-key registration and asserts the contract VIOLATES
- `test/contract-assertions.ts` — shared helper function used by both tests

**Integration with Build:**
```bash
yarn build  # runs: vite build && yarn test:contract
```
The build gate exits non-zero if any contract test fails, preventing a broken bundle from shipping.

**Security Model (ASVS V14):**
- `registration-contract.test.ts` only evals the locally-built `dist/theme.bundle.js` (controlled, in-repo artifact)
- `contract-hardfail.test.ts` only evals a synthetic, in-test registration string (controlled local string)
- Never evals remote/untrusted bundles or URLs
- Protects against supply-chain threats

## Mocking

**Framework:** Vitest built-in mocking (no external mock library configured)

**Patterns:**
- Direct object shimming (not full mocking) — contract tests shim globals by direct assignment:
  ```typescript
  win.React = React;  // import the real React peer
  win.clsx = clsx;    // import the real clsx peer
  ```
- Minimal shims for unimplemented globals:
  ```typescript
  win.ReactDOM = {};  // object shim (not called during registration)
  win.process = { env: { NODE_ENV: "production" } }; // jsdom lacks process global
  ```

**What to Mock:**
- External globals required for IIFE execution (React, external npm packages)
- Process environment for jsdom context (`process.env.NODE_ENV`)

**What NOT to Mock:**
- Application logic (theme components, settings schemas)
- Bundle content (contract tests always use the real built bundle, never mocks)

## Fixtures and Factories

**Test Data:**
- No dedicated test data factories (registration tests are stateless)
- Contract assertions use `package.json` name as single source of truth:
  ```typescript
  const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
  const EXPECTED_NAME: string = pkg.name;
  ```

**Location:**
- Test data derived from `package.json` (single source of truth for theme identity)
- Synthetic test data created inline in test (e.g., `WRONG_NAME = "some-other-theme"`)

## Coverage

**Requirements:** Not enforced (no coverage thresholds configured)

**Scope of Tests:**
- Contract tests verify bundle integrity and self-registration (critical path for build gate)
- Component rendering not tested in unit tests (React components are visual/setting-driven)
- No integration tests for component rendering in jsdom (handled by host platform)

## Test Types

**Contract Tests (what exists):**
- **Scope:** Bundle integrity, registration contract, build-time verification
- **Approach:** Load built bundle in jsdom, verify `window.__THETA_THEMES__` registration
- **Location:** `test/registration-contract.test.ts`, `test/contract-hardfail.test.ts`

**Unit Tests (not present):**
- Component rendering is not unit-tested (components are presentation-only, settings-driven)
- Utility functions (`cn`, `hasNoDisplayFields`) are simple enough to not require tests
- Settings schemas are declarative (no logic to test)

**Integration Tests (not present):**
- Component integration with blocks/sections tested by host platform
- Bundle integration tested via contract gates

**E2E Tests (not present):**
- Theme customization and publishing flows tested by host platform
- Not applicable to this theme bundle

## Vitest Configuration

**Config File:** `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,  // `describe`, `it`, `expect` available without imports
    include: ["test/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

**Key Settings:**
- `globals: true` — vitest global API available (no need to import describe/it/expect)
- No jsdom environment (tests construct JSDOM manually when needed)
- Path alias `@` configured for consistency with build (not used in tests, but available)
- Comment in config: "Environment stays the default (node) — each test constructs its own JSDOM window manually, so no global jsdom environment is needed."

## Test Patterns

### Async Testing

**Not used in current tests** — all contract tests are synchronous:
- Bundle load is synchronous `readFileSync()`
- JSDOM evaluation is synchronous `win.eval()`

When async tests are needed:
```typescript
it("async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Error Testing / Contract Violations

```typescript
it("the shared contract assertions THROW on the wrong-key bundle", () => {
  expect(() => assertContract(win, EXPECTED_NAME)).toThrow();
});
```

Pattern: wrap the function that should throw in an arrow function passed to `expect()`

**Contract Assertion Errors:**
```typescript
throw new Error(
  `Contract violation: __THETA_THEMES__["${expectedName}"] is not defined ` +
  `(keys: ${JSON.stringify(Object.keys(registry))})`,
);
```
Errors are descriptive, include context (actual keys found), and help debugging

## Shared Assertion Helper

**Location:** `test/contract-assertions.ts`

**Purpose:** Centralized contract logic used by both positive and negative tests

**Exports:**
```typescript
export function assertContract(win: any, expectedName: string): void
```

**Behavior:**
- Throws descriptive error on first violated assertion
- Four checks:
  1. Registration exists under package.json name
  2. Registry has exactly one key (the expected name — guards against stale copies)
  3. Non-empty sections present
  4. Module name matches registration key

**Used By:**
- `registration-contract.test.ts` — asserts DOES NOT throw
- `contract-hardfail.test.ts` — asserts DOES throw on wrong-key bundle

---

*Testing analysis: 2026-06-23*
