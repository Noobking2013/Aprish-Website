import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { LockKeyhole } from "lucide-react";
import { SAFETY } from "@/content/copy";
import { PRIVACY, chipFor } from "@/content/status";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** docs/02 §5: the peach pulse runs node 1 -> 4 once. Three hops plus the closing fade = 2.4s. */
const HOP = 0.75;
const FADE = 0.15;
/** Node centres sit at (i + 0.5) / N of the row, so one hop is exactly one column. */
const HOP_FRACTION = 1 / SAFETY.nodes.length;

/**
 * Home, section 5 (docs/02 "Home 5"): cream-200.
 *
 * The four nodes are one `<ol>` on a four-column grid with no gap at `lg`, so the column
 * centres are exactly 12.5% / 37.5% / 62.5% / 87.5% of the width — which is what lets the
 * pulse be positioned and moved in percentages and still land on each node. Below `lg` the
 * nodes wrap, where a left-to-right pulse would be a lie, so the connector and the pulse are
 * `lg`-only.
 *
 * The pulse animates `x` (a transform) on a dot that is centred with `margin`, never with a
 * `transform`, so GSAP's transform is the only transform on the element. The timeline is
 * built once, started by a single-shot IntersectionObserver, and killed by `useGSAP`'s
 * cleanup. Under reduced motion no timeline is built at all and the dot stays at `opacity: 0`.
 *
 * The privacy strip renders `PRIVACY` through `chipFor`, so an unset status shows the grey
 * "To be confirmed" chip *as text*, not as a colour the reader has to decode.
 */
export function Safety() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (reduced) return;

      const track = trackRef.current;
      const dot = dotRef.current;
      if (!track || !dot || typeof IntersectionObserver === "undefined") return;

      const hop = track.clientWidth * HOP_FRACTION;
      const timeline = gsap.timeline({ paused: true });
      timeline
        .set(dot, { opacity: 1 })
        .to(dot, { x: hop, duration: HOP, ease: "power2.inOut" })
        .to(dot, { x: hop * 2, duration: HOP, ease: "power2.inOut" })
        .to(dot, { x: hop * 3, duration: HOP, ease: "power2.inOut" })
        .to(dot, { opacity: 0, duration: FADE, ease: "power1.out" });

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          timeline.play(0);
        },
        { threshold: 0.35 },
      );

      observer.observe(track);

      return () => {
        observer.disconnect();
        timeline.kill();
        gsap.set(dot, { clearProps: "transform", opacity: 0 });
      };
    },
    { dependencies: [reduced] },
  );

  return (
    <section
      aria-labelledby="safety-title"
      data-nav-theme="light"
      className="bg-cream-200 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="safety-title"
          tabIndex={-1}
          className="display max-w-[36rem] text-[clamp(2.2rem,5vw,3.5rem)] text-teal-900"
        >
          {SAFETY.h2}
        </h2>

        <div className="relative mt-14">
          {/* Decorative: one SVG connector line over a strip, plus the travelling pulse.
              Both are lg-only because the nodes wrap below that. */}
          <div ref={trackRef} aria-hidden="true" className="relative hidden h-8 lg:block">
            <svg
              preserveAspectRatio="none"
              className="absolute inset-x-[12.5%] top-1/2 h-0.5 -translate-y-1/2 text-teal-900/25"
            >
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span ref={dotRef} className="safety-pulse" />
          </div>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {SAFETY.nodes.map((node) => (
              <li
                key={node.title}
                className={`safety-node px-5 py-5 lg:mx-2 ${
                  node.emphasis ? "safety-node--on" : ""
                }`}
              >
                <p className="font-semibold text-teal-900">{node.title}</p>
                <p className="mt-1 text-sm text-teal-700">{node.sub}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <ul className="space-y-4">
            {SAFETY.points.map((point) => (
              <li key={point} className="flex gap-3 text-teal-800">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>

          <div className="rounded-3xl border border-teal-900/10 bg-cream-50 p-7">
            <h3 className="display text-xl text-teal-900">{SAFETY.privacyHeading}</h3>
            <p className="mt-2 text-sm text-teal-600">{SAFETY.privacyNote}</p>

            <ul className="mt-5 space-y-2">
              {PRIVACY.map((item) => {
                const chip = chipFor(item.status);

                return (
                  <li
                    key={item.label}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-900/10 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-teal-800">{item.label}</span>
                    <span className="chip" data-status={chip.status}>
                      {chip.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
