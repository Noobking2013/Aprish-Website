import { useEffect, useMemo, useRef, type CSSProperties, type Ref } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { WALL } from "@/content/copy";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { sampleTimeline } from "@/lib/wall/timeline";
import type { SampleBooking } from "@/lib/wall/wallData";

/**
 * The booking detail a card opens into (docs/04_GLASS_WALL_SPEC.md, "Opening a card").
 *
 * Split in two on purpose:
 *
 *   BookingDetailContent  the markup. Portal-free, hook-free and GSAP-free, so it can
 *                         be server-rendered and asserted in scripts/detail.check.ts.
 *   BookingDetail         the flight, the focus trap and the portal.
 *
 * D12: the flight is `position: fixed` with animated `x`/`y`/`width`/`height`. It has to
 * be, because the wall lives inside `#route-root`, which carries a `transform` during the
 * page enter — `position: fixed` inside that ancestor would resolve against it. The
 * portal to `document.body` is what makes fixed mean fixed. `height` is measured once
 * and tweened as a number; `height: auto` is never animated.
 */

/* Registering the curve is idempotent, and doing it at module scope guarantees it exists
   before the first tween — which may be the very first click on a card. */
gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9,0,0.1,1");

/** Fraction of the viewport height the panel may take. */
const PANEL_MAX_VH = 0.88;
/** The flight itself (docs/04). */
const FLIGHT_S = 0.9;
/** The content only fades in once the panel has mostly landed (docs/04: 0.5s). */
const CONTENT_DELAY_S = 0.5;
const CONTENT_FADE_S = 0.4;
/** Reduced motion: a short fade in place, no flight. */
const FADE_S = 0.16;
/** z-70: above the navbar (50) and the HUD (40), below the menu (80) and stairs (90). */
const DIALOG_Z = 70;

const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/* The portal target only exists in a browser. Guarded so importing this module is safe
   in the SSR check (which never renders BookingDetail, only its content). */
const canUseDOM = typeof document !== "undefined";

export interface BookingDetailContentProps {
  booking: SampleBooking;
  /** Four sample timestamps, oldest first. See src/lib/wall/timeline.ts. */
  steps: string[];
  /** Escape, the overlay and the Close button all end here. */
  onRequestClose: () => void;
  /** The panel element BookingDetail measures and flies. */
  dialogRef?: Ref<HTMLDivElement>;
  /** The inner content BookingDetail cross-fades. */
  contentRef?: Ref<HTMLDivElement>;
  /** Inline style hook — BookingDetail uses it; server-rendered markup stays clean. */
  style?: CSSProperties;
}
/**
 * The dialog itself. `role="dialog"` + `aria-modal` + `aria-label` are what make it a
 * dialog to assistive tech; the label says "sample data" because every booking here is
 * fictional (PROJECT_RULES.md, demo rules). It renders no status word of its own.
 */
export function BookingDetailContent({
  booking,
  steps,
  onRequestClose,
  dialogRef,
  contentRef,
  style,
}: BookingDetailContentProps) {
  const name = `${booking.first} ${booking.lastInitial}.`;
  const labels = WALL.detail.steps;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={WALL.detail.dialogLabel}
      tabIndex={-1}
      style={{ zIndex: DIALOG_Z, ...style }}
      className="wall-dialog glass"
    >
      <div ref={contentRef} className="wall-dialog__content">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="data text-[10px] uppercase tracking-[0.18em] text-sage-300">
              {WALL.detail.tokenLabel}
            </p>
            <p className="data mt-1 text-4xl leading-none text-cream-100">{booking.token}</p>
          </div>
          {/* Decoration: the dialog's accessible name already says "sample data". */}
          <span aria-hidden="true" className="glass glass--light wall-chip" data-sample="true">
            {WALL.sampleChip}
          </span>
        </div>

        <p className="mt-5 text-lg font-semibold text-cream-100">{name}</p>
        <p className="mt-1 text-sm text-cream-100">
          {booking.doctor} <span className="text-sage-300">·</span> {booking.specialty}
        </p>

        <p className="data mt-3 text-sm text-cream-100">
          {booking.day}, {booking.time}
        </p>
        <p className="data mt-1 text-[11px] text-sage-300">
          {WALL.detail.bookingIdLabel} {booking.id}
        </p>

        <h2 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-300">
          {WALL.detail.timelineLabel}
        </h2>
        <ol className="mt-3 space-y-2.5">
          {labels.map((label, index) => (
            <li key={label} className="flex items-baseline gap-3">
              <span className="data w-14 shrink-0 text-[11px] text-sage-300">
                {steps[index] ?? ""}
              </span>
              <span className="text-[13px] text-cream-100">{label}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-cream-100/15 pt-4">
          <p className="text-[11px] text-sage-300">{WALL.detail.footer}</p>
          <button
            type="button"
            onClick={onRequestClose}
            className="glass glass--light shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-teal-900"
          >
            {WALL.detail.close}
          </button>
        </div>
      </div>
    </div>
  );
}


export interface BookingDetailProps {
  booking: SampleBooking;
  /** The mounted card the panel flies out of, or null if it has gone. */
  anchor: HTMLElement | null;
  /** True while the wall has this booking open; false plays the reverse flight. */
  open: boolean;
  /** Asked to close (Escape, overlay, Close button). The caller clears its own state. */
  onRequestClose: () => void;
  /** The panel has finished leaving and the caller may unmount this component. */
  onClosed: () => void;
}

export function BookingDetail({
  booking,
  anchor,
  open,
  onRequestClose,
  onClosed,
}: BookingDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  /** The card rect captured at open time. Null when there was no card. */
  const cardRectRef = useRef<DOMRect | null>(null);
  /** True while the open flight runs, so a stray click cannot interrupt it. */
  const busyRef = useRef(true);
  /** The close flight runs once and only once, whatever re-renders happen meanwhile. */
  const closingRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  /** Sample timestamps for this booking. Pure, so this is stable for the whole flight. */
  const steps = useMemo(() => sampleTimeline(booking), [booking]);

  /* ---------------- the open flight (once, on mount) ---------------- */
  useGSAP(
    () => {
      const dialog = dialogRef.current;
      const content = contentRef.current;
      const overlay = overlayRef.current;
      if (!dialog || !content || !overlay) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      /* Natural height at the panel's own width, measured once — never `height: auto`
         in a tween. The width itself comes from CSS (min(92vw, 520px)). */
      const width = dialog.getBoundingClientRect().width;
      const height = Math.min(dialog.offsetHeight, vh * PANEL_MAX_VH);
      const target = { left: (vw - width) / 2, top: (vh - height) / 2, width, height };

      const cardRect = anchor?.getBoundingClientRect() ?? null;
      cardRectRef.current = cardRect;

      /* The card stays where it is (the wall loop is frozen) but stops being visible,
         so only the panel is on screen for the duration of the flight. */
      if (anchor) anchor.style.visibility = "hidden";

      if (reducedMotion || !cardRect) {
        gsap.set(dialog, { ...target, opacity: 1 });
        gsap.set(content, { opacity: 1 });
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: FADE_S, ease: "power2.out" });
        busyRef.current = false;
        return;
      }

      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
      gsap.fromTo(
        dialog,
        {
          x: cardRect.left,
          y: cardRect.top,
          width: cardRect.width,
          height: cardRect.height,
          opacity: 0.5,
        },
        {
          x: target.left,
          y: target.top,
          width: target.width,
          height: target.height,
          opacity: 1,
          duration: FLIGHT_S,
          ease: "hop",
          onComplete: () => {
            busyRef.current = false;
          },
        },
      );
      gsap.fromTo(
        content,
        { opacity: 0 },
        { opacity: 1, duration: CONTENT_FADE_S, delay: CONTENT_DELAY_S, ease: "power2.out" },
      );
    },
    { dependencies: [] },
  );

  /* ---------------- focus: land on the panel, trap Tab inside ---------------- */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!busyRef.current) onRequestClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && dialog.contains(active);

      if (event.shiftKey && (!inside || active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    /* Capture phase: the camera also listens on window and the menu closes on Escape,
       so the dialog must see the key first while it is open. */
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onRequestClose]);

  /* ---------------- the close flight (when `open` goes false) ---------------- */
  useEffect(() => {
    if (open || closingRef.current) return;
    closingRef.current = true;

    const dialog = dialogRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!dialog || !content || !overlay) {
      onClosed();
      return;
    }

    const finish = () => {
      /* Restore the card only if it is still the same node (a range change could have
         unmounted it) and hand focus back to it: focus returns to where it came from. */
      if (anchor?.isConnected) {
        anchor.style.visibility = "";
        anchor.focus({ preventScroll: true });
      }
      onClosed();
    };

    const cardRect = cardRectRef.current;
    const live = anchor?.isConnected ? anchor.getBoundingClientRect() : null;
    /* D12: no flight if the card is gone or the viewport changed under us — a resize
       moves the card, and flying to a stale rect would land on nonsense. */
    const sameRect =
      !!cardRect &&
      !!live &&
      Math.abs(live.left - cardRect.left) < 1 &&
      Math.abs(live.top - cardRect.top) < 1 &&
      Math.abs(live.width - cardRect.width) < 1 &&
      Math.abs(live.height - cardRect.height) < 1;

    if (reducedMotion || !cardRect || !sameRect) {
      gsap.to([overlay, dialog], {
        opacity: 0,
        duration: FADE_S,
        ease: "power2.in",
        onComplete: finish,
      });
      return;
    }

    gsap.to(overlay, { opacity: 0, duration: FLIGHT_S, ease: "power2.in" });
    gsap.to(content, { opacity: 0, duration: 0.2, ease: "power2.in" });
    gsap.to(dialog, {
      x: cardRect.left,
      y: cardRect.top,
      width: cardRect.width,
      height: cardRect.height,
      opacity: 0,
      duration: FLIGHT_S,
      ease: "hop",
      onComplete: finish,
    });
  }, [open, anchor, reducedMotion, onClosed]);

  if (!canUseDOM) return null;

  return createPortal(
    <>
      {/* Dim + blur the stage. The panel sits above it, so a click that reaches this
          element was a click outside the dialog. */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="wall-dialog-overlay"
        style={{ zIndex: DIALOG_Z }}
        onClick={() => {
          if (!busyRef.current) onRequestClose();
        }}
      />
      <BookingDetailContent
        booking={booking}
        steps={steps}
        onRequestClose={() => {
          if (!busyRef.current) onRequestClose();
        }}
        dialogRef={dialogRef}
        contentRef={contentRef}
      />
    </>,
    document.body,
  );
}

