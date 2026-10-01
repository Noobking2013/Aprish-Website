import { useCallback, useState } from "react";
import { WALL } from "@/content/copy";
import { GlassWall } from "@/features/wall/GlassWall";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * /live — the infinite glass wall (docs/04_GLASS_WALL_SPEC.md).
 *
 * D6: `data-nav-theme` sits on the single inner wrapper, never on <main> itself.
 * The stage is in flow rather than fixed so the footer below it is still reachable by
 * keyboard, while the wall captures wheel, touch and drag, so the page never scrolls.
 *
 * The HUD is `pointer-events-none` throughout: it must not steal drags, and nothing in
 * it is interactive. The heading keeps `tabIndex={-1}` because the transition focuses
 * `#route-title` after arriving here.
 */
export function LivePage() {
  useDocumentMeta({ title: "Live bookings | Aprish" });
  const [hintHidden, setHintHidden] = useState(false);
  const handleFirstInput = useCallback(() => setHintHidden(true), []);

  return (
    <main id="main" tabIndex={-1}>
      <div data-nav-theme="dark" className="stage wall-grid min-h-[100dvh] w-full">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="orb orb--peach left-[22%] top-[22%] h-[52vmax] w-[52vmax]" />
          <span className="orb orb--teal right-[-8%] top-[4%] h-[46vmax] w-[46vmax]" />
          <span className="orb orb--gold left-[54%] top-[46%] h-[40vmax] w-[40vmax] max-md:hidden" />
          <span className="orb orb--lav bottom-[-14%] left-[-6%] h-[60vmax] w-[60vmax] max-md:hidden" />
        </div>

        <GlassWall onFirstInput={handleFirstInput} />

        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex px-5 md:top-24 md:px-10">
          <div className="glass flex items-center gap-3 rounded-full py-2 pl-5 pr-2">
            <h1 id="route-title" tabIndex={-1} className="text-sm font-semibold text-cream-100">
              {WALL.h1}
            </h1>
            <span className="glass glass--light wall-chip" data-sample="true">
              {WALL.sampleChip}
            </span>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-5">
          <p
            className="glass wall-hint rounded-full px-5 py-2.5 text-xs text-cream-100"
            data-hidden={hintHidden}
          >
            {WALL.hint}
          </p>
        </div>
      </div>
    </main>
  );
}

