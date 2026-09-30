import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  ALPHA_BODY_MIN,
  ALPHA_STAR_MIN,
  ARC_MIN_SIZE,
  ASSEMBLY_MS,
  ASSEMBLY_STAGGER_MS,
  DPR_CAP,
  LOGO_FALLBACK_ON_DARK,
  LOGO_FALLBACK_ON_LIGHT,
  LOGO_SAMPLE_SRC,
  MAX_FRAME_MS,
  REPEL_FORCE,
  REPEL_RADIUS,
  RESIZE_DEBOUNCE_MS,
  SHIMMER_DEPTH,
  SHIMMER_SPEED,
  SPRING,
  easeOutCubic,
  pickStride,
  readParticleTheme,
  sampleLogoDots,
  type Dot,
  type ParticleTheme,
} from "./logoDots";

export interface LogoParticlesProps {
  className?: string;
  /** Smaller and denser: the footer or the full-screen menu (max 240px wide). */
  compact?: boolean;
  /** Default true. Turn off for low-opacity decoration, e.g. behind the /black badge. */
  interactive?: boolean;
}

/**
 * The Aprish mark sampled into a few thousand dots that assemble themselves, then react
 * to the cursor and shimmer. docs/06_LOGO_DOTS_AND_PHONE_SPEC.md, section A.
 *
 * Everything expensive is guarded: the rAF loop stops when the canvas leaves the
 * viewport or the tab is hidden (`canvas.dataset.paused` mirrors that for checks),
 * the DPR is capped at 2, and re-sampling on resize is debounced.
 */
export function LogoParticles({
  className = "",
  compact = false,
  interactive = true,
}: LogoParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState(LOGO_FALLBACK_ON_LIGHT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cancelled = false;
    let imageReady = false;
    let running = false;
    let rafId = 0;
    let resizeTimer = 0;
    let clockMs = 0;
    let lastFrameMs = 0;
    /** False until the mark has finished forming; drives the assembly interpolation. */
    let assembled = false;
    let inView = true;
    let tabVisible = !document.hidden;
    let viewW = 0;
    let viewH = 0;
    let dots: Dot[] = [];
    let theme: ParticleTheme = readParticleTheme(canvas);
    const pointer = { x: -1000, y: -1000, active: false };
    const motion = () => (prefersReducedMotion ? 0 : 1);

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewW = rect.width;
      viewH = rect.height;
    };

    const resample = () => {
      sizeCanvas();
      theme = readParticleTheme(canvas);
      if (!imageReady || viewW <= 0 || viewH <= 0) {
        dots = [];
        return;
      }
      const wasAssembled = assembled;
      dots = sampleLogoDots(image, {
        boxW: viewW,
        boxH: viewH,
        stride: pickStride(window.innerWidth, viewW, compact),
        compact,
      }).dots;
      // A resize must not replay the assembly, and reduced motion never animates.
      assembled = wasAssembled || prefersReducedMotion;
      if (assembled) {
        for (const dot of dots) {
          dot.x = dot.tx;
          dot.y = dot.ty;
        }
      }
    };

    const draw = (timeMs: number) => {
      ctx.clearRect(0, 0, viewW, viewH);
      const animated = motion() === 1;
      const repelling = animated && interactive && pointer.active;

      for (const dot of dots) {
        if (animated) {
          if (!assembled) {
            const eased = easeOutCubic((clockMs - dot.delay) / ASSEMBLY_MS);
            dot.x = dot.x0 + (dot.tx - dot.x0) * eased;
            dot.y = dot.y0 + (dot.ty - dot.y0) * eased;
          } else if (repelling) {
            const dx = pointer.x - dot.x;
            const dy = pointer.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < REPEL_RADIUS) {
              const force = (REPEL_RADIUS - distance) / REPEL_RADIUS;
              dot.x -= (dx / Math.max(distance, 1)) * force * REPEL_FORCE;
              dot.y -= (dy / Math.max(distance, 1)) * force * REPEL_FORCE;
            } else {
              dot.x += (dot.tx - dot.x) * SPRING;
              dot.y += (dot.ty - dot.y) * SPRING;
            }
          } else {
            dot.x += (dot.tx - dot.x) * SPRING;
            dot.y += (dot.ty - dot.y) * SPRING;
          }
        }

        const shimmer = animated
          ? Math.sin(timeMs * SHIMMER_SPEED + dot.phase) * SHIMMER_DEPTH
          : 0;
        const floor = dot.star ? ALPHA_STAR_MIN : ALPHA_BODY_MIN;
        ctx.globalAlpha = Math.min(1, Math.max(floor, dot.alpha + shimmer));
        ctx.fillStyle = dot.star ? theme.star : theme.body;
        if (dot.size < ARC_MIN_SIZE) {
          // fillRect is measurably cheaper than arc for 1 to 2px dots.
          ctx.fillRect(dot.x - dot.size / 2, dot.y - dot.size / 2, dot.size, dot.size);
        } else {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (!assembled && clockMs >= ASSEMBLY_MS + ASSEMBLY_STAGGER_MS) assembled = true;
    };

    const loop = (now: number) => {
      if (cancelled || !running) return;
      // Clamped so a long gap (hidden tab) cannot skip the assembly.
      clockMs += lastFrameMs ? Math.min(MAX_FRAME_MS, now - lastFrameMs) : 0;
      lastFrameMs = now;
      draw(now);
      rafId = requestAnimationFrame(loop);
    };

    const setRunning = (next: boolean) => {
      if (next === running || cancelled) return;
      running = next;
      canvas.dataset.paused = next ? "false" : "true";
      if (next) {
        lastFrameMs = 0;
        rafId = requestAnimationFrame(loop);
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    /** The loop only runs when it can be seen, and never under reduced motion. */
    const syncRunning = () => {
      setRunning(motion() === 1 && inView && tabVisible && dots.length > 0);
    };

    const image = new Image();
    image.decoding = "async";
    image.src = LOGO_SAMPLE_SRC;
    let loaded = false;

    const onLoad = () => {
      if (cancelled || loaded) return;
      loaded = true;
      imageReady = true;
      resample();
      draw(0);
      syncRunning();
    };

    const onError = () => {
      if (cancelled) return;
      // A blank canvas is worse than a plain logo: swap in the static file that matches
      // the theme this canvas resolved to.
      imageReady = false;
      dots = [];
      setFallbackSrc(
        readParticleTheme(canvas).onDark ? LOGO_FALLBACK_ON_DARK : LOGO_FALLBACK_ON_LIGHT,
      );
      setFailed(true);
    };

    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError);

    const intersection =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            (entries) => {
              const entry = entries[entries.length - 1];
              if (!entry) return;
              inView = entry.isIntersecting;
              syncRunning();
            },
            { rootMargin: "80px" },
          );
    intersection?.observe(canvas);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
              resample();
              draw(0);
              syncRunning();
            }, RESIZE_DEBOUNCE_MS);
          });
    resizeObserver?.observe(canvas);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      syncRunning();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const readPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return; // Touch repels only while pressed.
      readPointer(event);
      pointer.active = true;
    };
    const onPointerDown = (event: PointerEvent) => {
      readPointer(event);
      pointer.active = true;
    };
    const onPointerUp = () => {
      pointer.active = false;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    if (interactive) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerdown", onPointerDown);
      // Lift and cancel can land outside the canvas.
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }

    resample();
    if (image.complete && image.naturalWidth > 0) onLoad();
    else syncRunning();

    return () => {
      cancelled = true;
      setRunning(false);
      window.clearTimeout(resizeTimer);
      intersection?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };
  }, [compact, interactive, prefersReducedMotion, failed]);

  if (failed) {
    return <img src={fallbackSrc} alt="" className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-paused="true"
      className={`touch-pan-y ${className}`}
    />
  );
}
