import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { HERO } from "@/content/copy";

export function HomePage() {
  useDocumentMeta({ title: "Aprish | The operating and growth OS for independent clinics" });

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="data text-xs uppercase tracking-[0.18em] text-coral-700">
        Placeholder route · built in Phase 2
      </p>
      <h1 className="display mt-4 text-5xl text-teal-900 sm:text-6xl">{HERO.h1}</h1>
    </main>
  );
}
