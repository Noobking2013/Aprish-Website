import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface CountUpProps {
  value: number;
  /** Starts the count. Typically an IntersectionObserver flag. */
  start: boolean;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => new Intl.NumberFormat("en-IN").format(n);

/**
 * Counts from 0 to `value` with an ease-out. Layout-stable: an invisible copy of the final
 * text reserves the width, digits are tabular, and screen readers only ever hear the final value.
 * Reduced motion shows the final value immediately.
 */
export function CountUp({ value, start, prefix = "", suffix = "", durationMs = 1400, format = defaultFormat, className = "" }: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(() => (reduced ? value : 0));

  useEffect(() => {
    if (reduced) {
      setCurrent(value);
      return;
    }
    if (!start) return;
    let frame = 0;
    const startedAt = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [start, value, durationMs, reduced]);

  const finalText = `${prefix}${format(value)}${suffix}`;

  return (
    <span className={`inline-grid tabular-nums ${className}`}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {finalText}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {`${prefix}${format(current)}${suffix}`}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
