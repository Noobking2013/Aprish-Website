import { MODULES, PRICING, PRODUCT, type ModuleSpec } from "@/content/copy";
import { FEATURES, chipFor } from "@/content/status";
import { SITE } from "@/content/config";
import { FEATURE_ICON } from "@/features/home/featureIcons";
import { Safety } from "@/features/home/Safety";
import { RoiCalculator } from "@/features/home/RoiCalculator";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * /product (docs/02 §product).
 *
 * The page is a header plus four bands, and two of them ARE Home sections: the Safety model
 * (Home 5) and the ROI calculator (Home 7) are the same components, imported here rather than
 * copied, so /product can never show a different safety story than Home.
 *
 * The pricing band renders only when `SITE.showPricing` is true (docs/02 §product 5, docs/09
 * D17). The deck's tiers are marked "confirm they are current", so the default build ships
 * without a single price on the page.
 *
 * Every chip is read from FEATURES via `chipFor`, and each module's one-liner lives in copy.ts,
 * so neither the text nor the chip can claim a status the other disagrees with.
 */

/** One card in the modules grid. The icon and the chip both key off the same FeatureKey. */
function ModuleCard({ spec }: { spec: ModuleSpec }) {
  const feature = FEATURES[spec.feature];
  const chip = chipFor(feature.status);
  const Icon = FEATURE_ICON[spec.feature];

  return (
    <li className="rounded-3xl border border-teal-900/10 bg-cream-50 p-6">
      <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-teal-900">{feature.name}</h3>
        <span className="chip" data-status={chip.status}>
          {chip.label}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-teal-800">{spec.blurb}</p>
    </li>
  );
}

/** docs/02 §product 5. Hidden unless the founder flips SITE.showPricing. */
function Pricing() {
  return (
    <section
      aria-labelledby="pricing-title"
      data-nav-theme="light"
      className="bg-cream-200 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="pricing-title"
          tabIndex={-1}
          className="display text-[clamp(2.2rem,5vw,3.5rem)] text-teal-900"
        >
          {PRICING.h2}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border bg-cream-50 p-7 ${
                tier.target ? "border-gold-500" : "border-teal-900/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-teal-900">{tier.name}</h3>
                {tier.target ? (
                  <span className="chip" data-status="planned">
                    {PRICING.targetLabel}
                  </span>
                ) : null}
              </div>
              <p className="data mt-4 text-teal-900">{tier.price}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-teal-700">{PRICING.note}</p>
      </div>
    </section>
  );
}

export function ProductPage() {
  useDocumentMeta({
    title: "Product | Aprish",
    description:
      "The Aprish modules for clinics, each with an honest status, the safety model behind Aria, and a calculator for what a no-show costs.",
  });

  return (
    <main id="main" tabIndex={-1}>
      <section
        aria-labelledby="route-title"
        data-nav-theme="light"
        className="bg-cream-50 px-6 pt-32 pb-16 md:px-10 md:pt-40 md:pb-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          <h1
            id="route-title"
            tabIndex={-1}
            className="display max-w-[40rem] text-[clamp(2.4rem,6vw,4.5rem)] text-teal-900"
          >
            {PRODUCT.h1}
          </h1>
        </div>
      </section>

      <section
        aria-labelledby="modules-title"
        data-nav-theme="light"
        className="bg-cream-100 px-6 pb-24 md:px-10 md:pb-32"
      >
        <div className="mx-auto w-full max-w-6xl">
          <h2
            id="modules-title"
            tabIndex={-1}
            className="display max-w-[36rem] text-[clamp(1.8rem,4vw,2.6rem)] text-teal-900"
          >
            {MODULES.h2}
          </h2>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="data text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                {MODULES.coreHeading}
              </h3>
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {MODULES.core.map((spec) => (
                  <ModuleCard key={spec.feature} spec={spec} />
                ))}
              </ul>
            </div>

            <div>
              <h3 className="data text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                {MODULES.augmentedHeading}
              </h3>
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {MODULES.augmented.map((spec) => (
                  <ModuleCard key={spec.feature} spec={spec} />
                ))}
              </ul>
            </div>
          </div>

          {/* docs/02 §product 2: the dashboard gets its own full-width row, not a column slot. */}
          <ul className="mt-10 grid gap-5">
            <ModuleCard spec={MODULES.inDev} />
          </ul>
        </div>
      </section>

      <Safety />
      <RoiCalculator />

      {SITE.showPricing ? <Pricing /> : null}
    </main>
  );
}
