import { createContext, useContext, type RefObject } from "react";

/**
 * The four members below are the documented API from docs/05_TRANSITIONS_SPEC.md.
 * `menuButtonRef` is internal plumbing so focus can return to the navbar button.
 */
export interface TransitionContextValue {
  go(to: string, opts?: { fromMenu?: boolean }): void;
  menuOpen: boolean;
  openMenu(): void;
  closeMenu(options?: { returnFocus?: boolean }): void;
  isBusy: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition(): TransitionContextValue {
  const value = useContext(TransitionContext);

  if (!value) {
    throw new Error("useTransition must be used inside <TransitionProvider>");
  }

  return value;
}

