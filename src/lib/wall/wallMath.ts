/**
 * Pure geometry for the infinite glass wall ("middle zoomed, corners small").
 * No DOM, no React: safe to unit-test and to call every animation frame.
 *
 * Coordinate model
 *  - World: cell (col,row) has centre (col*pitchX + (row odd ? pitchX/2 : 0), row*pitchY).
 *  - Camera (camX,camY): screen = world + cam + (viewW/2, viewH/2).
 *    So camera (0,0) puts cell (0,0) exactly at the viewport centre.
 *  - Lens: every card is then scaled/warped by its distance from the viewport
 *    centre, so cards are largest in the middle and shrink toward the corners.
 */

export interface WallMetrics {
  unit: number;
  cardW: number;
  cardH: number;
  pitchX: number;
  pitchY: number;
}

/** Design size at unit = 1 (a 1440px-wide viewport). */
export const BASE = { cardW: 248, cardH: 156, pitchX: 320, pitchY: 224 } as const;

/** Tunable lens. Change these, not the maths. */
export const LENS = {
  scaleMax: 1.3,     // scale of a card at the exact centre
  scaleMin: 0.5,     // scale at the corners
  edge: 0.95,        // normalised radius where scaleMin is reached
  warp: 0.12,        // 0 = no compression toward the centre, 0.2 = strong
  fadeStart: 0.7,    // radius where cards start fading
  fadeEnd: 1.05,     // radius where minOpacity is reached
  minOpacity: 0.35,
  focusRadius: 0.22, // radius within which a card counts as "in focus"
} as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function metricsFor(viewW: number): WallMetrics {
  const unit = clamp(viewW / 1440, 0.66, 1.1);
  return {
    unit,
    cardW: BASE.cardW * unit,
    cardH: BASE.cardH * unit,
    pitchX: BASE.pitchX * unit,
    pitchY: BASE.pitchY * unit,
  };
}

/** World-space centre of a cell. Odd rows are shifted half a column (brick layout). */
export function cellCenter(col: number, row: number, m: WallMetrics) {
  return { x: col * m.pitchX + (row & 1 ? m.pitchX / 2 : 0), y: row * m.pitchY };
}

/**
 * Inclusive range of cells that can possibly appear on screen.
 * `margin` is in cells and covers the lens warp plus scroll-ahead.
 */
export function visibleRange(
  camX: number, camY: number, viewW: number, viewH: number, m: WallMetrics, margin = 1.5,
) {
  const left = -camX - viewW / 2 - margin * m.pitchX;
  const right = -camX + viewW / 2 + margin * m.pitchX;
  const top = -camY - viewH / 2 - margin * m.pitchY;
  const bottom = -camY + viewH / 2 + margin * m.pitchY;
  return {
    c0: Math.floor(left / m.pitchX) - 1,
    c1: Math.ceil(right / m.pitchX) + 1,
    r0: Math.floor(top / m.pitchY),
    r1: Math.ceil(bottom / m.pitchY),
  };
}

export interface LensResult {
  x: number;       // screen-space centre after warp
  y: number;
  scale: number;
  opacity: number;
  r: number;       // normalised distance from centre (0 centre, ~1 corner)
  focus: number;   // 1 at the very centre, 0 outside focusRadius
  z: number;       // integer z-index (bigger cards on top)
}

/** Lens transform for a card whose unwarped screen-space centre is (sx, sy). */
export function lens(sx: number, sy: number, viewW: number, viewH: number): LensResult {
  const cx = viewW / 2;
  const cy = viewH / 2;
  const dx = sx - cx;
  const dy = sy - cy;
  const halfDiag = Math.hypot(viewW, viewH) / 2;
  const r = Math.hypot(dx, dy) / halfDiag;
  const t = smoothstep(0, LENS.edge, r);
  const scale = LENS.scaleMax - (LENS.scaleMax - LENS.scaleMin) * t;
  const k = 1 - LENS.warp * t;
  return {
    x: cx + dx * k,
    y: cy + dy * k,
    scale,
    opacity: 1 - (1 - LENS.minOpacity) * smoothstep(LENS.fadeStart, LENS.fadeEnd, r),
    r,
    focus: 1 - smoothstep(0, LENS.focusRadius, r),
    z: Math.round(scale * 100),
  };
}

/** Frame-rate independent easing toward a target. 0.09 ~= the original 0.075 feel at 60fps. */
export function damp(current: number, target: number, dtSeconds: number, rate = 0.09) {
  const f = 1 - Math.pow(1 - rate, clamp(dtSeconds, 0, 0.1) * 60);
  return current + (target - current) * f;
}
