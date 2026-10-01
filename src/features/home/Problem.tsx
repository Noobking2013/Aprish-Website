import { ArrowRight } from "lucide-react";
import { PROBLEM } from "@/content/copy";
import { FEATURES, chipFor } from "@/content/status";
import { TLink } from "@/features/transitions/TLink";
import { FEATURE_ICON } from "./featureIcons";

/** docs/02 §2: one tint token per card, in a fixed order. Literal classes so Tailwind sees them. */
const CARD_TINT = ["bg-tint-sand", "bg-tint-mint", "bg-tint-lavender", "bg-tint-blush"];

/**
 * Home, section 2 (docs/02 "Home 2"): teal-900 with `.on-dark`, so the shared body text
 * colour is sage-300.
 *
 * The card icons are `teal-700`, not the `coral-600` docs/02 originally recorded: coral-600
 * on these tint fills measures ~2.5:1, under the 3:1 a non-text mark needs. docs/09 D14
 * carries the decision and docs/02 was corrected to match.
 *
 * The "See how it works" link is a hash link to section 3. It goes through TLink because
 * TLink renders hash links as plain anchors (no routing), so it is still the one link
 * component on the site — and `#flow` is why Flow carries `scroll-mt-24`.
 */
export function Problem() {
  return (
    <section
      aria-labelledby="problem-title"
      data-nav-theme="dark"
      className="on-dark bg-teal-900 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="max-w-[34rem]">
          <h2
            id="problem-title"
            tabIndex={-1}
            className="display text-[clamp(2.2rem,5vw,3.5rem)] text-cream-100"
          >
            {PROBLEM.h2}
          </h2>

          <p className="lead mt-6 text-sage-300">{PROBLEM.intro}</p>

          <TLink
            to="#flow"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-peach-400 transition-colors hover:text-peach-300"
          >
            {PROBLEM.seeHow}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TLink>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2">
          {PROBLEM.cards.map((card, index) => {
            const Icon = FEATURE_ICON[card.feature];
            const chip = chipFor(FEATURES[card.feature].status);

            return (
              <li
                key={card.feature}
                className={`rounded-3xl p-6 ${CARD_TINT[index % CARD_TINT.length]}`}
              >
                <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-teal-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-teal-800">{card.body}</p>
                <span className="chip mt-4" data-status={chip.status}>
                  {chip.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
