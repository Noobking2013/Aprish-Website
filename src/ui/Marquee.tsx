import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export interface MarqueeProps {
  /** `<li>` elements. Rendered once for assistive tech; the scrolling copies are aria-hidden. */
  children: ReactNode;
  label: string;
  reverse?: boolean;
  /** Seconds for one full loop. */
  durationS?: number;
  /** Copies per half of the track; raise it when the items are narrower than the viewport. */
  copies?: number;
  className?: string;
}

/**
 * CSS-only marquee (.marquee in index.css). Pauses on hover, on keyboard focus and while
 * off-screen. Under reduced motion it stops and the first copy wraps into a static row.
 */
export function Marquee({ children, label, reverse = false, durationS = 40, copies = 2, className = "" }: MarqueeProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: "120px" });
  const total = copies * 2;

  return (
    <div
      ref={ref}
      className={`marquee ${className}`}
      data-reverse={reverse}
      data-paused={!inView}
      style={{ ["--marquee-duration" as string]: `${durationS}s` }}
    >
      <div className="marquee__track">
        {Array.from({ length: total }, (_, i) => (
          <ul
            key={i}
            className="marquee__group"
            aria-label={i === 0 ? label : undefined}
            aria-hidden={i === 0 ? undefined : true}
          >
            {children}
          </ul>
        ))}
      </div>
    </div>
  );
}
