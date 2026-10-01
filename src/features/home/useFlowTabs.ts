import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface FlowController {
  /** The step on screen. */
  activeIndex: number;
  /** True only while the section is allowed to advance itself (docs/09 D13). */
  armed: boolean;
  /** True while hovered, focused or off-screen: the one timer pauses. */
  paused: boolean;
  select: (index: number) => void;
  back: () => void;
  next: () => void;
  /** Called on the progress bar's `animationend`. Taking over is NOT this. */
  advance: () => void;
  rowRef: RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * The Flow section's clock (docs/02 §3, docs/09 D13).
 *
 * There is no JS interval. The active pill's progress bar is a CSS animation
 * (`.flow-bar`, src/styles/index.css) and its own `animationend` calls `advance()`. That
 * keeps one writer for the clock — the bar and the six seconds can never disagree — and it
 * makes the pause just `animation-play-state`, so the underline freezes and resumes where it
 * was instead of snapping back to zero.
 *
 * `armed` is a latch made of two halves that only ever go one way:
 *   `started` flips on the first in-view intersection,
 *   `stopped` flips the moment the reader takes over (a pill, Back or Next).
 * So auto-advance begins once, is never re-armed after the reader steps in, and never runs
 * under reduced motion. Off-screen and unfocused-unhovered is a *pause*, not a stop.
 *
 * If IntersectionObserver is missing, `started` never flips and the section simply never
 * advances itself; the pills and Back/Next still work.
 */
export function useFlowTabs(total: number): FlowController {
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);

  const armed = !reduced && started && !stopped;
  const paused = hovered || focused || !inView;

  /* Off-screen is a pause: nothing is read, nothing advances. */
  useEffect(() => {
    if (reduced) return;
    const element = rowRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setInView(visible);
        if (visible) setStarted(true);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  /* Taking over is permanent: nothing below ever clears `stopped`. */
  const select = useCallback((index: number) => {
    setStopped(true);
    setActiveIndex(index);
  }, []);

  const back = useCallback(() => {
    setStopped(true);
    setActiveIndex((current) => Math.max(current - 1, 0));
  }, []);

  const next = useCallback(() => {
    setStopped(true);
    setActiveIndex((current) => Math.min(current + 1, total - 1));
  }, [total]);

  /* The bar finished, so the sequence moves on. On the last step this clamps to the same
     index, React does not re-apply `data-active`, no new animation starts — so the section
     comes to rest at 05 by construction rather than by a special case. */
  const advance = useCallback(() => {
    setActiveIndex((current) => Math.min(current + 1, total - 1));
  }, [total]);

  return {
    activeIndex,
    armed,
    paused,
    select,
    back,
    next,
    advance,
    rowRef,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
}
