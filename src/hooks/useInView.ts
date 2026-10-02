import { useEffect, useRef, useState } from "react";

interface InViewOptions {
  /** Stay true after the first intersection (lazy render, count-up triggers). */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/** IntersectionObserver as a boolean. Without the API (old browsers, tests) it reports in view. */
export function useInView<T extends Element>({ once = false, rootMargin = "0px", threshold = 0 }: InViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView] as const;
}

/** A counter that increments every `ms` while `running`. Drives the small looping visuals. */
export function useTicker(ms: number, running: boolean): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, running]);
  return tick;
}
