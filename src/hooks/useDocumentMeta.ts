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

/** Upsert a `<meta>`. Idempotent, so StrictMode's double effects stay harmless. */
function setMeta(attr: "name" | "property", key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

/** Upsert a `<link>`. Used for the canonical. */
function setLink(rel: string, href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

/**
 * Per-route document metadata. There is no SSR here, so the effect simply writes
 * the current route's values; it is idempotent, which keeps StrictMode's
 * double-invoked effects harmless and avoids a stale title flashing mid-navigation.
 *
 * The canonical and `og:url` follow the live `origin + pathname`, so they stay
 * same-origin (and Lighthouse-valid) on localhost, previews and the real domain alike,
 * and every route gets its own. `SITE.url` still backs the future absolute Open Graph
 * tags and a sitemap (FOUNDER: real domain).
 */
export function useDocumentMeta({ title, description }: DocumentMeta): void {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.title = title;

    const url = `${window.location.origin}${window.location.pathname}`;
    setLink("canonical", url);
    setMeta("property", "og:url", url);

    if (!description) {
      return;
    }

    setMeta("name", "description", description);
  }, [title, description]);
}
