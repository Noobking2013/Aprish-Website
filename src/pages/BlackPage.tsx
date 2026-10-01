import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BLACK } from "@/content/copy";
import { chipFor } from "@/content/status";
import { Wordmark } from "@/features/chrome/Wordmark";
import { TLink } from "@/features/transitions/TLink";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * /black (docs/02 §black) — the Aprish Black trust-mark, currently Planned.
 *
 * Full-viewport teal-900 with the wing motif at 6%. The badge is an SVG ring in gold-500 that
 * draws itself once on arrival; the logo and the two words sit inside it. The whole ring is
 * decorative chrome, so its motion is skipped entirely under reduced motion — the ring then
 * renders already complete.
 *
 * Honesty rule (docs/03, docs/09 D17): everything below the badge is BLACK's own copy. This
 * page invents no criteria, no verifier, no cost and no timing — the deck marks all of them as
 * not yet defined, and BLACK.criteriaNote says exactly that.
 */

const RING_RADIUS = 96;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function BlackBadge() {
  const reduced = usePrefersReducedMotion();
  const ringRef = useRef<SVGCircleElement | null>(null);

  useGSAP(
    () => {
      const ring = ringRef.current;
      if (!ring) return;

      /* getTotalLength is the exact path length; the 2πr fallback keeps SSR/tests boring. */
      const length = typeof ring.getTotalLength === "function" ? ring.getTotalLength() : RING_LENGTH;
      gsap.set(ring, { strokeDasharray: length, strokeDashoffset: length });

      if (reduced) {
        gsap.set(ring, { strokeDashoffset: 0 });
        return;
      }

      const tween = gsap.to(ring, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.inOut",
        delay: 0.15,
      });

      return () => tween.kill();
    },
    { dependencies: [reduced] },
  );

  return (
    <div className="relative grid h-52 w-52 place-items-center">
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full -rotate-90 text-gold-500"
      >
        <circle
          ref={ringRef}
          cx="100"
          cy="100"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col items-center">
        <Wordmark className="text-cream-100" />
        {/* docs/02 §black: the one place ALL-CAPS wide tracking is right, because it is a badge. */}
        <span className="mt-3 text-sm font-semibold tracking-[0.3em] text-gold-500">
          {BLACK.badge.title}
        </span>
        <span className="mt-1 text-[0.7rem] font-semibold tracking-[0.34em] text-cream-100/70">
          {BLACK.badge.verified}
        </span>
      </div>
    </div>
  );
}

export function BlackPage() {
  useDocumentMeta({
    title: "Aprish Black | Aprish",
    description:
      "Aprish Black is a planned trust-mark that clinics will earn and patients will be able to check. Criteria are not published yet.",
  });

  const chip = chipFor(BLACK.status);

  return (
    <main id="main" tabIndex={-1}>
      <div
        data-nav-theme="dark"
        className="on-dark relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-teal-900 px-6 py-32 text-center"
      >
        <img
          src="/brand/wing-motif.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
        />

        <div className="relative flex flex-col items-center">
          <BlackBadge />

          <span className="chip mt-8" data-status={chip.status}>
            {chip.label}
          </span>

          <h1
            id="route-title"
            tabIndex={-1}
            className="display mt-8 max-w-[32rem] text-[clamp(2rem,4.5vw,3.2rem)] text-cream-100"
          >
            {BLACK.h2}
          </h1>

          <p className="lead mt-6 max-w-[34rem] text-sage-300">{BLACK.sub}</p>

          <p className="display mt-4 text-2xl text-peach-300 italic">{BLACK.tagline}</p>

          <p className="mt-6 max-w-[34rem] text-sm text-sage-300/80">{BLACK.criteriaNote}</p>

          <TLink
            to="/join"
            className="mt-10 inline-flex items-center rounded-full bg-peach-400 px-6 py-3 text-sm font-semibold text-teal-950 transition-colors hover:bg-peach-300"
          >
            {BLACK.cta}
          </TLink>
        </div>
      </div>
    </main>
  );
}
