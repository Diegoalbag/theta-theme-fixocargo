import "./index.css";
import {
  sectionsComponents,
  sectionSettingsSchemas,
  blocksComponents,
  blockSettingsSchemas,
  sectionBlocksConfig,
} from "./registry";
export * from "./registry";

// `__THEME_NAME__` / `__THEME_VERSION__` are injected at build time from
// package.json (see vite.config.ts). `name` is the single source of truth for
// the theme name and MUST match the theme name the platform expects
// (NEXT_PUBLIC_THEME_NAME).
declare const __THEME_NAME__: string;
declare const __THEME_VERSION__: string;
const themeName = __THEME_NAME__;

(window as any).__THETA_THEMES__ = (window as any).__THETA_THEMES__ || {};
(window as any).__THETA_THEMES__[themeName] = {
  name: themeName,
  version: __THEME_VERSION__,
  sectionsComponents,
  sectionSettingsSchemas,
  blocksComponents,
  blockSettingsSchemas,
  sectionBlocksConfig,
};
