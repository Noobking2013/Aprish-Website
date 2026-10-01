import { NOT_FOUND } from "@/content/copy";
import { TLink } from "@/features/transitions/TLink";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * The 404 route (docs/02 §"Routes"), reached by the catch-all `*`.
 *
 * It says what happened and offers the only link that matters. It uses TLink so returning home
 * runs the same stairs transition as every other navigation, and keeps `id="route-title"` so the
 * transition can move focus onto the heading after arriving.
 */
export function NotFoundPage() {
  useDocumentMeta({ title: "Page not found | Aprish" });

  return (
    <main id="main" tabIndex={-1}>
      <section
        aria-labelledby="route-title"
        data-nav-theme="light"
        className="bg-cream-100 px-6 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32"
      >
        <div className="mx-auto w-full max-w-2xl">
          <h1
            id="route-title"
            tabIndex={-1}
            className="display text-[clamp(2.4rem,6vw,3.6rem)] text-teal-900"
          >
            {NOT_FOUND.h1}
          </h1>
          <p className="lead mt-6 text-teal-800">{NOT_FOUND.body}</p>

          <TLink
            to="/"
            className="mt-10 inline-flex items-center rounded-full bg-teal-900 px-6 py-3 text-sm font-semibold text-cream-100 transition-colors hover:bg-teal-800"
          >
            {NOT_FOUND.home}
          </TLink>
        </div>
      </section>
    </main>
  );
}
