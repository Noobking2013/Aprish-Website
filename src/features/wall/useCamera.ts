import { useMemo } from "react";
import { damp } from "@/lib/wall/wallMath";

/**
 * Camera for the infinite glass wall (docs/04_GLASS_WALL_SPEC.md, "Input").
 *
 * The camera is deliberately NOT React state: GlassWall reads and writes it every
 * animation frame. Only the visible cell range may ever trigger a re-render.
 *
 *   state.cam     the damped position every card is placed from
 *   state.target  where the input wants the wall to be
 *
 * `attach` wires pointer, wheel and keyboard and returns a single cleanup that removes
 * every listener (React StrictMode runs effects twice in dev, so this must be exact).
 */

export interface CameraState {
  cam: { x: number; y: number };
  target: { x: number; y: number };
  vel: { x: number; y: number };
  dragging: boolean;
  /** A drag passed the 6px threshold: the click that follows belongs to the drag. */
  suppressClick: boolean;
  /** Timestamp of the last input. Idle drift waits on this. */
  lastInputAt: number;
}

export interface CameraOptions {
  /** False while the stage is off screen or the tab is hidden. */
  isVisible: () => boolean;
  /**
   * False while the booking detail is open (D11). The camera then ignores wheel,
   * drag, keys and idle drift, so the card the dialog flew out of stays put.
   */
  isEnabled?: () => boolean;
  /** Fired once, on the first real input (the HUD hint fades out from here). */
  onFirstInput?: () => void;
}

export interface CameraHandle {
  state: CameraState;
  attach: (container: HTMLElement, options: CameraOptions) => () => void;
  step: (dtSeconds: number, reducedMotion: boolean) => void;
}

/** Pointer travel that turns a click into a drag (docs/04). */
const DRAG_THRESHOLD_PX = 6;
/** ms of momentum applied to `target` on release (docs/04: velocity * 240). */
const MOMENTUM_MS = 240;
/** Recent pointer samples used for the release velocity. */
const SAMPLE_COUNT = 6;
/** Firefox reports wheel deltas in "lines" (deltaMode 1). */
const WHEEL_LINE_PX = 16;
const KEY_PAN_PX = 160;
const KEY_PAN_FAST_PX = 480;
const IDLE_AFTER_MS = 4000;
const IDLE_PX_PER_FRAME = 0.25;
/** Keeps a fast flick from throwing the wall into orbit. */
const MAX_MOMENTUM_PX = 1600;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useCamera(): CameraHandle {
  return useMemo<CameraHandle>(() => {
    const state: CameraState = {
      cam: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      dragging: false,
      suppressClick: false,
      lastInputAt: 0,
    };

    let options: CameraOptions | null = null;
    let interacted = false;
    let pointerId: number | null = null;
    let originX = 0;
    let originY = 0;
    let samples: Array<{ x: number; y: number; t: number }> = [];

    const note = (now: number) => {
      state.lastInputAt = now;
      if (!interacted) {
        interacted = true;
        options?.onFirstInput?.();
      }
    };

    const pan = (dx: number, dy: number) => {
      state.target.x += dx;
      state.target.y += dy;
    };

    /** Frozen while the booking detail is open (D11): no input moves the camera. */
    const enabled = () => options?.isEnabled?.() !== false;

    const step = (dtSeconds: number, reducedMotion: boolean) => {
      const dt = clamp(dtSeconds, 0, 0.1);

      if (
        !reducedMotion &&
        !state.dragging &&
        enabled() &&
        options?.isVisible() !== false &&
        state.lastInputAt > 0 &&
        performance.now() - state.lastInputAt > IDLE_AFTER_MS
      ) {
        // A slow, calm drift so the wall is never quite still (docs/04). Never while the
        // visitor is touching it, and never under reduced motion.
        state.target.x += IDLE_PX_PER_FRAME * dt * 60;
      }

      const rate = reducedMotion ? 1 : 0.09;
      state.cam.x = damp(state.cam.x, state.target.x, dt, rate);
      state.cam.y = damp(state.cam.y, state.target.y, dt, rate);
    };

    const attach = (container: HTMLElement, cameraOptions: CameraOptions) => {
      options = cameraOptions;
      interacted = false;
      pointerId = null;
      samples = [];
      state.dragging = false;
      state.suppressClick = false;
      // Idle drift is measured from the moment the wall appears, so it only starts once
      // the visitor has had IDLE_AFTER_MS to look at a still wall.
      state.lastInputAt = performance.now();

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (!enabled()) return;
        pointerId = event.pointerId;
        state.dragging = true;
        state.suppressClick = false;
        state.vel.x = 0;
        state.vel.y = 0;
        originX = event.clientX;
        originY = event.clientY;
        samples = [{ x: event.clientX, y: event.clientY, t: performance.now() }];
        if (container.setPointerCapture) {
          try {
            container.setPointerCapture(event.pointerId);
          } catch {
            /* the pointer is already gone; dragging still works without capture */
          }
        }
        container.dataset.dragging = "true";
        note(performance.now());
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!state.dragging || event.pointerId !== pointerId) return;
        if (!enabled()) {
          endDrag(event);
          return;
        }
        const now = performance.now();
        const last = samples[samples.length - 1];
        pan(event.clientX - last.x, event.clientY - last.y);
        samples.push({ x: event.clientX, y: event.clientY, t: now });
        if (samples.length > SAMPLE_COUNT) samples.shift();
        if (
          Math.abs(event.clientX - originX) > DRAG_THRESHOLD_PX ||
          Math.abs(event.clientY - originY) > DRAG_THRESHOLD_PX
        ) {
          state.suppressClick = true;
        }
        note(now);
      };

      const endDrag = (event: PointerEvent) => {
        if (!state.dragging || event.pointerId !== pointerId) return;
        state.dragging = false;
        pointerId = null;
        delete container.dataset.dragging;
        if (container.hasPointerCapture?.(event.pointerId)) {
          container.releasePointerCapture(event.pointerId);
        }

        const first = samples[0];
        const last = samples[samples.length - 1];
        if (first && last && enabled()) {
          const elapsed = Math.max(1, last.t - first.t);
          state.vel.x = (last.x - first.x) / elapsed;
          state.vel.y = (last.y - first.y) / elapsed;
        }
        pan(
          clamp(state.vel.x * MOMENTUM_MS, -MAX_MOMENTUM_PX, MAX_MOMENTUM_PX),
          clamp(state.vel.y * MOMENTUM_MS, -MAX_MOMENTUM_PX, MAX_MOMENTUM_PX),
        );
        state.vel.x = 0;
        state.vel.y = 0;
        note(performance.now());
      };

      /* Capture phase: React's click listener sits on the root above this container, so
         stopping propagation here is what keeps a dragged card from activating. */
      const onClickCapture = (event: MouseEvent) => {
        if (!state.suppressClick) return;
        state.suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        if (!enabled()) return;
        const scale = event.deltaMode === 1 ? WHEEL_LINE_PX : 1;
        if (event.shiftKey) {
          pan(-event.deltaY * scale, 0);
        } else {
          pan(-event.deltaX * scale, -event.deltaY * scale);
        }
        note(performance.now());
      };

      /* Arrow keys pan while the wall is on screen. Bound to the window so they work as
         soon as the route focus lands on the HUD heading, and also with a card focused. */
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
        if (!enabled() || options?.isVisible() === false) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

        const distance = event.shiftKey ? KEY_PAN_FAST_PX : KEY_PAN_PX;
        switch (event.key) {
          case "ArrowLeft":
            pan(distance, 0);
            break;
          case "ArrowRight":
            pan(-distance, 0);
            break;
          case "ArrowUp":
            pan(0, distance);
            break;
          case "ArrowDown":
            pan(0, -distance);
            break;
          default:
            return;
        }
        event.preventDefault();
        note(performance.now());
      };

      container.addEventListener("pointerdown", onPointerDown);
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerup", endDrag);
      container.addEventListener("pointercancel", endDrag);
      container.addEventListener("click", onClickCapture, true);
      container.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("keydown", onKeyDown);

      return () => {
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerup", endDrag);
        container.removeEventListener("pointercancel", endDrag);
        container.removeEventListener("click", onClickCapture, true);
        container.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKeyDown);
        delete container.dataset.dragging;
        state.dragging = false;
        state.suppressClick = false;
        pointerId = null;
        samples = [];
        options = null;
      };
    };

    return { state, attach, step };
  }, []);
}
