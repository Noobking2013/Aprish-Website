import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export type NavTheme = "light" | "dark";

/**
 * Reports the theme of the section currently sitting under the navbar.
 *
 * Pages mark their sections with `data-nav-theme="light" | "dark"`. A thin band at
 * the top of the viewport is observed, so whichever section is in that band wins.
 * Until a section is found (and between sections) the navbar stays light.
 */
export function useNavTheme(): NavTheme {
  const [theme, setTheme] = useState<NavTheme>("light");
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    // Re-queried per route: the sections only exist once the page has committed.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));
    if (sections.length === 0) {
      setTheme("light");
      return;
    }

    const intersecting = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        });

        // Document order: the first section crossing the band is the one on screen.
        const current = sections.find((section) => intersecting.has(section));
        if (current) setTheme(current.dataset.navTheme === "dark" ? "dark" : "light");
      },
      // Only the top ~8% of the viewport counts as "under the navbar".
      { rootMargin: "0px 0px -92% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return theme;
}
