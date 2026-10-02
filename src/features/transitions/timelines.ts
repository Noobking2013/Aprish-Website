import gsap from "gsap";

/* ------------------------------------------------------------------
   Every timing literal for the stairs and the menu lives here, so the
   provider, the menu and the focus timers cannot drift apart.
   These mirror --stairs-cover-ms / --stairs-reveal-ms in index.css, which
   are documentation only: nothing reads the CSS variables at runtime.
------------------------------------------------------------------ */

export const COVER_DURATION = 0.55;
export const COVER_STAGGER = 0.25;
export const LABEL_IN_DURATION = 0.25;
export const LABEL_OUT_DURATION = 0.2;
export const HOLD_BEFORE_REVEAL = 0.12;
export const REVEAL_DURATION = 0.6;
export const REVEAL_STAGGER = 0.25;
export const PAGE_ENTER_DURATION = 0.9;
export const PAGE_ENTER_SCALE = 1.06;
export const PAGE_ENTER_DELAY = 0.15;
export const REDUCED_FADE_DURATION = 0.16;

export const MENU_OPEN_BARS_DELAY = 0.2;
export const MENU_BARS_DURATION = 0.5;
export const MENU_BARS_STAGGER = 0.3;
export const MENU_LINK_DURATION = 0.5;
export const MENU_CLOSE_LINKS_DURATION = 0.3;
export const MENU_CLOSE_BARS_DURATION = 0.45;
export const MENU_CLOSE_OVERLAP = 0.05;
export const MENU_CLOSE_STAGGER = 0.1;

/** Time from closeMenu() until the menu is fully clear of the screen. */
export const MENU_CLOSE_TOTAL =
  MENU_CLOSE_LINKS_DURATION - MENU_CLOSE_OVERLAP + MENU_CLOSE_BARS_DURATION + MENU_CLOSE_STAGGER;

/** Bars grow from the top edge downward (height, never scaleY). */
export function buildCover(bars: HTMLElement[], label: HTMLElement | null): gsap.core.Timeline {
  const timeline = gsap.timeline();

  timeline.fromTo(
    bars,
    { height: 0, y: 0 },
    {
      height: "100%",
      duration: COVER_DURATION,
      ease: "power3.inOut",
      stagger: { amount: COVER_STAGGER, from: "end" },
    },
    0,
  );

  if (label) {
    timeline.fromTo(
      label,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: LABEL_IN_DURATION, ease: "power2.out" },
      `-=${LABEL_IN_DURATION * 0.6}`,
    );
  }

  return timeline;
}

/** Bars step away downwards; resets them to height 0 so the overlay can be hidden. */
export function buildReveal(
  bars: HTMLElement[],
  label: HTMLElement | null,
  paused = false,
): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused });

  if (label) {
    timeline.to(label, { opacity: 0, y: -12, duration: LABEL_OUT_DURATION, ease: "power2.in" }, 0);
  }

  timeline.to(
    bars,
    {
      y: "100%",
      duration: REVEAL_DURATION,
      ease: "power3.inOut",
      stagger: { amount: REVEAL_STAGGER, from: "end" },
    },
    label ? HOLD_BEFORE_REVEAL : 0,
  );

  timeline.add(() => {
    gsap.set(bars, { y: 0, height: 0 });
  });

  return timeline;
}

/** The entering page scales up slightly. clearProps must run so fixed children behave. */
export function buildPageEnter(routeRoot: HTMLElement | null, delay = 0): gsap.core.Timeline {
  const timeline = gsap.timeline();

  if (!routeRoot) return timeline;

  timeline.fromTo(
    routeRoot,
    { scale: PAGE_ENTER_SCALE, opacity: 0, transformOrigin: "50% 30%" },
    {
      scale: 1,
      opacity: 1,
      duration: PAGE_ENTER_DURATION,
      ease: "power3.out",
      clearProps: "transform,opacity",
    },
    delay,
  );

  return timeline;
}

export function buildMenuOpen(
  bars: HTMLElement[],
  links: HTMLElement[],
  header: HTMLElement | null,
): gsap.core.Timeline {
  const timeline = gsap.timeline();

  timeline.fromTo(
    bars,
    { height: 0 },
    {
      height: "100%",
      duration: MENU_BARS_DURATION,
      ease: "power3.inOut",
      delay: MENU_OPEN_BARS_DELAY,
      stagger: { amount: -MENU_BARS_STAGGER },
    },
    0,
  );

  timeline.fromTo(
    links,
    { opacity: 0, rotateX: 90 },
    {
      opacity: 1,
      rotateX: 0,
      duration: MENU_LINK_DURATION,
      ease: "power3.out",
      stagger: { amount: MENU_BARS_STAGGER },
    },
    MENU_OPEN_BARS_DELAY,
  );

  if (header) {
    timeline.fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
  }

  return timeline;
}

export function buildMenuClose(
  bars: HTMLElement[],
  links: HTMLElement[],
  header: HTMLElement | null,
): gsap.core.Timeline {
  const timeline = gsap.timeline();

  timeline.to(links, {
    opacity: 0,
    rotateX: 90,
    duration: MENU_CLOSE_LINKS_DURATION,
    ease: "power2.in",
    stagger: { amount: MENU_CLOSE_STAGGER },
  });

  timeline.to(
    bars,
    {
      height: 0,
      duration: MENU_CLOSE_BARS_DURATION,
      ease: "power3.inOut",
      stagger: { amount: MENU_CLOSE_STAGGER },
    },
    `-=${MENU_CLOSE_OVERLAP}`,
  );

  if (header) {
    timeline.to(header, { opacity: 0, duration: 0.2 }, "<");
  }

  return timeline;
}
