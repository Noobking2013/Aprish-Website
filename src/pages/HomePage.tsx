import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Hero } from "@/features/home/Hero";
import { Problem } from "@/features/home/Problem";
import { Flow } from "@/features/home/Flow";
import { TryAria } from "@/features/home/TryAria";
import { Safety } from "@/features/home/Safety";
import { WallTeaser } from "@/features/home/WallTeaser";
import { RoiCalculator } from "@/features/home/RoiCalculator";
import { BetaCta } from "@/features/home/BetaCta";

export function HomePage() {
  useDocumentMeta({ title: "Aprish | The operating and growth OS for independent clinics" });

  return (
    // No data-nav-theme here: the observer takes the first intersecting element in
    // document order, so a <main> spanning every section would pin the navbar to light
    // (docs/09 D6). Each section declares its own.
    //
    // Section order is docs/02's: 1 Hero, 2 Problem, 3 Flow, 4 Try Aria, 5 Safety,
    // 6 wall teaser, 7 ROI calculator, 8 beta CTA. All eight Home sections are now built.
    <main id="main" tabIndex={-1}>
      <Hero />
      <Problem />
      <Flow />
      <TryAria />
      <Safety />
      <WallTeaser />
      <RoiCalculator />
      <BetaCta />
    </main>
  );
}

