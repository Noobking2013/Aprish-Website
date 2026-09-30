import type { ReactNode } from "react";
import { StarFour } from "./StarFour";
import "./transitions.css";
import { useStairs } from "./useStairs";
import { TransitionContext } from "./useTransition";

const BAR_COUNT = [0, 1, 2, 3, 4];

/**
 * Wraps the whole app: owns the stairs overlay, the loader and the route-change
 * orchestration. Nothing inside it may be rendered outside it (useTransition throws).
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const stairs = useStairs();

  return (
    <TransitionContext.Provider value={stairs.api}>
      <div ref={stairs.rootRef}>
        {/* Chrome first: the overlay and the live region are outside #route-root,
            so the page-enter tween never touches them and the route swap cannot
            wipe them. */}
        <div
          ref={stairs.overlayRef}
          className="stairs"
          data-active={stairs.overlayActive ? "true" : "false"}
          aria-hidden="true"
        >
          {BAR_COUNT.map((index) => (
            <div key={index} className="stair" />
          ))}
          <div ref={stairs.labelRef} className="stairs-label">
            <span ref={stairs.starRef} className="inline-flex">
              <StarFour className="h-[0.55em] w-[0.55em] text-gold-400" />
            </span>
            <span>{stairs.labelText}</span>
          </div>
        </div>

        {/* Route changes are announced here; the overlay itself is decorative. */}
        <p className="sr-only" role="status" aria-live="polite">
          {stairs.announcement}
        </p>

        {children}
      </div>
    </TransitionContext.Provider>
  );
}
