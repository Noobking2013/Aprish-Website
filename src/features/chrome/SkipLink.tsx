import { NAV } from "@/content/copy";

/**
 * Must be the first focusable element on the page. It stays off-screen until it
 * is focused, which is the first thing a keyboard or screen-reader visitor meets.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-[100] -translate-y-24 rounded-full bg-peach-400 px-5 py-3 text-sm font-semibold text-teal-950 transition-transform duration-200 focus:translate-y-0"
    >
      {NAV.skipToContent}
    </a>
  );
}
