import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export interface CarouselProps {
  slides: ReadonlyArray<ReactNode>;
  /** Accessible name of the carousel region. */
  label: string;
  prevLabel: string;
  nextLabel: string;
  /** e.g. (2, 3) => "Quote 2 of 3". Used for dots and slide names. */
  slideLabel: (index: number, total: number) => string;
  tone?: "light" | "dark";
  className?: string;
}

const SWIPE_PX = 40;

/**
 * WAI-ARIA carousel: arrows, dots, swipe, Left/Right keys on the region. No autoplay, so
 * nothing moves unless the user asks. Hidden slides are inert; the current slide is announced.
 */
export function Carousel({ slides, label, prevLabel, nextLabel, slideLabel, tone = "light", className = "" }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const total = slides.length;
  const dark = tone === "dark";

  const go = (next: number) => setIndex((next + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? index + 1 : index - 1);
  };

  const arrow = `grid h-11 w-11 place-items-center rounded-full border transition-colors ${
    dark ? "border-cream-100/25 text-cream-100 hover:border-cream-100/60" : "border-teal-900/15 text-teal-900 hover:border-teal-900/40"
  }`;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`rounded-3xl ${className}`}
    >
      <div
        className="overflow-hidden rounded-3xl touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        <div aria-live="polite" className="carousel-track flex" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={slideLabel(i + 1, total)}
              aria-hidden={i !== index}
              inert={i !== index}
              className="w-full shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={slideLabel(i + 1, total)}
              aria-current={i === index ? "true" : undefined}
              className="grid h-11 w-11 place-items-center"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-peach-400" : dark ? "w-2 bg-cream-100/35" : "w-2 bg-teal-900/25"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(index - 1)} aria-label={prevLabel} className={arrow}>
            <Chevron direction="left" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label={nextLabel} className={arrow}>
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
