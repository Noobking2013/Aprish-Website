import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Hero } from "@/features/home/Hero";

export function HomePage() {
  useDocumentMeta({ title: "Aprish | The operating and growth OS for independent clinics" });

  return (
    <main id="main" data-nav-theme="light" tabIndex={-1}>
      <Hero />
    </main>
  );
}

