/**
 * Phase 5b check: the ROI calculator's pure arithmetic (src/lib/roi.ts).
 *
 * Run it with:
 *   jiti scripts/roi.check.ts
 *
 * No JSX and no "@/..." imports — like scripts/wall.check.ts, so jiti needs neither of its
 * env vars here. Everything is asserted against behaviour, never against the module's source.
 */

import {
  computeRoi,
  formatRupees,
  formatVisits,
  parseNumber,
  MAX_INPUT,
} from "../src/lib/roi";

let fails = 0;
const ok = (c: boolean, msg: string) => {
  if (!c) {
    fails++;
    console.log("FAIL:", msg);
  }
};
const eq = (actual: unknown, expected: unknown, msg: string) =>
  ok(actual === expected, `${msg} — expected ${String(expected)}, got ${String(actual)}`);

/* ---------- 1. the deck's defaults ---------- */

const defaults = { avgFee: 500, noShowsPerDay: 3, workingDays: 26, planPrice: 3000 };
const result = computeRoi(defaults);
eq(result.monthlyValue, 39_000, "defaults monthly value");
eq(result.breakEvenVisits, 6, "defaults break-even visits");
eq(formatRupees(result.monthlyValue), "\u20B939,000", "defaults monthly value formats as ₹39,000");

/* ---------- 2. break-even ceil + epsilon ---------- */

eq(computeRoi({ ...defaults, planPrice: 3000 }).breakEvenVisits, 6, "₹3,000 ÷ ₹500 stays at 6");
eq(computeRoi({ ...defaults, planPrice: 3001 }).breakEvenVisits, 7, "₹3,001 ÷ ₹500 rounds up to 7");
eq(computeRoi({ ...defaults, planPrice: 0 }).breakEvenVisits, 0, "a free plan needs 0 visits");
eq(computeRoi({ ...defaults, planPrice: 6000 }).breakEvenVisits, 12, "₹6,000 ÷ ₹500 = 12");
eq(computeRoi({ ...defaults, planPrice: 5500 }).breakEvenVisits, 11, "₹5,500 ÷ ₹500 = 11 exactly");

/* ---------- 3. zero fee -> null, never Infinity ---------- */

const zero = computeRoi({ ...defaults, avgFee: 0 });
eq(zero.breakEvenVisits, null, "zero fee must yield null");
eq(zero.monthlyValue, 0, "zero fee makes the monthly value 0");
ok(zero.breakEvenVisits !== Infinity, "zero fee must not be Infinity");

/* ---------- 4. nothing is ever NaN or Infinity for finite inputs ---------- */

for (const avgFee of [0, 1, 7, 500, 1_000_000, MAX_INPUT]) {
  for (const planPrice of [0, 1, 3000, 5_000_000, MAX_INPUT]) {
    for (const noShowsPerDay of [0, 3, MAX_INPUT]) {
      const out = computeRoi({ avgFee, noShowsPerDay, workingDays: 26, planPrice });
      ok(Number.isFinite(out.monthlyValue), `monthlyValue finite (fee ${avgFee}, price ${planPrice})`);
      ok(
        out.breakEvenVisits === null || Number.isFinite(out.breakEvenVisits),
        `break-even finite (fee ${avgFee}, price ${planPrice})`,
      );
    }
  }
}

/* ---------- 5. parseNumber ---------- */

eq(parseNumber(""), 0, "empty field is 0");
eq(parseNumber("500"), 500, "plain integer");
eq(parseNumber("0"), 0, "explicit zero");
eq(parseNumber("1,00,000"), 100000, "commas are grouping noise");
eq(parseNumber("1 00 000"), 100000, "spaces are grouping noise");
eq(parseNumber("3.5"), 3.5, "decimal point");
eq(parseNumber(".5"), 0.5, "leading dot");
eq(parseNumber("500."), 500, "trailing dot");
eq(parseNumber("-5"), null, "negative is invalid");
eq(parseNumber("abc"), null, "letters are invalid");
eq(parseNumber("1e5"), null, "exponent notation is invalid");
eq(parseNumber("1.2.3"), null, "two dots are invalid");
eq(parseNumber("."), null, "a bare dot is invalid");
eq(parseNumber(String(MAX_INPUT)), MAX_INPUT, "exactly the cap is fine");
eq(parseNumber(String(MAX_INPUT + 1)), null, "over the cap is invalid");

/* ---------- 6. formatting ---------- */

eq(formatRupees(39000), "\u20B939,000", "thousand grouping");
eq(formatRupees(100000), "\u20B91,00,000", "lakh grouping");
eq(formatVisits(6), "6", "visit count");
eq(formatVisits(12345), "12,345", "big visit count groups");

console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);
