import { useEffect, useState } from "react";
import { waLink } from "@/content/config";
import { HERO } from "@/content/copy";
import { TLink } from "@/features/transitions/TLink";
import { HeroVisual } from "./HeroVisual";

const CUE_HIDE_AFTER = 32;

/**
 * Home, section 1 (docs/02_SITE_MAP_AND_SECTIONS.md).
 *
 * Only `HERO.h1Emphasis` is set in serif italic coral; the rest of the h1 stays upright,
 * so the sentence still reads as one line. `HERO.aliveBadge` lives in the pill that
 * overlaps the canvas (doc 02) and `HERO.micro` closes the text column, so no sentence
 * is printed twice on the same screen.
 */
export function Hero() {
  const [cueHidden, setCueHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setCueHidden(window.scrollY > CUE_HIDE_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Splitting keeps the emphasis inside the real heading text instead of faking it with
  // markup that screen readers read out of order.
  const [beforeEmphasis, afterEmphasis = ""] = HERO.h1.split(HERO.h1Emphasis);

  return (
    <section
      data-nav-theme="light"
      className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-cream-100 px-6 pt-32 pb-20 md:px-10 md:pt-36"
    >
      <div className="grid-faint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgb(234_163_115/0.5),transparent_70%)] blur-2xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-12">
        <div className="max-w-[34rem]">
          <p className="data text-[0.68rem] leading-relaxed uppercase tracking-[0.2em] text-coral-700">
            {HERO.tagline}
          </p>

          <h1
            id="route-title"
            tabIndex={-1}
            className="display mt-6 text-5xl text-teal-900 sm:text-6xl lg:text-[4.25rem]"
          >
            {beforeEmphasis}
            <em className="italic text-coral-600">{HERO.h1Emphasis}</em>
            {afterEmphasis}
          </h1>

          <p className="lead mt-6 text-teal-700">{HERO.sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <TLink
              to={waLink()}
              className="inline-flex items-center rounded-full bg-peach-400 px-6 py-3 text-sm font-semibold text-teal-950 shadow-[0_14px_34px_-14px_rgb(23_61_61/0.55)] transition-colors hover:bg-peach-300"
            >
              {HERO.ctaPrimary}
            </TLink>
            <TLink
              to="/join"
              className="inline-flex items-center rounded-full border border-teal-900/15 px-6 py-3 text-sm font-semibold text-teal-900 transition-colors hover:border-teal-900/40"
            >
              {HERO.ctaSecondary}
            </TLink>
          </div>

          <p className="mt-8 text-sm text-teal-600">{HERO.micro}</p>
        </div>

        <HeroVisual />
      </div>

      <div
        aria-hidden="true"
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          cueHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="scroll-cue">
          {HERO.scrollCue}
          <span className="scroll-cue__line" />
        </span>
      </div>
    </section>
  );
}
