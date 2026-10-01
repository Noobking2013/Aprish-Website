import { BETA } from "@/content/copy";
import { BetaForm } from "@/features/beta/BetaForm";

/**
 * Home, section 8 (docs/02 §8): the beta CTA, on the peach-400 band.
 *
 * The H2 and the body sit on the band; the working form sits in a cream card (BetaForm) so its
 * coral-700 error text keeps the contrast the palette guarantees. Nothing here fakes success —
 * the form's rules live in src/lib/beta.ts and docs/09 D16.
 *
 * `data-nav-theme="light"` because peach-400 is a light surface: the navbar keeps its dark text.
 */
export function BetaCta() {
  return (
    <section
      aria-labelledby="beta-title"
      data-nav-theme="light"
      className="bg-peach-400 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="data text-xs font-semibold tracking-[0.18em] text-teal-950">{BETA.tagline}</p>
          <h2
            id="beta-title"
            tabIndex={-1}
            className="display mt-4 text-[clamp(2.2rem,5vw,3.5rem)] text-teal-950"
          >
            {BETA.h2}
          </h2>
          <p className="lead mt-6 max-w-[34rem] text-teal-900">{BETA.body}</p>
        </div>
        <div className="self-start">
          <BetaForm />
        </div>
      </div>
    </section>
  );
}
