# Theme Site Template

This is a Next.js template for deploying themes as standalone websites.

## Environment Variables

- `NEXT_PUBLIC_STRAPI_URL` - Strapi base URL (without /graphql suffix, e.g., `https://theta-strapi.ngrok.app`)
- `NEXT_PUBLIC_STRAPI_TOKEN` - Strapi access token
- `NEXT_PUBLIC_THEME_BUNDLE_URL` - URL to the theme bundle JavaScript file
- `NEXT_PUBLIC_THEME_NAME` - Name of the theme (used for loading from window.__THETA_THEMES__)
- `NEXT_PUBLIC_SITE_SUBDOMAIN` - Subdomain for this site

## Build Process

1. Fetches all pages from Strapi at build time
2. Generates static routes for each page slug
3. Builds Next.js app with theme bundle
4. Deploys to Vercel

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
