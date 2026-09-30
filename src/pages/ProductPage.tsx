import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function ProductPage() {
  useDocumentMeta({ title: "Product | Aprish" });

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="data text-xs uppercase tracking-[0.18em] text-coral-700">
        Placeholder route · built in Phase 6
      </p>
      <h1 className="display mt-4 text-5xl text-teal-900 sm:text-6xl">Product</h1>
    </main>
  );
}
