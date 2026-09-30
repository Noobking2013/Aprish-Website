/**
 * Pure helpers for the logo dot system.
 * Spec: docs/06_LOGO_DOTS_AND_PHONE_SPEC.md, section A.
 *
 * No React and no drawing lives here: sampling, colour mapping and every tuning
 * constant, so the numbers can be reasoned about (and measured) without a browser.
 */

/** Always sampled from this file; only the shape matters, the colour is remapped. */
export const LOGO_SAMPLE_SRC = "/brand/logo-on-dark.png";
/** Static replacements when the PNG cannot load, picked from the resolved theme. */
export const LOGO_FALLBACK_ON_LIGHT = "/brand/logo-on-light.png";
export const LOGO_FALLBACK_ON_DARK = "/brand/logo-on-dark.png";

/** Source PNG is 804 x 534, transparent. */
export const LOGO_ASPECT = 534 / 804;
/** The hero column is ~660px wide, so never sample wider than that. */
export const MAX_DRAW_WIDTH = 660;
export const COMPACT_MAX_WIDTH = 240;

/* ------------------------------------------------------------------ sampling */
export const ALPHA_THRESHOLD = 0.35;
export const MOBILE_BREAKPOINT = 768;
export const STRIDE_DESKTOP = 4; // docs/06: "stride 4 on desktop, 6 under 768px"
export const STRIDE_MOBILE = 6;
export const STRIDE_COMPACT = 3;
export const STRIDE_MIN = 3;
export const TARGET_MIN_DOTS = 2500;
/**
 * Measured from logo-on-dark.png: 26.6% of pixels have alpha > 0.35.
 * Only used to keep the dot count inside the 2,500-4,000 band docs/06 asks for.
 */
const LOGO_COVERAGE = 0.266;

/* -------------------------------------------------------------------- motion */
export const ASSEMBLY_MS = 1200;
/** Random per-dot head start, so the mark forms instead of snapping in as a block. */
export const ASSEMBLY_STAGGER_MS = 250;
export const SPRING = 0.055;
export const REPEL_RADIUS = 110;
export const REPEL_FORCE = 1.9;
export const SHIMMER_SPEED = 0.0012;
export const SHIMMER_DEPTH = 0.18;
export const ALPHA_BODY_MIN = 0.18;
export const ALPHA_STAR_MIN = 0.7;
export const ALPHA_FLOOR = 0.48;
export const STAR_SCALE = 1.4;
export const SIZE_DESKTOP = 1.5;
export const SIZE_COMPACT = 1.15;
export const DPR_CAP = 2;
export const RESIZE_DEBOUNCE_MS = 150;
/** Frame deltas are clamped so a paused tab cannot skip the assembly. */
export const MAX_FRAME_MS = 32;
/** Dots narrower than this use fillRect; only star dots are wide enough for arc. */
export const ARC_MIN_SIZE = 2;

export interface Dot {
  /** Current position in CSS px, relative to the canvas box. */
  x: number;
  y: number;
  /** Random start position; the assembly interpolates from here to the target. */
  x0: number;
  y0: number;
  /** Target position, i.e. the pixel of the logo this dot stands for. */
  tx: number;
  ty: number;
  /** Milliseconds of delay before this dot starts moving. */
  delay: number;
  size: number;
  alpha: number;
  phase: number;
  star: boolean;
}

export interface ParticleTheme {
  /** `rgb(r g b)` strings, rebuilt whenever the canvas is re-sampled. */
  body: string;
  star: string;
  /** True when the body dots are light, i.e. the canvas sits on a dark section. */
  onDark: boolean;
}

export interface SampleOptions {
  boxW: number;
  boxH: number;
  stride: number;
  compact: boolean;
}

export interface SampleResult {
  dots: Dot[];
  drawW: number;
  drawH: number;
}

/**
 * Star pixels of the logo: the gold sparkle. Same test as docs/06.
 * The body mark is cream or dark teal, neither of which can satisfy r - b > 70 with b < 140.
 */
export function isStarPixel(r: number, g: number, b: number): boolean {
  return r > 180 && g > 130 && b < 140 && r - b > 70;
}

export function easeOutCubic(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - (1 - clamped) ** 3;
}

/** Rough dot count for a box of `drawW` px at a given stride. */
export function estimateDots(drawW: number, stride: number): number {
  if (drawW <= 0 || stride <= 0) return 0;
  const drawH = drawW * LOGO_ASPECT;
  return LOGO_COVERAGE * (drawW / stride) * (drawH / stride);
}

/**
 * docs/06 says stride 4 on desktop and 6 under 768px, and in the same breath asks for
 * 2,500-4,000 dots. Measured, those two cannot both hold: a 350px phone column at
 * stride 6 yields about 600 dots, which reads as a faint skeleton rather than a logo.
 * So the doc's stride is the starting point and the count guard tightens it, never
 * below STRIDE_MIN, until the estimate clears TARGET_MIN_DOTS.
 */
export function pickStride(viewportWidth: number, boxWidth: number, compact: boolean): number {
  if (compact) return STRIDE_COMPACT;
  let stride = viewportWidth < MOBILE_BREAKPOINT ? STRIDE_MOBILE : STRIDE_DESKTOP;
  while (stride > STRIDE_MIN && estimateDots(boxWidth, stride) < TARGET_MIN_DOTS) {
    stride -= 1;
  }
  return stride;
}


/**
 * A `--particle-body: 217 150 43` style triplet, or an `rgb(217 150 43)` string.
 * Returns null when the value is missing or unparseable so the caller can fall back.
 */
export function parseColorTriplet(value: string): [number, number, number] | null {
  const numbers = value.match(/-?\d*\.?\d+/g);
  if (!numbers || numbers.length < 3) return null;
  const [r, g, b] = numbers.slice(0, 3).map(Number);
  if (![r, g, b].every(Number.isFinite)) return null;
  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b))),
  ];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const DEFAULT_BODY: [number, number, number] = [217, 150, 43]; // gold-500
const DEFAULT_STAR: [number, number, number] = [237, 181, 112]; // gold-400
/** Above this the body dots are light, so the canvas is sitting on a dark section. */
const ON_DARK_LUMINANCE = 0.55;

/**
 * Reads the two particle colours from CSS at sample time, so a section can re-theme the
 * canvas by setting `--particle-body` / `--particle-star` (`.on-dark` does exactly that).
 * `onDark` also decides which logo file the static fallback uses.
 */
export function readParticleTheme(el: Element): ParticleTheme {
  const styles = getComputedStyle(el);
  const body = parseColorTriplet(styles.getPropertyValue("--particle-body")) ?? DEFAULT_BODY;
  const star = parseColorTriplet(styles.getPropertyValue("--particle-star")) ?? DEFAULT_STAR;
  return {
    body: `rgb(${body[0]} ${body[1]} ${body[2]})`,
    star: `rgb(${star[0]} ${star[1]} ${star[2]})`,
    onDark: luminance(body) > ON_DARK_LUMINANCE,
  };
}

/**
 * Turns the logo into dots: alpha > 0.35 only (the PNGs are transparent, so the old
 * "distance from the corner colour" test is neither needed nor correct).
 * The offscreen render is never wider than MAX_DRAW_WIDTH and dot spacing is in CSS px,
 * so the mark looks the same at every viewport width.
 */
export function sampleLogoDots(image: HTMLImageElement, options: SampleOptions): SampleResult {
  const { boxW, boxH, stride, compact } = options;
  const empty: SampleResult = { dots: [], drawW: 0, drawH: 0 };
  if (boxW <= 0 || boxH <= 0 || !image.naturalWidth || !image.naturalHeight) return empty;

  const drawW = Math.max(1, Math.min(compact ? COMPACT_MAX_WIDTH : MAX_DRAW_WIDTH, boxW));
  const drawH = Math.max(1, drawW * LOGO_ASPECT);

  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, Math.round(drawW));
  offscreen.height = Math.max(1, Math.round(drawH));
  const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!offCtx) return empty;

  offCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
  let pixels: Uint8ClampedArray;
  try {
    pixels = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
  } catch {
    return empty; // Unreadable canvas: the caller falls back to a static image.
  }

  const offsetX = (boxW - drawW) / 2;
  const offsetY = (boxH - drawH) / 2;
  const baseSize = compact ? SIZE_COMPACT : SIZE_DESKTOP;
  const dots: Dot[] = [];

  for (let y = 0; y < offscreen.height; y += stride) {
    for (let x = 0; x < offscreen.width; x += stride) {
      const i = (y * offscreen.width + x) * 4;
      if (pixels[i + 3] / 255 <= ALPHA_THRESHOLD) continue;

      const star = isStarPixel(pixels[i], pixels[i + 1], pixels[i + 2]);
      const startX = Math.random() * boxW;
      const startY = Math.random() * boxH;
      dots.push({
        x: startX,
        y: startY,
        x0: startX,
        y0: startY,
        tx: offsetX + x,
        ty: offsetY + y,
        delay: Math.random() * ASSEMBLY_STAGGER_MS,
        size: star ? baseSize * STAR_SCALE : baseSize,
        alpha: star
          ? ALPHA_STAR_MIN + Math.random() * (1 - ALPHA_STAR_MIN)
          : ALPHA_FLOOR + Math.random() * (1 - ALPHA_FLOOR),
        phase: Math.random() * Math.PI * 2,
        star,
      });
    }
  }

  return { dots, drawW, drawH };
}
