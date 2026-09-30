import { useEffect } from "react";

export type DocumentMeta = {
  /** Sets `document.title`. Keep the "Route | Aprish" shape used in index.html. */
  title: string;
  /**
   * Optional per-route meta description. When omitted, the site-wide description
   * already present in index.html is left alone rather than blanked out.
   */
  description?: string;
};

/**
 * Per-route document metadata. There is no SSR here, so the effect simply writes
 * the current route's values; it is idempotent, which keeps StrictMode's
 * double-invoked effects harmless and avoids a stale title flashing mid-navigation.
 */
export function useDocumentMeta({ title, description }: DocumentMeta): void {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.title = title;

    if (!description) {
      return;
    }

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, [title, description]);
}
