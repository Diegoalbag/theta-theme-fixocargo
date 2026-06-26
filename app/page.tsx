import { redirect } from "next/navigation";
import { fetchPages } from "@/lib/strapi-client";

/** Always run on the server so redirect() works and data is fresh */
export const dynamic = "force-dynamic";

/**
 * Root page — server-side redirect to the homepage.
 * Finds the page marked isHomepage, falls back to slug "home"/"homepage"/"index",
 * then falls back to the first page. Uses Next.js redirect() for an instant 307.
 */
export default async function HomePage() {
  let pages: Awaited<ReturnType<typeof fetchPages>>;

  try {
    pages = await fetchPages();
  } catch (error) {
    console.error("Failed to load pages:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <p className="text-sm text-muted-foreground">
            Failed to load pages
          </p>
        </div>
      </div>
    );
  }

  // Find the homepage: isHomepage flag → common homepage slugs → first page
  const homepage =
    pages.find((p) => p.isHomepage) ||
    pages.find((p) => ["home", "homepage", "index"].includes(p.slug));
  const targetPath = homepage
    ? `/${homepage.slug}`
    : pages.length > 0
      ? `/${pages[0].slug}`
      : null;

  if (targetPath) {
    redirect(targetPath);
  }

  // No pages found
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">No pages found</p>
        <p className="text-sm text-muted-foreground">
          Please create pages in your CMS
        </p>
      </div>
    </div>
  );
}
