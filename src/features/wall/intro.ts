/**
 * The wall's entrance (docs/04_GLASS_WALL_SPEC.md, "Intro"; D10).
 *
 * The render loop owns every card's `transform` and `opacity`, so a per-card GSAP
 * stagger would fight it. Instead GSAP tweens ONE scalar 0 -> 1 and the loop turns
 * that scalar into a per-card progress, using each card's distance from the centre
 * of the first batch as its rank. The result reads as a stagger from the middle
 * outwards, with exactly one writer per property.
 *
 * Pure top half (constants, `mix`, `introProgress`) so the maths is unit-testable;
 * the hook at the bottom is the only part that touches GSAP.
 */

import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export interface IntroScalar {
  /** 0 = not started, 1 = finished. GSAP animates this one number. */
  value: number;
}

/** docs/04: the intro runs about 1.1s with `power3.out`. */
export const INTRO_DURATION = 1.1;
/** The most scalar delay a single rank may take (the real delay is usually smaller). */
export const INTRO_RANK_DELAY = 0.09;
/** How much scalar a single rank takes to reach full progress. */
export const INTRO_RANK_SPAN = 0.5;
/** A card starts at 60% scale and grows to the lens value (docs/04). */
export const INTRO_MIN_SCALE = 0.6;

/** Linear interpolation. Kept here so scale and opacity fade with the same curve. */
export function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * The delay between one rank and the next. It is capped so that the FURTHEST card in the
 * first batch lands exactly when the scalar does: with `maxRank` ranks up to the last one
 * must finish by scalar 1, i.e. `maxRank * delay + INTRO_RANK_SPAN <= 1`. Without this cap
 * the wall's outermost cards would stall at partial opacity for good, because the batch is
 * wider than the wave.
 */
export function rankDelay(maxRank: number): number {
  if (maxRank <= 0) return 0;
  return Math.min(INTRO_RANK_DELAY, (1 - INTRO_RANK_SPAN) / maxRank);
}

/**
 * One card's local progress. `rank` is the card's distance in cells from the centre of the
 * first batch (0 for the card under the camera) and `maxRank` the largest such distance in
 * that batch. Returns 0..1, clamped, so a card outside the wave simply waits at 0 or is
 * already at 1. The `intro >= 1` early return is the safety net: once the entrance is over
 * nothing may still be mid-flight, whatever the arithmetic says.
 */
export function introProgress(intro: number, rank: number, maxRank: number): number {
  if (intro >= 1) return 1;
  const local = (intro - rank * rankDelay(maxRank)) / INTRO_RANK_SPAN;
  if (local <= 0) return 0;
  if (local >= 1) return 1;
  return local;
}

/**
 * Owns the intro scalar. `play` is false for reduced motion, where the wall must simply
 * be there: the scalar starts and stays at 1, so every card gets progress 1 immediately.
 */
export function useWallIntro(play: boolean): RefObject<IntroScalar> {
  const intro = useRef<IntroScalar>({ value: play ? 1 : 0 });

  useGSAP(
    () => {
      if (!play) {
        intro.current.value = 1;
        return;
      }

      intro.current.value = 0;
      const tween = gsap.to(intro.current, {
        value: 1,
        duration: INTRO_DURATION,
        ease: "power3.out",
      });

      return () => {
        tween.kill();
        intro.current.value = 1;
      };
    },
    { dependencies: [play] },
  );

  return intro;
}
