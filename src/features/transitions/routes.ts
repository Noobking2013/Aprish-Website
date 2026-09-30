import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Route registry for the stairs transition.
 *
 * The two lazy pages are built here, from the only import() of each page, so that
 * a chunk warmed by TLink's prefetch is the exact same chunk React.lazy suspends on.
 * If the specifier lived in two files the two could drift and the reveal would flash
 * a Suspense fallback.
 */
const importLivePage = () => import("@/pages/LivePage");
const importBlackPage = () => import("@/pages/BlackPage");

export const LiveRoute: LazyExoticComponent<ComponentType> = lazy(() =>
  importLivePage().then((module) => ({ default: module.LivePage })),
);

export const BlackRoute: LazyExoticComponent<ComponentType> = lazy(() =>
  importBlackPage().then((module) => ({ default: module.BlackPage })),
);

/**
 * Short names used for the stairs label and the screen-reader announcement.
 * These are intentionally shorter than the menu row labels in copy.ts (MENU.links).
 */
export const ROUTE_NAMES: Record<string, string> = {
  "/": "Home",
  "/product": "Product",
  "/live": "Live bookings",
  "/black": "Aprish Black",
  "/join": "Join the beta",
  "/privacy": "Privacy",
};

export function routeName(path: string): string {
  return ROUTE_NAMES[path] ?? "Not found";
}

/** Warm the chunk for a route. Eager routes are already in the main bundle. */
export function preload(path: string): Promise<unknown> {
  if (path === "/live") return importLivePage();
  if (path === "/black") return importBlackPage();
  return Promise.resolve();
}
