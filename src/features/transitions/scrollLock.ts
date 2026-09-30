/**
 * Reference-counted document scroll lock.
 *
 * Both the route transition and the full-screen menu want the page frozen; a bare
 * "restore on unmount" would let whichever finishes first unlock the other's lock.
 */
let locks = 0;
let previousOverflow = "";

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  if (locks === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }
  locks += 1;
}

export function unlockScroll(): void {
  if (typeof document === "undefined") return;
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = previousOverflow;
  }
}
