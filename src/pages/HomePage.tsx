import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Hero } from "@/features/home/Hero";
import { TryAria } from "@/features/home/TryAria";

export function HomePage() {
  useDocumentMeta({ title: "Aprish | The operating and growth OS for independent clinics" });

  return (
    // No data-nav-theme here: the observer takes the first intersecting element in
    // document order, so a <main> spanning every section would pin the navbar to light
    // (docs/09 D6). Each section declares its own.
    <main id="main" tabIndex={-1}>
      <Hero />
      <TryAria />
    </main>
  );
}

