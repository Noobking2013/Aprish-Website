/**
 * The sample timeline shown inside a booking detail (docs/04_GLASS_WALL_SPEC.md,
 * "Opening a card"). Nothing here is real: the four timestamps are DERIVED from the
 * booking's own slot, a few minutes before it, so a card and its detail can never
 * disagree about when the appointment is.
 *
 * Pure and deterministic — the same booking always yields the same four times, which
 * is what makes the wall stable while dragging and what `scripts/detail.check.ts`
 * unit-tests. No clock is ever read: "today" is whatever `booking.day` says.
 */

import { hash3, type SampleBooking } from "./wallData";

/** Minutes before the slot for each step, in order. Every entry is >= 1. */
const MINUTES_BEFORE = [7, 5, 3, 1] as const;

/** "4:15 PM" -> 975. Returns null for anything that is not a booking slot. */
function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/.exec(value.trim());
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minutes = Number(match[2]);
  if (hour12 < 1 || hour12 > 12 || minutes > 59) return null;

  const hour24 = (hour12 % 12) + (match[3] === "PM" ? 12 : 0);
  return hour24 * 60 + minutes;
}

/** 975 -> "4:15 PM". Exactly the shape `wallData.ts` writes, so the two agree. */
function formatTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

/** Digits of the booking id ("APR-4F2A" -> hash of 0x4F2A), so bookings differ. */
function idHash(booking: SampleBooking): number {
  const digits = booking.id.replace(/[^0-9a-f]/gi, "");
  const parsed = Number.parseInt(digits || "0", 16);
  return hash3(parsed || 0, parsed || 0, 11);
}

/**
 * Four sample timestamps for one booking, oldest first, all a few minutes before the
 * slot. One shared per-booking jitter keeps the gaps constant (2, 2, 2 minutes), so
 * the times are always strictly increasing and never land on or after the slot.
 */
export function sampleTimeline(booking: SampleBooking): string[] {
  const slot = parseTime(booking.time) ?? 9 * 60;
  const jitter = idHash(booking) % 3;

  return MINUTES_BEFORE.map((before) => formatTime(slot - (before + jitter)));
}
