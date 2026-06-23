/**
 * Shared registration-contract assertions.
 *
 * Both the positive contract test (registration-contract.test.ts) and the
 * automated negative proof (contract-hardfail.test.ts) run the EXACT same
 * four assertions against a jsdom window's `__THETA_THEMES__` registry, so the
 * negative test proves the same logic the build gate relies on.
 *
 * Throws on the first violated assertion (so callers can wrap it in
 * `expect(() => assertContract(...)).toThrow()`).
 */
export function assertContract(win: any, expectedName: string): void {
  const registry = win.__THETA_THEMES__ ?? {};

  // (1) Registered under the package.json name.
  const mod = registry[expectedName];
  if (mod === undefined || mod === null) {
    throw new Error(
      `Contract violation: __THETA_THEMES__["${expectedName}"] is not defined ` +
        `(keys: ${JSON.stringify(Object.keys(registry))})`,
    );
  }

  // (2) The registry key is NOT a stale hardcoded literal — only the
  //     package name is present (guards against shipping a theme that
  //     registers under a leftover/copied name from another theme).
  const keys = Object.keys(registry);
  if (keys.length !== 1 || keys[0] !== expectedName) {
    throw new Error(
      `Contract violation: expected exactly one registration key ` +
        `["${expectedName}"] but found ${JSON.stringify(keys)}`,
    );
  }

  // (3) Non-empty sections — the platform requires at least one section.
  const sectionCount = Object.keys(mod.sectionsComponents ?? {}).length;
  if (sectionCount <= 0) {
    throw new Error(
      `Contract violation: "${expectedName}" registered with empty ` +
        `sectionsComponents`,
    );
  }

  // (4) The module's own name matches the registration key.
  if (mod.name !== expectedName) {
    throw new Error(
      `Contract violation: module name "${mod.name}" does not match ` +
        `registration key "${expectedName}"`,
    );
  }
}
