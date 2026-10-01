import { BETA, DEMO, JOIN } from "@/content/copy";
import { SITE } from "@/content/config";
import { BetaForm } from "@/features/beta/BetaForm";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * /join (docs/02 §join).
 *
 * Left: the H2 and the SAME working beta form the Home beta CTA uses (BetaForm), so there is
 * exactly one form to keep honest. Right: the WhatsApp QR with its caption, then a small
 * "who is behind Aprish" block that carries names and roles only — no photos, no bios, because
 * the founder has not supplied them yet (docs/02 §join).
 *
 * The form's promise is unchanged here: it never fakes success (src/lib/beta.ts, docs/09 D16).
 */
export function JoinPage() {
  useDocumentMeta({
    title: "Join the beta | Aprish",
    description:
      "Join the Aprish beta. Tell us about your clinic and we will set up a pilot, or scan the QR to chat with Aria on WhatsApp.",
  });

  return (
    <main id="main" tabIndex={-1}>
      <section
        aria-labelledby="route-title"
        data-nav-theme="light"
        className="bg-cream-100 px-6 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="data text-xs font-semibold tracking-[0.18em] text-coral-700 uppercase">
              {BETA.tagline}
            </p>
            <h1
              id="route-title"
              tabIndex={-1}
              className="display mt-4 max-w-[26rem] text-[clamp(2.2rem,5vw,3.5rem)] text-teal-900"
            >
              {BETA.h2}
            </h1>
            <p className="lead mt-6 max-w-[34rem] text-teal-800">{BETA.body}</p>

            <div className="mt-10">
              <BetaForm />
            </div>
          </div>

          <aside className="flex flex-col items-start gap-12 lg:items-center lg:pt-4">
            <div className="flex flex-col items-center text-center">
              <img
                src="/brand/qr-aria-whatsapp.png"
                alt={DEMO.qrAlt}
                width={200}
                height={200}
                className="h-[200px] w-[200px] rounded-2xl border border-teal-900/10 bg-cream-50 p-3"
              />
              <p className="mt-4 text-sm text-teal-700">{JOIN.qrCaption}</p>
            </div>

            <div className="w-full max-w-sm rounded-3xl border border-teal-900/10 bg-cream-50 p-7 text-left">
              <h2 className="display text-xl text-teal-900">{JOIN.teamHeading}</h2>
              <ul className="mt-5 space-y-4">
                <li>
                  <p className="font-semibold text-teal-900">{SITE.founder}</p>
                  <p className="text-sm text-teal-700">{JOIN.roles.founder}</p>
                </li>
                <li>
                  <p className="font-semibold text-teal-900">{SITE.spokesperson}</p>
                  <p className="text-sm text-teal-700">{JOIN.roles.spokesperson}</p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
