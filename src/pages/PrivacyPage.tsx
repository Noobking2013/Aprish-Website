import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function PrivacyPage() {
  useDocumentMeta({ title: "Privacy | Aprish" });

  return (
    <main id="main" data-nav-theme="light" tabIndex={-1} className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="data text-xs uppercase tracking-[0.18em] text-coral-700">
        Placeholder route · built in Phase 6
      </p>
      <h1 id="route-title" tabIndex={-1} className="display mt-4 text-5xl text-teal-900 sm:text-6xl">Privacy</h1>
    </main>
  );
}
