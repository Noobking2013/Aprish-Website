/**
 * Phase 4b check: the sample timeline, the entrance maths and the dialog's markup.
 *
 * Run it with:
 *   JITI_JSX=1 JITI_TSCONFIG_PATHS=1 npx jiti scripts/detail.check.ts
 *
 * The two env vars are needed because BookingDetail.tsx is the app's first module with
 * JSX in it, and it imports through "@/" exactly like every app module:
 *   JITI_JSX            turns on jiti's JSX transform.
 *   JITI_TSCONFIG_PATHS makes jiti honour the "@/..." alias from tsconfig.json paths.
 * (scripts/wall.check.ts needs neither — it only imports plain .ts modules.)
 *
 * jiti compiles JSX with the classic runtime, so this script puts React on globalThis
 * BEFORE importing the component. Only BookingDetailContent is rendered: BookingDetail
 * itself calls createPortal, which React 19 refuses to server-render — that split is
 * exactly why the content half exists.
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as unknown as { React: typeof React }).React = React;

const { BookingDetailContent } = await import("../src/features/wall/BookingDetail");
const { sampleTimeline } = await import("../src/lib/wall/timeline");
const { bookingAt } = await import("../src/lib/wall/wallData");
const { introProgress, mix, rankDelay, INTRO_MIN_SCALE } = await import(
  "../src/features/wall/intro"
);
const { WALL } = await import("../src/content/copy");
const { STATUS_LABEL } = await import("../src/content/status");

let fails = 0;
const ok = (c: boolean, msg: string) => {
  if (!c) {
    fails++;
    console.log("FAIL:", msg);
  }
};

/** "4:15 PM" -> 975. Independent of the module under test on purpose. */
const toMinutes = (value: string): number => {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  if (!match) return Number.NaN;
  return (Number(match[1]) % 12) * 60 + (match[3] === "PM" ? 720 : 0) + Number(match[2]);
};

/* ---------------- 1. the sample timeline ---------------- */

const sample = bookingAt(3, -5);
const times = sampleTimeline(sample);
ok(
  JSON.stringify(times) === JSON.stringify(sampleTimeline(bookingAt(3, -5))),
  "sampleTimeline must be deterministic",
);
ok(times.length === WALL.detail.steps.length, "one time per step of the timeline");
console.log("booking", sample.id, sample.time, "->", times.join("  "));

const gaps = new Set<number>();
const leads = new Set<number>();
let checked = 0;
for (let col = -30; col <= 30; col += 1) {
  for (let row = -20; row <= 20; row += 1) {
    const booking = bookingAt(col, row);
    const list = sampleTimeline(booking);
    const slot = toMinutes(booking.time);
    if (list.length !== 4) ok(false, `4 steps expected for ${booking.id}`);
    let previous = Number.NEGATIVE_INFINITY;
    list.forEach((time, index) => {
      const value = toMinutes(time);
      if (!Number.isFinite(value)) ok(false, `unparseable time "${time}" for ${booking.id}`);
      if (!(value > previous)) ok(false, `step ${index} is not after step ${index - 1} (${booking.id})`);
      if (!(value < slot)) ok(false, `step ${index} (${time}) is not before the slot (${booking.id})`);
      if (index > 0) gaps.add(value - previous);
      previous = value;
    });
    leads.add(slot - toMinutes(list[0]));
    checked += 1;
  }
}
console.log(
  "timelines checked:",
  checked,
  "| step gaps:",
  [...gaps].join("/"),
  "| lead times:",
  [...leads].sort((a, b) => a - b).join("/"),
);
ok(checked === 61 * 41, "every cell in the sweep must produce a timeline");
ok(gaps.size === 1 && gaps.has(2), "each step must be exactly 2 minutes after the previous");
ok(leads.size > 1, "bookings must not all share one lead time");
ok(Math.max(...leads) <= 15, "the first step must stay within a quarter hour of the slot");

/* ---------------- 2. the entrance maths (D10) ---------------- */

const BATCH_MAX_RANK = 12;
ok(introProgress(0, 0, BATCH_MAX_RANK) === 0, "the centre card starts at 0");
ok(introProgress(1, 0, BATCH_MAX_RANK) === 1, "the centre card ends at 1");
ok(rankDelay(0) === 0, "a single-rank batch has no delay");
ok(rankDelay(3) === 0.09, "a small batch keeps the full 0.09 delay");
ok(rankDelay(BATCH_MAX_RANK) * BATCH_MAX_RANK + 0.5 <= 1 + 1e-9, "the wave must fit maxRank");
console.log(
  "rank delay @maxRank",
  BATCH_MAX_RANK,
  "=",
  rankDelay(BATCH_MAX_RANK).toFixed(4),
  "| last card lands at",
  (rankDelay(BATCH_MAX_RANK) * BATCH_MAX_RANK + 0.5).toFixed(3),
);

let monotonic = true;
let staggered = true;
let settled = true;
for (let rank = 0; rank <= BATCH_MAX_RANK; rank += 1) {
  let previous = -1;
  for (let step = 0; step <= 200; step += 1) {
    const progress = introProgress(step / 200, rank, BATCH_MAX_RANK);
    if (progress < previous - 1e-9) monotonic = false;
    if (progress < 0 || progress > 1) ok(false, `progress out of range at rank ${rank}`);
    previous = progress;
  }
  if (introProgress(0.75, rank, BATCH_MAX_RANK) < introProgress(0.75, rank + 1, BATCH_MAX_RANK)) {
    staggered = false;
  }
  if (introProgress(1, rank, BATCH_MAX_RANK) !== 1) settled = false;
}
ok(monotonic, "progress must never go backwards as the scalar advances");
ok(staggered, "a further card must never be ahead of a nearer one");
ok(settled, "every first-batch card must be fully in when the entrance ends");
ok(introProgress(-1, 0, BATCH_MAX_RANK) === 0, "progress clamps at 0");
ok(introProgress(2, 0, BATCH_MAX_RANK) === 1, "progress clamps at 1");
const justBefore = introProgress(0.999, BATCH_MAX_RANK, BATCH_MAX_RANK);
console.log("the furthest card is at", justBefore.toFixed(3), "just before the scalar lands");
ok(justBefore > 0.99, "the furthest card must not pop in at the end of the entrance");
ok(mix(INTRO_MIN_SCALE, 1, 0) === INTRO_MIN_SCALE, "mix starts at the intro scale");
ok(mix(INTRO_MIN_SCALE, 1, 1) === 1, "mix ends at the lens scale");
ok(mix(0, 10, 0.25) === 2.5, "mix interpolates");

/* ---------------- 3. the dialog's server-rendered markup ---------------- */

const one = bookingAt(1, 1);
const oneTimes = sampleTimeline(one);
const html = renderToStaticMarkup(
  React.createElement(BookingDetailContent, {
    booking: one,
    steps: oneTimes,
    onRequestClose: () => {},
  }) as React.ReactElement,
);
console.log("dialog markup:", html.length, "characters");

ok(html.includes('role="dialog"'), "the panel must be a dialog");
ok(html.includes('aria-modal="true"'), "the dialog must be modal");
ok(html.includes(`aria-label="${WALL.detail.dialogLabel}"`), "the dialog must be labelled (with the sample-data half)");
ok(html.includes("wall-dialog"), "the panel must carry its own class");
ok(html.includes(`${one.first} ${one.lastInitial}.`), "the dialog must name the patient");
ok(html.includes(one.doctor) && html.includes(one.specialty), "the dialog must show doctor and specialty");
ok(html.includes(one.id) && html.includes(WALL.detail.bookingIdLabel), "the dialog must show the booking id");
ok(html.includes(`>${one.token}<`), "the dialog must show the token");
ok(html.includes(one.day) && html.includes(one.time), "the dialog must show the slot");
ok(html.includes(`>${WALL.detail.close}<`), "the dialog must offer a Close control");
oneTimes.forEach((time) => {
  if (!html.includes(time)) ok(false, `the timeline must show ${time}`);
});
WALL.detail.steps.forEach((label) => {
  if (!html.includes(label)) ok(false, `the timeline must show "${label}"`);
});
ok(html.includes(WALL.detail.timelineLabel), "the step list must be labelled as sample");
ok(html.includes(WALL.detail.footer) && html.includes(WALL.sampleChip), "the dialog must repeat the sample-data label");

/* Honesty (docs/03, D8): the demo chrome may never claim a status. */
Object.values(STATUS_LABEL).forEach((label) => {
  if (html.includes(label)) ok(false, `the dialog must not claim a status: "${label}"`);
});

/* D12: GSAP owns x/y/width/height, so the markup must not carry layout of its own. */
ok(!/style="[^"]*(width|height)/.test(html), "the markup must not set a width or height");
ok(html.includes("z-index:70"), "the panel must sit at z-70 (above the HUD, below the menu)");
ok(html.includes("<h2") && !html.includes("<h1"), "the dialog uses h2 — the route already owns the h1");

console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);

