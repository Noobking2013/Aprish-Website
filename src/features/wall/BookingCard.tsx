import { memo } from "react";
import { Check } from "lucide-react";
import { WALL } from "@/content/copy";
import type { SampleBooking } from "@/lib/wall/wallData";

/**
 * One confirmed booking on the glass wall (docs/04_GLASS_WALL_SPEC.md, "Card design").
 *
 * The element is 248x156 at unit 1 and is NEVER resized by React: GlassWall writes
 * `transform`, `opacity`, `zIndex`, `display`, `data-lod` and `data-focus` straight onto
 * the node every frame. `memo` and the stable `registerRef` keep React out of that path.
 *
 * `opacity: 0` is the "not placed yet" state — it stops a newly mounted card from
 * flashing at (0, 0) before the render loop has written its first transform.
 */

/** Booking `tint` 0-4 maps to the five soft fill tokens (docs/01). */
const TINT_RING = [
  "ring-tint-sand",
  "ring-tint-mint",
  "ring-tint-lavender",
  "ring-tint-blush",
  "ring-tint-parchment",
] as const;

export interface BookingCardProps {
  /** "${col},${row}" — the key GlassWall files the element under. */
  cellKey: string;
  booking: SampleBooking;
  cardW: number;
  cardH: number;
  /** Stable ref callback from GlassWall (never a new identity). */
  registerRef: (key: string, element: HTMLButtonElement | null) => void;
  /**
   * Phase 4b: clicking a card asks GlassWall to open the detail. The key is
   * `cellKey`, so the wall can find both the booking and this element again.
   * Undefined when the wall is not wired to a detail (older call sites).
   */
  onOpen?: (key: string) => void;
}

/** "Aarav S." — the display name every card shows and leads its aria-label with. */
function bookingName(booking: SampleBooking): string {
  return `${booking.first} ${booking.lastInitial}.`;
}

/**
 * The card's contents, without the interactive button. Extracted in Phase 5b so the Home
 * wall teaser can show the same card as a static, non-interactive div: one source of card
 * markup means the teaser preview can never drift from the live wall.
 *
 * It renders fragments, so dropping it straight into the flex button (or a flex div) keeps
 * the four rows as direct children and the `justify-between` layout byte-for-byte.
 */
export function BookingCardContent({ booking }: { booking: SampleBooking }) {
  const name = bookingName(booking);

  return (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-100/15 ring-1 ${TINT_RING[booking.tint]}`}
          >
            <span className="text-[10px] font-semibold text-cream-100">{booking.initials}</span>
          </span>
          <span className="truncate text-[13px] font-semibold text-cream-100">{name}</span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1.5 pt-0.5">
          <span
            aria-hidden="true"
            className="wall-tick flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-peach-400"
          >
            <Check className="h-2.5 w-2.5 text-teal-950" strokeWidth={3} />
          </span>
          <span className="text-[10px] font-semibold text-cream-100">Confirmed</span>
        </span>
      </span>

      <span className="truncate text-[12px] font-medium text-cream-100">
        {booking.doctor} <span className="text-sage-300">·</span> {booking.specialty}
      </span>

      <span className="flex items-end justify-between gap-2">
        <span className="data text-[11px] text-cream-100">
          {booking.day}, {booking.time}
        </span>
        <span className="data text-[11px] text-cream-100">Token #{booking.token}</span>
      </span>

      <span className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-sage-300">via WhatsApp</span>
        <span className="data text-[10px] text-sage-300">{booking.id}</span>
      </span>
    </>
  );
}

function BookingCardBase({ cellKey, booking, cardW, cardH, registerRef, onOpen }: BookingCardProps) {
  return (
    <button
      type="button"
      ref={(element) => registerRef(cellKey, element)}
      className="glass wall-card flex flex-col justify-between px-4 py-3.5 text-left"
      style={{ width: cardW, height: cardH, transformOrigin: "center", opacity: 0 }}
      onClick={onOpen ? () => onOpen(cellKey) : undefined}
    >
      <BookingCardContent booking={booking} />
      {/*
        The accessible name is the card's own visible text, so WCAG 2.5.3 (Label in Name)
        holds — an aria-label that re-worded the card dropped the visible "via WhatsApp"
        and booking-id strings. The sample-data honesty suffix rides along as visually-hidden
        text, so no card is ever read without it (docs/04).
      */}
      <span className="sr-only">{WALL.cardSuffix}</span>
    </button>
  );
}

export const BookingCard = memo(BookingCardBase);
