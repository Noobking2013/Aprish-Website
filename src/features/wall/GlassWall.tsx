import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WALL } from "@/content/copy";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { bookingAt, type SampleBooking } from "@/lib/wall/wallData";
import { cellCenter, lens, metricsFor, visibleRange } from "@/lib/wall/wallMath";
import { BookingCard } from "./BookingCard";
import { useCamera } from "./useCamera";

/**
 * The infinite glass wall (docs/04_GLASS_WALL_SPEC.md).
 *
 * One requestAnimationFrame loop owns everything: the camera, the lens, every card's
 * transform, the level-of-detail switch and which card is "in focus". React only ever
 * does two things — mount/unmount cards when the visible cell range changes, and
 * re-render on resize — because writing to the DOM directly is what keeps ~110 cards
 * on screen at 60fps. `visibleRange` runs with a 1.5-cell margin, so cards are already
 * mounted before they are visible and the loop never has to await a render.
 */

interface Cell {
  key: string;
  booking: SampleBooking;
}

interface CellRange {
  c0: number;
  c1: number;
  r0: number;
  r1: number;
}

/** A card this far outside the viewport is `display: none` (docs/04: 60px of slack). */
const CULL_SLACK_PX = 60;
/** At or above this scale a card keeps the real .glass blur; below it drops the filter. */
const LOD_HI_SCALE = 0.85;

function readViewportSize() {
  if (typeof window === "undefined") return { w: 0, h: 0 };
  return { w: window.innerWidth, h: window.innerHeight };
}

function initialRange(): CellRange {
  const { w, h } = readViewportSize();
  return visibleRange(0, 0, w, h, metricsFor(w));
}

export interface GlassWallProps {
  /** Fired once, on the first drag / wheel / arrow key, so the HUD hint can fade out. */
  onFirstInput?: () => void;
}

export function GlassWall({ onFirstInput }: GlassWallProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef(new Map<string, HTMLButtonElement>());
  const rangeRef = useRef<CellRange | null>(null);
  const focusKeyRef = useRef<string | null>(null);
  const visibleRef = useRef(true);
  const firstInputRef = useRef(onFirstInput);

  const camera = useCamera();
  const reducedMotion = usePrefersReducedMotion();

  const [size, setSize] = useState(readViewportSize);
  const [range, setRange] = useState<CellRange>(initialRange);
  const [tabHidden, setTabHidden] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const paused = tabHidden || !onScreen;

  const metrics = useMemo(() => metricsFor(size.w), [size.w]);

  /* The only re-render that mounts or unmounts cards. Bookings are rebuilt with the range
     so nothing accumulates: memory stays flat however long someone drags. */
  const cells = useMemo<Cell[]>(() => {
    const list: Cell[] = [];
    for (let row = range.r0; row <= range.r1; row += 1) {
      for (let col = range.c0; col <= range.c1; col += 1) {
        list.push({ key: `${col},${row}`, booking: bookingAt(col, row) });
      }
    }
    return list;
  }, [range]);

  const registerCard = useCallback((key: string, element: HTMLButtonElement | null) => {
    if (element) cardsRef.current.set(key, element);
    else cardsRef.current.delete(key);
  }, []);

  useEffect(() => {
    firstInputRef.current = onFirstInput;
  }, [onFirstInput]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setSize((previous) => {
        const w = surface.clientWidth || window.innerWidth;
        const h = surface.clientHeight || window.innerHeight;
        return previous.w === w && previous.h === h ? previous : { w, h };
      });
    });
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    return camera.attach(surface, {
      isVisible: () => visibleRef.current,
      onFirstInput: () => firstInputRef.current?.(),
    });
  }, [camera]);

  useEffect(() => {
    const handleVisibility = () => setTabHidden(document.visibilityState !== "visible");
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  /* The loop stops dead when the tab is hidden or the stage has scrolled out of view
     (docs/04, "Performance"): nothing animates off screen. */
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        visibleRef.current = entry.isIntersecting;
        setOnScreen(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    let frame = 0;
    let previousTime = 0;

    const render = (time: number) => {
      const dt = previousTime ? (time - previousTime) / 1000 : 1 / 60;
      previousTime = time;

      camera.step(dt, reducedMotion);
      const { cam } = camera.state;

      const next = visibleRange(cam.x, cam.y, size.w, size.h, metrics);
      const current = rangeRef.current;
      if (
        !current ||
        current.c0 !== next.c0 ||
        current.c1 !== next.c1 ||
        current.r0 !== next.r0 ||
        current.r1 !== next.r1
      ) {
        // The only state write in the loop, and the only reason React renders at all.
        rangeRef.current = next;
        setRange(next);
      }

      let bestFocus = 0;
      let bestKey: string | null = null;
      const cards = cardsRef.current;
      const halfW = size.w / 2;
      const halfH = size.h / 2;

      for (const [key, element] of cards) {
        const comma = key.indexOf(",");
        const col = Number(key.slice(0, comma));
        const row = Number(key.slice(comma + 1));
        const world = cellCenter(col, row, metrics);
        const placed = lens(world.x + cam.x + halfW, world.y + cam.y + halfH, size.w, size.h);
        const cardW = metrics.cardW * placed.scale;
        const cardH = metrics.cardH * placed.scale;

        const offScreen =
          placed.x + cardW / 2 < -CULL_SLACK_PX ||
          placed.x - cardW / 2 > size.w + CULL_SLACK_PX ||
          placed.y + cardH / 2 < -CULL_SLACK_PX ||
          placed.y - cardH / 2 > size.h + CULL_SLACK_PX;

        if (offScreen) {
          if (element.style.display !== "none") element.style.display = "none";
          continue;
        }
        if (element.style.display === "none") element.style.display = "";

        /* transform-origin is the card centre (set once in BookingCard), so the lens
           scales around the middle and the card stays on its cell. */
        element.style.transform =
          `translate3d(${(placed.x - metrics.cardW / 2).toFixed(2)}px, ` +
          `${(placed.y - metrics.cardH / 2).toFixed(2)}px, 0) scale(${placed.scale.toFixed(4)})`;
        element.style.opacity = placed.opacity.toFixed(3);
        element.style.zIndex = String(placed.z);

        /* Level of detail: only near-centre cards pay for backdrop-filter (docs/04).
           A data attribute, never a class, so React's className diff stays untouched. */
        const lod = placed.scale >= LOD_HI_SCALE ? "hi" : "lo";
        if (element.dataset.lod !== lod) element.dataset.lod = lod;

        if (bestKey === null || placed.focus > bestFocus) {
          bestFocus = placed.focus;
          bestKey = key;
        }
      }

      /* Exactly one card wears data-focus: the one nearest the screen centre. */
      if (bestKey && bestKey !== focusKeyRef.current) {
        const previousKey = focusKeyRef.current;
        if (previousKey) {
          const previous = cards.get(previousKey);
          if (previous) delete previous.dataset.focus;
        }
        const nextFocused = cards.get(bestKey);
        if (nextFocused) nextFocused.dataset.focus = "true";
        focusKeyRef.current = bestKey;
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [camera, metrics, size.w, size.h, reducedMotion, paused]);

  return (
    <div
      ref={surfaceRef}
      data-testid="wall-surface"
      className="wall-surface absolute inset-0 touch-none select-none"
      role="group"
      aria-label={WALL.regionLabel}
    >
      {cells.map((cell) => (
        <BookingCard
          key={cell.key}
          cellKey={cell.key}
          booking={cell.booking}
          cardW={metrics.cardW}
          cardH={metrics.cardH}
          registerRef={registerCard}
        />
      ))}
    </div>
  );
}
