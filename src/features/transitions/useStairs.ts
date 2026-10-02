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
/* Hard ceiling on a single transition. If a cover/reveal pair has still not settled by
   then — a dropped rAF, a chunk that never resolves, any race we have not foreseen — the
   state machine is forced back to rest, so the bars can never stay covering the site. */
const TRANSITION_WATCHDOG_MS = 8000;

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
  /* The in-flight `go`, so a browser back/forward can cancel it instead of racing it. */
  const pendingRef = useRef<{ cancelled: boolean } | null>(null);
  /* Last-resort timer that forces a stuck transition to settle (see resetTransition). */
  const watchdogRef = useRef<gsap.core.Tween | null>(null);

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
      watchdogRef.current?.kill();
      watchdogRef.current = null;
    };
  }, []);

  /** Cancel the last-resort watchdog — a normal settle always disarms it. */
  const disarmWatchdog = useCallback(() => {
    watchdogRef.current?.kill();
    watchdogRef.current = null;
  }, []);

  /**
   * Force the transition state machine back to rest: cancel the in-flight `go` (its
   * cover/reveal tweens and the not-yet-fired navigate), release the scroll lock and take
   * the bars down. Browser back/forward cannot be intercepted, so the POP handler calls
   * this first — the user's navigation wins and a half-finished transition can never leave
   * `busyRef` or the overlay stuck (which is what froze the site).
   */
  const resetTransition = useCallback(() => {
    disarmWatchdog();
    if (pendingRef.current) {
      pendingRef.current.cancelled = true;
      pendingRef.current = null;
    }
    animationsRef.current.forEach((animation) => animation.kill());
    animationsRef.current.length = 0;
    if (overlayRef.current) gsap.set(overlayRef.current, { opacity: 1 });
    busyRef.current = false;
    setIsBusy(false);
    setOverlayActive(false);
    unlockScroll();
  }, [disarmWatchdog]);

  /** Arm the last-resort watchdog for the transition that is about to start. */
  const armWatchdog = useCallback(() => {
    watchdogRef.current?.kill();
    watchdogRef.current = gsap.delayedCall(TRANSITION_WATCHDOG_MS / 1000, resetTransition);
  }, [resetTransition]);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  const closeMenu = useCallback(
    (options?: { returnFocus?: boolean }) => {
      setMenuOpen(false);
      if (options?.returnFocus === false) return;
      track(gsap.delayedCall(MENU_CLOSE_TOTAL, () => menuButtonRef.current?.focus()));
    },
    [track],
  );

  const finish = useCallback(
    (to: string) => {
      disarmWatchdog();
      pendingRef.current = null;
      setAnnouncement(`${routeName(to)} page`);
      focusRouteTitle();
      unlockScroll();
      busyRef.current = false;
      setIsBusy(false);
    },
    [disarmWatchdog],
  );

  const go = useCallback(
    (to: string, opts?: { fromMenu?: boolean }) => {
      const fromMenu = opts?.fromMenu === true;

      // Two guards: never stack transitions, never re-enter the current route.
      if (busyRef.current) return;
      if (!fromMenu && to === pathname) return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      setLabelText(routeName(to));
      armWatchdog();

      /* Menu link: the menu bars already cover the screen, so the close timeline IS
         the reveal and a second cover must not run. */
      if (fromMenu) {
        // Already on this page: just close the menu, do not replay a page-enter on it.
        if (to === pathname) {
          disarmWatchdog();
          closeMenu();
          return;
        }

        busyRef.current = true;
        setIsBusy(true);
        lockScroll(); // balances the unlockScroll() in finish()

        const pending = { cancelled: false };
        pendingRef.current = pending;

        // Never swap routes before the chunk is ready: the menu bars keep covering the
        // screen while a slow lazy chunk loads.
        void preload(to)
          .catch(() => undefined)
          .then(() => {
            if (pending.cancelled) return;
            navigate(to);
            window.scrollTo(0, 0); // the menu path used to land mid-page
            closeMenu({ returnFocus: false });
            track(buildPageEnter(getRouteRoot(), PAGE_ENTER_DELAY));
            track(gsap.delayedCall(MENU_CLOSE_TOTAL, () => finish(to)));
          });
        return;
      }

      /* Reduced motion: one short fade, no bars and no scale. */
      if (prefersReducedMotion) {
        busyRef.current = true;
        setIsBusy(true);
        lockScroll();
        setOverlayActive(true);
        gsap.set(overlay, { opacity: 0 });

        const pending = { cancelled: false };
        pendingRef.current = pending;

        track(
          gsap.to(overlay, {
            opacity: 1,
            duration: REDUCED_FADE_DURATION,
            ease: "power1.out",
            onComplete: () => {
              if (pending.cancelled) return;
              navigate(to);
              window.scrollTo(0, 0);
              void nextFrame().then(() => {
                if (pending.cancelled) return;
                track(
                  gsap.to(overlay, {
                    opacity: 0,
                    duration: REDUCED_FADE_DURATION,
                    ease: "power1.in",
                    onComplete: () => {
                      if (pending.cancelled) return;
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

      // Cancellable: a back/forward mid-flight aborts this run instead of racing it.
      const pending = { cancelled: false };
      pendingRef.current = pending;

      // Warm the chunk immediately, in parallel with the cover.
      const chunkReady = preload(to);
      const cover = buildCover(bars(), labelRef.current);
      // Built paused so the bars are already covering when the route swaps beneath them.
      const reveal = buildReveal(bars(), labelRef.current, true);
      track(cover);
      track(reveal);

      const settle = () => {
        if (pendingRef.current === pending) pendingRef.current = null;
        setOverlayActive(false);
        finish(to);
      };

      cover.eventCallback("onComplete", () => {
        if (pending.cancelled) return;
        void Promise.all([chunkReady, nextFrame()])
          .then(() => {
            if (pending.cancelled) return;
            navigate(to);
            window.scrollTo(0, 0);
            return nextFrame();
          })
          .then(() => {
            if (pending.cancelled) return;
            track(buildPageEnter(getRouteRoot(), PAGE_ENTER_DELAY));
            reveal.eventCallback("onComplete", settle);
            reveal.play();
          })
          .catch(() => {
            // A failed chunk must never leave the visitor stuck under the bars.
            if (pending.cancelled) return;
            settle();
          });
      });

      cover.play();
    },
    [armWatchdog, bars, closeMenu, disarmWatchdog, finish, navigate, pathname, prefersReducedMotion, track],
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

  /* Keep the last-revealed path in step with PUSH navigations too: without this,
     / -> /join (PUSH) then Back compares with a stale path and skips the reveal. */
  useEffect(() => {
    if (navigationType !== "POP") previousPathRef.current = pathname;
  }, [pathname, navigationType]);

  /* Browser back / forward cannot be intercepted, so they get a reveal-only pass. */
  useGSAP(
    () => {
      if (navigationType !== "POP") return;

      const isNewPath = previousPathRef.current !== pathname;
      // A dev-only StrictMode remount must finish a reveal it interrupted.
      const resumingInterruptedReveal = !isNewPath && !revealDoneRef.current;
      previousPathRef.current = pathname;
      if (!isNewPath && !resumingInterruptedReveal) return;

      /* The user's back/forward must win: abort any `go` still mid-flight (its pending
         navigate and its bars) and clear the busy/scroll state before revealing, so a
         half-finished transition can never freeze the site. */
      resetTransition();

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
    { scope: rootRef, dependencies: [pathname, navigationType, prefersReducedMotion, bars, resetTransition] },
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

  /* Reflect the in-flight transition on #route-root. `aria-busy` is the a11y signal;
     index.css also reads it to make route content visibly non-interactive, so a click
     during a transition reads as disabled rather than being silently dropped. */
  useEffect(() => {
    const root = getRouteRoot();
    if (!root) return;
    root.setAttribute("aria-busy", String(isBusy));
    return () => {
      root.removeAttribute("aria-busy");
    };
  }, [isBusy]);

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
