import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"));

// PascalCase IIFE global name, derived from the package name so it stays in sync
// when you rename the theme. Cosmetic only (the platform reads the registry off
// window.__THETA_THEMES__, not this global), but keep it unique per theme.
const iifeGlobalName = pkg.name
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

export default defineConfig({
  define: {
    // Must be JSON.stringify'd — `define` does a raw text substitution.
    // THEME-01: __THEME_NAME__ prefers the platform-supplied THEME_NAME (set by
    // the deploy workflow from the Strapi theme name) so the built bundle
    // registers on window.__THETA_THEMES__ under the SAME name the deployed site
    // looks it up by. Falls back to package.json name for standalone/local builds.
    // __THEME_VERSION__ stays sourced from package.json.
    __THEME_NAME__: JSON.stringify(process.env.THEME_NAME || pkg.name),
    __THEME_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  publicDir: "public",
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: iifeGlobalName,
      fileName: () => "theme.bundle.js",
      formats: ["iife"],
    },
    cssCodeSplit: false,
    copyPublicDir: true,
    rollupOptions: {
      // The platform injects these as globals (see the host's
      // `applyThemeGlobals`) — never bundle them, or every theme ships a
      // redundant copy and defeats the whole externalization design. Each entry
      // below MUST have a matching `output.globals` mapping to the global name
      // the platform assigns.
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "lucide-react",
      ],
      output: {
        format: "iife",
        inlineDynamicImports: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "class-variance-authority": "cva",
          clsx: "clsx",
          "tailwind-merge": "twMerge",
          "lucide-react": "LucideReact",
        },
        entryFileNames: "theme.bundle.js",
        chunkFileNames: "theme.bundle.js",
        assetFileNames: "theme.bundle.[ext]",
      },
    },
  },
});
