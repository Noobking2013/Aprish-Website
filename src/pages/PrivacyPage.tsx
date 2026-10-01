import { PRIVACY_NOTICE } from "@/content/copy";
import { SITE } from "@/content/config";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * /privacy (docs/02 §privacy).
 *
 * A deliberately short, plain-language stub. It is honest about being unfinished: the retention
 * line and the contact line are placeholders, and the notice tells the reader it still needs
 * legal review. The contact address is read from SITE.contactEmail, so the page fills itself in
 * the day the founder sets one.
 *
 * Needs legal review (DPDP Act) before launch.
 */
export function PrivacyPage() {
  useDocumentMeta({
    title: "Privacy | Aprish",
    description:
      "A short, plain-language privacy notice for the Aprish website and the beta sign-up form.",
  });

  const email = SITE.contactEmail.trim();

  return (
    <main id="main" tabIndex={-1}>
      <section
        aria-labelledby="route-title"
        data-nav-theme="light"
        className="bg-cream-100 px-6 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32"
      >
        <div className="mx-auto w-full max-w-2xl">
          {/* Needs legal review (DPDP Act) before launch. */}
          <h1
            id="route-title"
            tabIndex={-1}
            className="display text-[clamp(2.4rem,6vw,3.6rem)] text-teal-900"
          >
            {PRIVACY_NOTICE.h1}
          </h1>
          <p className="lead mt-6 text-teal-800">{PRIVACY_NOTICE.intro}</p>

          <dl className="mt-12 space-y-8">
            {PRIVACY_NOTICE.items.map((item) => (
              <div key={item.label}>
                <dt className="font-semibold text-teal-900">{item.label}</dt>
                <dd className="mt-2 text-teal-700">{item.body}</dd>
              </div>
            ))}

            <div>
              <dt className="font-semibold text-teal-900">{PRIVACY_NOTICE.contact.label}</dt>
              <dd className="mt-2 text-teal-700">
                {PRIVACY_NOTICE.contact.body}{" "}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="font-semibold text-teal-900 underline underline-offset-4 hover:text-teal-800"
                  >
                    {email}
                  </a>
                ) : (
                  <span className="text-teal-600">{PRIVACY_NOTICE.contactFallback}</span>
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-12 border-t border-teal-900/10 pt-6 text-sm text-teal-600">
            {PRIVACY_NOTICE.reviewNote}
          </p>
        </div>
      </section>
    </main>
  );
}
