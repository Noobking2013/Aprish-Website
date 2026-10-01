import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { WALL } from "@/content/copy";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { bookingAt, type SampleBooking } from "@/lib/wall/wallData";
import { cellCenter, lens, metricsFor, visibleRange } from "@/lib/wall/wallMath";
import { BookingCard } from "./BookingCard";
import { BookingDetail } from "./BookingDetail";
import { INTRO_MIN_SCALE, introProgress, mix, useWallIntro } from "./intro";
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

/* The optional live pulse (docs/04): one near-centre card gets a 700ms ring every few
   seconds, so the wall reads as alive without animating dozens of cards at once. */
const PULSE_MAX_R = 0.7;
const PULSE_MS = 700;
const PULSE_GAP_MIN_MS = 3000;
const PULSE_GAP_MAX_MS = 4500;

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
  /** The cell key whose detail is open, or null. Owned by the page (see LivePage). */
  openKey?: string | null;
  /** A card was clicked. The page decides what to do with the key. */
  onOpen?: (key: string) => void;
  /** The dialog asked to close (Escape, overlay, Close button). */
  onClose?: () => void;
}

export function GlassWall({ onFirstInput, openKey = null, onOpen, onClose }: GlassWallProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef(new Map<string, HTMLButtonElement>());
  const rangeRef = useRef<CellRange | null>(null);
  const focusKeyRef = useRef<string | null>(null);
  const visibleRef = useRef(true);
  const firstInputRef = useRef(onFirstInput);
  /** D11: read by the loop and by the camera. Mirrors `openKey` without re-rendering. */
  const frozenRef = useRef(false);
  /** The optional live pulse: which card is pulsing and when the timer next fires. */
  const pulseRef = useRef<{ key: string | null; until: number; next: number }>({
    key: null,
    until: 0,
    next: 0,
  });

  const camera = useCamera();
  const reducedMotion = usePrefersReducedMotion();
  /** D10: the single scalar the loop turns into each card's entrance progress. */
  const intro = useWallIntro(!reducedMotion);

  const [size, setSize] = useState(readViewportSize);
  const [range, setRange] = useState<CellRange>(initialRange);
  const [tabHidden, setTabHidden] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  /** The key of the mounted dialog. Lags `openKey` so the close flight can play. */
  const [mountedKey, setMountedKey] = useState<string | null>(null);
  const paused = tabHidden || !onScreen;

  const metrics = useMemo(() => metricsFor(size.w), [size.w]);

  /* The "first batch" (D10): the cards that exist on the very first frame, each with a
     rank = its distance in cells from the centre cell. Computed once, from the same
     inputs `initialRange()` uses, so the ranks line up with the first render. `maxRank`
     is what the wave is scaled to, so the outermost card lands with the scalar. */
  const firstBatch = useMemo(() => {
    const { w, h } = readViewportSize();
    const around = visibleRange(0, 0, w, h, metricsFor(w));
    const ranks = new Map<string, number>();
    let maxRank = 0;
    for (let row = around.r0; row <= around.r1; row += 1) {
      for (let col = around.c0; col <= around.c1; col += 1) {
        const rank = Math.round(Math.hypot(col, row));
        ranks.set(`${col},${row}`, rank);
        if (rank > maxRank) maxRank = rank;
      }
    }
    return { ranks, maxRank };
  }, []);

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

  /* D11: the loop and the camera read this ref, so opening the detail never restarts the
     animation loop (a restart would drop the first frames of the flight). A LAYOUT effect
     on purpose — this is the one place in the app that must land before the next paint,
     so the loop cannot write a single card transform after the panel has taken off. */
  useLayoutEffect(() => {
    frozenRef.current = openKey !== null;
  }, [openKey]);

  /* Keep the dialog mounted through its own close flight — it calls `onClosed` once the
     panel has landed, which is the only thing that unmounts it. The key change remounts
     the component for a different booking. */
  useEffect(() => {
    if (openKey) setMountedKey(openKey);
  }, [openKey]);

  const handleCardOpen = useCallback(
    (key: string) => {
      onOpen?.(key);
    },
    [onOpen],
  );

  /* Stable identities: BookingDetail keys its focus and close effects off them, so a new
     arrow function on every GlassWall render would re-focus the dialog mid-read. */
  const handleDetailClose = useCallback(() => {
    onClose?.();
  }, [onClose]);
  const handleDetailClosed = useCallback(() => {
    setMountedKey(null);
  }, []);

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
      /* D11: while a detail is open the camera ignores wheel, drag, keys and drift. */
      isEnabled: () => !frozenRef.current,
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

      /* D11: frozen while a detail is open. No card style is written, so the card the
         panel flew out of keeps its exact transform for the return leg. */
      if (frozenRef.current) {
        frame = requestAnimationFrame(render);
        return;
      }

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
      /* D10: one scalar read once per frame; it drives every card's entrance. */
      const introScalar = intro.current.value;
      /** Cards near enough the centre to be a candidate for the live pulse. */
      const candidates: string[] = [];

      for (const [key, element] of cards) {
        const comma = key.indexOf(",");
        const col = Number(key.slice(0, comma));
        const row = Number(key.slice(comma + 1));
        const world = cellCenter(col, row, metrics);
        const placed = lens(world.x + cam.x + halfW, world.y + cam.y + halfH, size.w, size.h);

        /* The entrance (D10). First-batch cards start at 60% scale and fade in, staggered
           by their distance from the centre; a card mounted later is simply there. */
        const rank = firstBatch.ranks.get(key);
        const progress =
          rank === undefined ? 1 : introProgress(introScalar, rank, firstBatch.maxRank);
        const scale = placed.scale * mix(INTRO_MIN_SCALE, 1, progress);
        const cardW = metrics.cardW * scale;
        const cardH = metrics.cardH * scale;

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
          `${(placed.y - metrics.cardH / 2).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        element.style.opacity = (placed.opacity * progress).toFixed(3);
        element.style.zIndex = String(placed.z);

        if (!reducedMotion && placed.r < PULSE_MAX_R) candidates.push(key);

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

      /* ---- the optional live pulse: one card at a time, never during the entrance ---- */
      const pulse = pulseRef.current;
      if (pulse.key) {
        if (time >= pulse.until) {
          cards.get(pulse.key)?.removeAttribute("data-pulse");
          pulse.key = null;
          pulse.next =
            time + PULSE_GAP_MIN_MS + Math.random() * (PULSE_GAP_MAX_MS - PULSE_GAP_MIN_MS);
        }
      } else if (candidates.length > 0 && introScalar >= 1 && time >= pulse.next) {
        const key = candidates[Math.floor(Math.random() * candidates.length)];
        const element = cards.get(key);
        if (element) {
          element.dataset.pulse = "true";
          pulse.key = key;
          pulse.until = time + PULSE_MS;
        }
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [camera, metrics, size.w, size.h, reducedMotion, paused, intro, firstBatch]);

  /* The dialog is resolved from the range that is already mounted: D11 freezes the loop,
     and the range only changes when the camera moves, so a card that was on screen when
     it was clicked is still here. */
  const openCell = mountedKey ? (cells.find((cell) => cell.key === mountedKey) ?? null) : null;
  const openAnchor = mountedKey ? (cardsRef.current.get(mountedKey) ?? null) : null;

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
          onOpen={onOpen ? handleCardOpen : undefined}
        />
      ))}

      {openCell ? (
        <BookingDetail
          key={openCell.key}
          booking={openCell.booking}
          anchor={openAnchor}
          open={openKey === openCell.key}
          onRequestClose={handleDetailClose}
          onClosed={handleDetailClosed}
        />
      ) : null}
    </div>
  );
}
