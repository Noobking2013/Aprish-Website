let pendingAnchor: string | null = null;

/** Set before a cross-route jump to Home; HomePage consumes it once the page has mounted. */
export function setPendingAnchor(id: string) {
  pendingAnchor = id;
}

export function takePendingAnchor(): string | null {
  const id = pendingAnchor;
  pendingAnchor = null;
  return id;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls to `#id`, records it in the URL without a history entry, and tells listeners
 * (the FAQ opens a deep-linked answer on `hashchange`). Returns false if the id is absent.
 */
export function scrollToAnchor(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(window.history.state, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  return true;
}
