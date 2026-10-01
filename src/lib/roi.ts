/**
 * Pure ROI arithmetic for the Home ROI calculator (docs/02 §7). No DOM, no React, no copy:
 * safe to unit-test and to call on every keystroke.
 *
 * The section's whole promise is "nothing here is a promise; it is arithmetic", so this
 * module must never hand the UI a NaN or an Infinity. Every field is bounded, every result
 * is checked, and break-even is `null` (not Infinity) when the fee is zero — the UI turns
 * that null into a prompt rather than a number.
 */

export interface RoiInput {
  avgFee: number;
  noShowsPerDay: number;
  workingDays: number;
  planPrice: number;
}

export interface RoiResult {
  monthlyValue: number;
  /** null when avgFee is 0: break-even is undefined, and the UI shows a prompt instead. */
  breakEvenVisits: number | null;
}

/** Largest value a single field will accept. Anything past this is a typo, not a clinic. */
export const MAX_INPUT = 10_000_000;

/** Nudge so a result landing exactly on an integer is not pushed up by float error. */
const EPSILON = 1e-9;

/**
 * Parse one text field. Commas and whitespace are grouping noise ("1,00,000" -> 100000) and
 * an empty field means 0. A trailing or leading dot with at least one digit is fine
 * ("500." and ".5" both stand in for what the reader is typing). Everything else — a sign,
 * letters, an exponent, a second dot, a bare "." — is invalid and returns null so the field
 * can show its error message.
 */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (cleaned === "") return 0;
  if (!/^\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > MAX_INPUT) return null;
  return value;
}

/**
 * The two numbers the section shows. `monthlyValue` is the money a clinic stops losing;
 * `breakEvenVisits` is how many of those saved visits pay for the plan. Both are always
 * finite for finite inputs, and the ceil guard (minus a hair) keeps ₹3000 ÷ ₹500 at 6
 * instead of 7.
 */
export function computeRoi({ avgFee, noShowsPerDay, workingDays, planPrice }: RoiInput): RoiResult {
  const monthlyValue = noShowsPerDay * workingDays * avgFee;
  const breakEvenVisits =
    avgFee === 0 ? null : Math.max(0, Math.ceil(planPrice / avgFee - EPSILON));

  return {
    monthlyValue: Number.isFinite(monthlyValue) ? monthlyValue : 0,
    breakEvenVisits: breakEvenVisits !== null && Number.isFinite(breakEvenVisits) ? breakEvenVisits : null,
  };
}

/** "₹39,000" / "₹1,00,000" — Indian digit grouping, rupee sign, no paise. */
export function formatRupees(value: number): string {
  return `\u20B9${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

/** A visit count: "6" today, "12,345" if a clinic ever gets there. */
export function formatVisits(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}
