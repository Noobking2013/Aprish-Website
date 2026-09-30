import { LogoParticles } from "@/features/brand/LogoParticles";
import { HERO } from "@/content/copy";

/**
 * The logo dot canvas plus the two glass cards that overlap it (docs/02, Home section 1).
 *
 * The box keeps the 804:534 aspect of the source PNG, so the mark can never be clipped
 * or squashed, and the canvas is capped at 660px (doc 06). Both cards are
 * `pointer-events-none` so they never steal the cursor from the repulsion field.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[660px] select-none">
      <div className="relative aspect-[804/534] w-full">
        <LogoParticles className="h-full w-full" />
      </div>

      <figure className="glass glass--light float-soft pointer-events-none absolute -bottom-5 -left-1 w-[16rem] rounded-2xl p-4 sm:-left-6 sm:w-[17.5rem]">
        <figcaption className="data text-[0.6rem] uppercase tracking-[0.16em] text-coral-700">
          {HERO.floatingCard.label}
        </figcaption>
        <p className="data mt-2 text-[0.78rem] leading-relaxed text-teal-900">
          {HERO.floatingCard.body}
        </p>
      </figure>

      <div className="glass glass--light float-soft pointer-events-none absolute -top-3 right-1 flex items-center gap-2 rounded-full px-3.5 py-1.5 [animation-delay:-2.4s] sm:right-3">
        <span className="pulse-dot h-2 w-2 rounded-full bg-peach-400" aria-hidden="true" />
        <span className="text-xs font-semibold whitespace-nowrap text-teal-900">
          {HERO.aliveBadge}
        </span>
      </div>
    </div>
  );
}
