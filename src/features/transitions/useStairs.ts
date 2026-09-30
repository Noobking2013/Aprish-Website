import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { preload, routeName } from "./routes";
import { lockScroll, unlockScroll } from "./scrollLock";
import {
  MENU_CLOSE_TOTAL,
  PAGE_ENTER_DELAY,
  REDUCED_FADE_DURATION,
  buildCover,
  buildPageEnter,
  buildReveal,
} from "./timelines";
import type { TransitionContextValue } from "./useTransition";

const FONT_LOAD_TIMEOUT_MS = 1200;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function getRouteRoot(): HTMLElement | null {
  return document.getElementById("route-root");
}

function focusRouteTitle(): void {
  document.getElementById("route-title")?.focus({ preventScroll: true });
}

export interface StairsState {
  api: TransitionContextValue;
  rootRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  labelRef: RefObject<HTMLDivElement | null>;
  starRef: RefObject<HTMLSpanElement | null>;
  overlayActive: boolean;
  labelText: string;
  announcement: string;
}

/**
 * All of the stairs motion, in one place.
 *
 * Ordering guarantee: `navigate()` is only ever called from the cover timeline's
 * onComplete (or, for menu links, after the menu has already covered the screen),
 * so a new page is never painted before the bars hide it.
 */
export function useStairs(): StairsState {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const busyRef = useRef(false);
  const loaderFinishedRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);
  const revealDoneRef = useRef(true);
  const animationsRef = useRef<gsap.core.Animation[]>([]);

  const prefersReducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // Starts true so the very first paint is already covered by the loader bars.
  const [overlayActive, setOverlayActive] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [labelText, setLabelText] = useState(() => routeName(pathname));

  const bars = useCallback(
    () => Array.from(overlayRef.current?.querySelectorAll<HTMLElement>(".stair") ?? []),
    [],
  );

  const track = useCallback((animation: gsap.core.Animation) => {
    animationsRef.current.push(animation);
    return animation;
  }, []);

  /* Kill anything still live on unmount. Animations created inside event handlers
     are not owned by useGSAP's context, so they are tracked manually. */
  useEffect(() => {
    const animations = animationsRef.current;
    return () => {
      animations.forEach((animation) => animation.kill());
      animations.length = 0;
    };
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  const closeMenu = useCallback(
    (options?: { returnFocus?: boolean }) => {
      setMenuOpen(false);
      if (options?.returnFocus === false) return;
      track(gsap.delayedCall(MENU_CLOSE_TOTAL, () => menuButtonRef.current?.focus()));
    },
    [track],
  );

  const finish = useCallback((to: string) => {
    setAnnouncement(`${routeName(to)} page`);
    focusRouteTitle();
    unlockScroll();
    busyRef.current = false;
    setIsBusy(false);
  }, []);

  const go = useCallback(
    (to: string, opts?: { fromMenu?: boolean }) => {
      const fromMenu = opts?.fromMenu === true;

      // Two guards: never stack transitions, never re-enter the current route.
      if (busyRef.current) return;
      if (!fromMenu && to === pathname) return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      setLabelText(routeName(to));

      /* Menu link: the menu bars already cover the screen, so the close timeline IS
         the reveal and a second cover must not run. */
      if (fromMenu) {
        busyRef.current = true;
        setIsBusy(true);
        navigate(to);
        closeMenu({ returnFocus: false });
        track(buildPageEnter(getRouteRoot(), PAGE_ENTER_DELAY));
        track(gsap.delayedCall(MENU_CLOSE_TOTAL, () => finish(to)));
        return;
      }

      /* Reduced motion: one short fade, no bars and no scale. */
      if (prefersReducedMotion) {
        busyRef.current = true;
        setIsBusy(true);
        lockScroll();
        setOverlayActive(true);
        gsap.set(overlay, { opacity: 0 });

        track(
          gsap.to(overlay, {
            opacity: 1,
            duration: REDUCED_FADE_DURATION,
            ease: "power1.out",
            onComplete: () => {
              navigate(to);
              window.scrollTo(0, 0);
              void nextFrame().then(() => {
                track(
                  gsap.to(overlay, {
                    opacity: 0,
                    duration: REDUCED_FADE_DURATION,
                    ease: "power1.in",
                    onComplete: () => {
                      gsap.set(overlay, { opacity: 1 });
                      setOverlayActive(false);
                      finish(to);
                    },
                  }),
                );
              });
            },
          }),
        );
        return;
      }

      /* Full stairs: cover, swap while covered, reveal. */
      busyRef.current = true;
      setIsBusy(true);
      lockScroll();
      setOverlayActive(true);

      // Warm the chunk immediately, in parallel with the cover.
      const chunkReady = preload(to);
      const cover = buildCover(bars(), labelRef.current);
      const reveal = buildReveal(bars(), labelRef.current);
      track(cover);
      track(reveal);

      cover.eventCallback("onComplete", () => {
        void Promise.all([chunkReady, nextFrame()])
          .then(() => {
            navigate(to);
            window.scrollTo(0, 0);
            return nextFrame();
          })
          .then(() => {
            track(buildPageEnter(getRouteRoot(), PAGE_ENTER_DELAY));
            reveal.eventCallback("onComplete", () => {
              setOverlayActive(false);
              finish(to);
            });
            reveal.play();
          })
          .catch(() => {
            // A failed chunk must never leave the visitor stuck under the bars.
            setOverlayActive(false);
            finish(to);
          });
      });

      cover.play();
    },
    [bars, closeMenu, finish, navigate, pathname, prefersReducedMotion, track],
  );

  /* First load: the site loads behind its own loader. The bars are already
     covering (initial state), a gold star turns until the fonts are ready,
     then the bars step away. */
  useGSAP(
    () => {
      if (!overlayRef.current) return;

      if (prefersReducedMotion) {
        setOverlayActive(false);
        return;
      }

      if (loaderFinishedRef.current) return;

      // The loader is the one moment the label is visible without a cover tween.
      gsap.set(labelRef.current, { opacity: 1, y: 0 });

      const spin = starRef.current
        ? gsap.to(starRef.current, { rotate: 360, duration: 2.4, ease: "none", repeat: -1 })
        : null;

      let cancelled = false;
      const fontsReady = document.fonts?.ready
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();
      const timeout = new Promise<void>((resolve) => {
        window.setTimeout(resolve, FONT_LOAD_TIMEOUT_MS);
      });

      void Promise.race([fontsReady, timeout]).then(() => {
        if (cancelled) return;
        spin?.kill();
        if (starRef.current) gsap.set(starRef.current, { rotate: 0 });

        const barEls = bars();
        gsap.set(barEls, { height: "100%", y: 0 });
        const reveal = buildReveal(barEls, labelRef.current);
        reveal.eventCallback("onComplete", () => {
          loaderFinishedRef.current = true;
          setOverlayActive(false);
        });
        reveal.play();
      });

      return () => {
        cancelled = true;
        spin?.kill();
      };
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, bars] },
  );

  /* Browser back / forward cannot be intercepted, so they get a reveal-only pass. */
  useGSAP(
    () => {
      if (navigationType !== "POP") return;

      const isNewPath = previousPathRef.current !== pathname;
      // A dev-only StrictMode remount must finish a reveal it interrupted.
      const resumingInterruptedReveal = !isNewPath && !revealDoneRef.current;
      previousPathRef.current = pathname;
      if (!isNewPath && !resumingInterruptedReveal) return;

      // Warm a lazy chunk on the way back in; a POP navigation cannot be awaited.
      void preload(pathname);

      if (prefersReducedMotion) {
        revealDoneRef.current = true;
        setAnnouncement(`${routeName(pathname)} page`);
        focusRouteTitle();
        return;
      }

      window.scrollTo(0, 0);
      setOverlayActive(true);
      setLabelText(routeName(pathname));
      gsap.set(overlayRef.current, { opacity: 1 });

      const barEls = bars();
      const label = labelRef.current;
      gsap.set(barEls, { height: "100%", y: 0 });
      if (label) gsap.set(label, { opacity: 1, y: 0 });

      revealDoneRef.current = false;
      const reveal = buildReveal(barEls, label);
      reveal.eventCallback("onComplete", () => {
        revealDoneRef.current = true;
        setOverlayActive(false);
        setAnnouncement(`${routeName(pathname)} page`);
        focusRouteTitle();
      });
      reveal.play();

      return () => {
        reveal.kill();
        // Otherwise the remount would skip the reveal and leave the bars covering.
        if (!revealDoneRef.current) previousPathRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [pathname, navigationType, prefersReducedMotion, bars] },
  );

  /* Lock scrolling while the menu is open (reference-counted with the transition). */
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  /* The page behind the dialog must not be reachable by tab or screen reader. */
  useEffect(() => {
    const root = getRouteRoot();
    if (!root) return;
    root.inert = menuOpen;
    return () => {
      root.inert = false;
    };
  }, [menuOpen]);

  const api = useMemo<TransitionContextValue>(
    () => ({ go, menuOpen, openMenu, closeMenu, isBusy, menuButtonRef }),
    [closeMenu, go, isBusy, menuOpen, openMenu],
  );

  return {
    api,
    rootRef,
    overlayRef,
    labelRef,
    starRef,
    overlayActive,
    labelText,
    announcement,
  };
}
