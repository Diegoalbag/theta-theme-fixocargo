"use client";

import { useEffect } from "react";

/**
 * Client-side redirect so the server never calls redirect() and throws NEXT_REDIRECT during build.
 */
export function HomeRedirect({ to }: { to: string }) {
  useEffect(() => {
    if (to && typeof window !== "undefined") {
      window.location.replace(to);
    }
  }, [to]);
  return null;
}
