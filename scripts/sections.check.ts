/**
 * Phase 5a/5b check: the Home sections (docs/02 §2, §3, §5, §6, §7) and the
 * no-invented-copy rule.
 *
 * Run it with:
 *   JITI_JSX=1 JITI_TSCONFIG_PATHS=1 npx jiti scripts/sections.check.ts
 *
 * Same two env vars as scripts/detail.check.ts, and for the same reasons: the modules under
 * test are JSX that import through "@/", so jiti needs its JSX transform on and the tsconfig
 * paths honoured. React must be on globalThis first because jiti compiles JSX with the
 * classic runtime.
 *
 * Each section is rendered on its own rather than through HomePage, so no router is needed.
 * Problem renders a TLink, and TLink calls useTransition() before it decides the link is a
 * plain "#flow" hash anchor, so that one subtree is wrapped in a stub provider.
 *
 * Everything is asserted against src/content/copy.ts and src/content/status.ts, never against
 * a literal typed here — a hard-coded string in this file would defeat the point of (E).
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as unknown as { React: typeof React }).React = React;

const { Problem } = await import("../src/features/home/Problem");
const { Flow } = await import("../src/features/home/Flow");
const { Safety } = await import("../src/features/home/Safety");
const { WallTeaser, TEASER_CARDS } = await import("../src/features/home/WallTeaser");
const { RoiCalculator } = await import("../src/features/home/RoiCalculator");
const { BetaCta } = await import("../src/features/home/BetaCta");
const { FEATURE_ICON } = await import("../src/features/home/featureIcons");
const { TransitionContext } = await import("../src/features/transitions/useTransition");
const { PROBLEM, FLOW, SAFETY, WALL_TEASER, WALL, ROI, BETA } = await import("../src/content/copy");
const { formatRupees, formatVisits } = await import("../src/lib/roi");
const content = await import("../src/content/status");

const { FEATURES, PRIVACY, STATUS_LABEL, TBC_STATUS, TBC_LABEL, chipFor } = content;

let fails = 0;
const ok = (condition: boolean, message: string) => {
  if (!condition) {
    fails += 1;
    console.log("FAIL:", message);
  }
};

const stub = {
  go: () => {},
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  isBusy: false,
  menuButtonRef: { current: null },
};

const problemHtml = renderToStaticMarkup(
  React.createElement(TransitionContext.Provider, { value: stub }, React.createElement(Problem)),
);
const flowHtml = renderToStaticMarkup(React.createElement(Flow));
const safetyHtml = renderToStaticMarkup(React.createElement(Safety));
/* The teaser renders a TLink to /live (not a hash), so it needs the transition stub too. */
const teaserHtml = renderToStaticMarkup(
  React.createElement(TransitionContext.Provider, { value: stub }, React.createElement(WallTeaser)),
);
const roiHtml = renderToStaticMarkup(React.createElement(RoiCalculator));
/* BetaCta renders the form, whose only links are external WhatsApp <a>s — no TLink, no stub. */
const betaHtml = renderToStaticMarkup(React.createElement(BetaCta));

/* -------------------------------- A. Problem (docs/02 §2) -------------------------------- */

ok(problemHtml.includes('data-nav-theme="dark"'), "Problem must declare the dark navbar theme");
ok(problemHtml.includes("on-dark"), "Problem must sit on .on-dark so body text is sage-300");
ok(problemHtml.includes("bg-teal-900"), "Problem must be the teal-900 band");
ok(problemHtml.includes('href="#flow"'), "the See-how link must be a plain #flow anchor");
ok(problemHtml.includes(PROBLEM.seeHow), "the See-how link must use PROBLEM.seeHow");
ok(!problemHtml.includes("coral"), "Problem icons must not be coral (docs/09 D14: teal-700)");

const tealIcons = [...problemHtml.matchAll(/<svg[^>]*class="([^"]*)"/g)].filter((match) =>
  match[1].includes("text-teal-700"),
).length;
ok(
  tealIcons === PROBLEM.cards.length,
  `Problem must draw ${PROBLEM.cards.length} teal-700 icons, found ${tealIcons}`,
);

PROBLEM.cards.forEach((card, index) => {
  const chip = chipFor(FEATURES[card.feature].status);
  if (!problemHtml.includes(card.title)) ok(false, `Problem card ${index + 1} must show its title`);
  if (!problemHtml.includes(card.body)) ok(false, `Problem card ${index + 1} must show its body`);
  if (!problemHtml.includes(`data-status="${chip.status}"`)) {
    ok(false, `Problem card ${index + 1} (${card.feature}) must carry its status chip`);
  }
  if (!problemHtml.includes(`<span class="chip mt-4"`)) {
    ok(false, `Problem card ${index + 1} must render the chip as a chip`);
  }
});

/* --------------------------------- B. Flow (docs/02 §3) --------------------------------- */

ok(flowHtml.includes('data-nav-theme="light"'), "Flow must declare the light navbar theme");
ok(flowHtml.includes('id="flow"'), "Flow must be the #flow target Problem links to");
ok(flowHtml.includes("scroll-mt-24"), "Flow must offset the sticky navbar for the #flow jump");
ok(flowHtml.includes('role="tablist"'), "the pills must be a tablist");
ok(flowHtml.includes('aria-labelledby="flow-title"'), "the tablist must be named by the H2");

const tabs = (flowHtml.match(/role="tab"/g) ?? []).length;
const panels = (flowHtml.match(/role="tabpanel"/g) ?? []).length;
ok(tabs === FLOW.steps.length, `one tab per step, expected ${FLOW.steps.length} found ${tabs}`);
ok(
  panels === FLOW.steps.length,
  `one tabpanel per step, expected ${FLOW.steps.length} found ${panels}`,
);
ok(
  (flowHtml.match(/aria-selected="true"/g) ?? []).length === 1,
  "exactly one tab may be selected",
);
ok(
  (flowHtml.match(/hidden=""/g) ?? []).length === FLOW.steps.length - 1,
  "every step but the visible one must be hidden, so all five bodies stay in the HTML",
);
ok(
  flowHtml.includes('data-armed="false"'),
  "the static markup must not be armed: the clock starts only once the row is in view",
);
ok(flowHtml.includes('data-paused="true"'), "off-screen and unfocused must read as paused");
ok((flowHtml.match(/disabled=""/g) ?? []).length === 1, "only Back is disabled on step 01");

FLOW.steps.forEach((step, index) => {
  const chip = chipFor(FEATURES[step.feature].status);
  if (!flowHtml.includes(step.label)) ok(false, `Flow pill ${index + 1} must show "${step.label}"`);
  if (!flowHtml.includes(step.title)) ok(false, `Flow panel ${index + 1} must show its title`);
  if (!flowHtml.includes(step.body)) ok(false, `Flow panel ${index + 1} must show its body`);
  if (!flowHtml.includes(`aria-controls="flow-panel-${index}"`)) {
    ok(false, `tab ${index} must point at panel ${index}`);
  }
  if (!flowHtml.includes(`aria-labelledby="flow-tab-${index}"`)) {
    ok(false, `panel ${index} must be named by tab ${index}`);
  }
  if (!flowHtml.includes(`data-status="${chip.status}"`)) {
    ok(false, `Flow panel ${index + 1} (${step.feature}) must carry its status chip`);
  }
});

ok(flowHtml.includes(FLOW.back), "Flow must offer Back");
ok(flowHtml.includes(FLOW.next), "Flow must offer Next");

const counter = `${String(1).padStart(2, "0")} / ${String(FLOW.steps.length).padStart(2, "0")}`;
ok(flowHtml.includes(`>${counter}<`), `the step counter must read "${counter}" as one node`);
ok(/flow-fill/.test(flowHtml) === false, "the animation name is CSS's business, not the markup's");

/* -------------------------------- C. Safety (docs/02 §5) -------------------------------- */

ok(safetyHtml.includes('data-nav-theme="light"'), "Safety must declare the light navbar theme");
ok(safetyHtml.includes("bg-cream-200"), "Safety must be the cream-200 band");
ok(safetyHtml.includes("safety-pulse"), "the travelling pulse must be in the markup");
ok(
  safetyHtml.includes("<svg") && safetyHtml.includes("<line"),
  "the connector must be one SVG line",
);

SAFETY.nodes.forEach((node, index) => {
  if (!safetyHtml.includes(node.title)) ok(false, `Safety node ${index + 1} must show its title`);
  if (!safetyHtml.includes(node.sub)) ok(false, `Safety node ${index + 1} must show its sub`);
});
ok(
  (safetyHtml.match(/safety-node--on/g) ?? []).length === 1,
  "exactly one node may be the filled one",
);
ok(
  SAFETY.nodes.findIndex((node) => node.emphasis) === 2,
  "docs/02 §5: the third node (Booking engine) is the filled one",
);
ok(
  (safetyHtml.match(/hidden/g) ?? []).length >= 1,
  "the pulse strip must be lg-only rather than always laid out",
);

SAFETY.points.forEach((point) => {
  if (!safetyHtml.includes(point)) ok(false, `Safety must show the point "${point}"`);
});
ok(safetyHtml.includes(SAFETY.privacyHeading), "Safety must show the privacy heading");
ok(safetyHtml.includes(SAFETY.privacyNote), "Safety must show the privacy note");
ok(
  (safetyHtml.match(/data-status="tbc"/g) ?? []).length === PRIVACY.length,
  "every unset privacy item must carry the To-be-confirmed chip",
);
PRIVACY.forEach((item) => {
  if (!safetyHtml.includes(item.label)) ok(false, `Safety must list "${item.label}"`);
});

/* ------------------- D. one source for icons and chip labels (docs/09 D8) ------------------- */

const featureKeys = Object.keys(FEATURES);
ok(
  Object.keys(FEATURE_ICON).length === featureKeys.length,
  "every FeatureKey must have an icon (the Record is total)",
);
featureKeys.forEach((key) => {
  if (!(key in FEATURE_ICON)) ok(false, `no icon mapped for ${key}`);
});
ok(
  chipFor(null).status === TBC_STATUS && chipFor(null).label === TBC_LABEL,
  "chipFor(null) must be the To-be-confirmed chip",
);
ok(
  chipFor("live").label === STATUS_LABEL.live,
  "chipFor must pass a real status straight through",
);
ok(chipFor("planned").status === "planned", "chipFor must not touch a real status");

/* ------------------------ F. wall teaser (docs/02 "Home 6") ------------------------ */

ok(teaserHtml.includes('data-nav-theme="dark"'), "Wall teaser must declare the dark navbar theme");
ok(teaserHtml.includes("stage"), "Wall teaser must sit on a .stage");
ok(teaserHtml.includes("on-dark"), "Wall teaser must sit on .on-dark for sage-300 body text");
ok((teaserHtml.match(/orb orb--/g) ?? []).length === 3, "Wall teaser must have exactly three orbs");
ok(teaserHtml.includes(WALL_TEASER.h2), "Wall teaser must show WALL_TEASER.h2");
ok(teaserHtml.includes(WALL.sampleChip), "Wall teaser must show the sample-data chip");
ok(teaserHtml.includes('href="/live"'), "the wall teaser button must link to /live");
ok(teaserHtml.includes(WALL_TEASER.buttonLabel), "the button must use WALL_TEASER.buttonLabel");

const teaserCards = (teaserHtml.match(/wall-teaser-card/g) ?? []).length;
ok(teaserCards === 6, `the preview grid must hold six cards, found ${teaserCards}`);
const teaserGlass = (teaserHtml.match(/data-glass="true"/g) ?? []).length;
const teaserLite = (teaserHtml.match(/data-glass="false"/g) ?? []).length;
ok(teaserGlass === 2, `exactly two centre cards take real .glass, found ${teaserGlass}`);
ok(teaserLite === 4, `the other four take .glass--lite, found ${teaserLite}`);
ok(TEASER_CARDS.filter((card) => card.glass).length === 2, "TEASER_CARDS flags exactly two centre cards");

/* Split the grid off the readable chrome so the audit below can ignore the sample cards. */
const [teaserChrome, teaserAfterGrid] = teaserHtml.split(/<div[^>]*data-teaser-grid="true"/);
const teaserGrid = `<div${teaserAfterGrid ?? ""}`;
ok(teaserHtml.includes('aria-hidden="true" data-teaser-grid="true"'), "the preview grid must be aria-hidden");
ok(!/<button|<a\s/.test(teaserGrid), "the preview grid must not hold interactive elements");

TEASER_CARDS.forEach((card, index) => {
  ok(card.scale >= 0.5 && card.scale <= 1.3, `teaser card ${index} scale is outside the lens range`);
  ok(card.opacity > 0 && card.opacity <= 1, `teaser card ${index} opacity is out of range`);
});

/* Percentages make the cards a proportional scale of the board, so a non-overlap result at
   1440x900 means non-overlap at every width. */
const boxes = TEASER_CARDS.map((card) => {
  const cx = (card.leftPct / 100) * 1440;
  const cy = (card.topPct / 100) * 900;
  const hw = ((card.widthPct / 100) * 1440 * card.scale) / 2;
  const hh = ((card.heightPct / 100) * 900 * card.scale) / 2;
  return { l: cx - hw, r: cx + hw, t: cy - hh, b: cy + hh };
});
let overlaps = 0;
let minGap = Number.POSITIVE_INFINITY;
for (let i = 0; i < boxes.length; i += 1) {
  for (let j = i + 1; j < boxes.length; j += 1) {
    const a = boxes[i];
    const b = boxes[j];
    const gap = Math.max(Math.max(b.l - a.r, a.l - b.r), Math.max(b.t - a.b, a.t - b.b));
    if (gap < minGap) minGap = gap;
    if (gap <= 0) overlaps += 1;
  }
}
ok(overlaps === 0, `wall teaser cards must not overlap, found ${overlaps} overlapping pairs`);
console.log("wall teaser min gap (board px):", minGap.toFixed(1));

/* ------------------------- G. ROI calculator (docs/02 §7) ------------------------- */

ok(roiHtml.includes('data-nav-theme="light"'), "ROI must declare the light navbar theme");
ok(roiHtml.includes("bg-cream-100"), "ROI must be the cream-100 band");

const inputs = (roiHtml.match(/type="text"/g) ?? []).length;
ok(inputs === 4, `ROI must have four text inputs, found ${inputs}`);
/* React's server renderer emits this as `inputMode` (camelCase); HTML attribute names are
   case-insensitive, so the browser still gets the `inputmode` attribute. Match either. */
const decimals = (roiHtml.match(/inputmode="decimal"/gi) ?? []).length;
ok(decimals === 4, `all four inputs must be inputMode=decimal, found ${decimals}`);
const labels = (roiHtml.match(/<label/g) ?? []).length;
ok(labels === 4, `every input must have a real label, found ${labels}`);
Object.values(ROI.fields).forEach((label) => {
  ok(roiHtml.includes(label), `ROI must show the field label "${label}"`);
});
ok(roiHtml.includes(ROI.output.monthlyValue), "ROI must show the monthly-value caption");
ok(roiHtml.includes(ROI.output.breakEven), "ROI must show the break-even caption");
ok(roiHtml.includes(ROI.formulas.monthlyValue), "ROI must print the monthly-value formula");
ok(roiHtml.includes(ROI.formulas.breakEven), "ROI must print the break-even formula");
ok(roiHtml.includes(ROI.disclaimer), "ROI must show the example-numbers disclaimer");

/* The default state renders the deck's numbers, and shows no error or prompt yet. */
ok(roiHtml.includes(`>${formatRupees(39000)}<`), "defaults must render ₹39,000 as the monthly value");
ok(roiHtml.includes(`>${formatVisits(6)}<`), "defaults must render 6 as the break-even visits");
ok(!/Infinity|NaN/.test(roiHtml), "the ROI markup must never contain Infinity or NaN");
ok(!roiHtml.includes(ROI.invalid), "a valid default must not show the invalid-input message");
ok(!roiHtml.includes(ROI.zeroFeePrompt), "a non-zero default must not show the zero-fee prompt");
ok(ROI.invalid.length > 0, "ROI.invalid must exist for the error state");
ok(ROI.zeroFeePrompt.length > 0, "ROI.zeroFeePrompt must exist for the zero-fee state");

/* ----------------- G. beta CTA + form (docs/02 §8, docs/09 D16) ----------------- */

ok(betaHtml.includes('data-nav-theme="light"'), "Beta CTA must declare the light navbar theme");
ok(betaHtml.includes("bg-peach-400"), "Beta CTA must be the peach-400 band");
ok(betaHtml.includes('aria-labelledby="beta-title"'), "the section must be named by its H2");
ok(betaHtml.includes('id="beta-title"'), "the H2 must carry the beta-title id");
ok(betaHtml.includes(BETA.h2), "the Beta CTA must show BETA.h2");
ok(betaHtml.includes(BETA.body), "the Beta CTA must show BETA.body");
ok(betaHtml.includes(BETA.tagline), "the Beta CTA must show BETA.tagline");
ok(betaHtml.includes("<form"), "the Beta CTA must render the working form");
BETA.fields.forEach((label) => {
  if (!betaHtml.includes(label)) ok(false, `the form must label the "${label}" field`);
});

/* The rules that keep the form honest: a honeypot, a required consent, and — crucially — no
   success copy anywhere in the idle markup. Success is earned by a real 2xx (src/lib/beta.ts). */
ok(betaHtml.includes('name="company_website"'), "the honeypot field must be present");
ok(betaHtml.includes('aria-hidden="true"'), "the honeypot must be hidden from assistive tech");
ok(betaHtml.includes('tabindex="-1"'), "the honeypot must be out of the tab order");
ok(
  /type="checkbox"[^>]*required/.test(betaHtml),
  "the consent checkbox must be present and required",
);
ok(betaHtml.includes(BETA.consent), "the consent text must come from BETA.consent");
ok(betaHtml.includes(BETA.submit), "the submit button must show BETA.submit");
ok(!betaHtml.includes(BETA.success), "the idle form must NOT show the success copy");
ok(!betaHtml.includes(BETA.error), "the idle form must NOT show the error copy");
ok(!betaHtml.includes(BETA.fallbackNote), "the idle form must NOT show the WhatsApp fallback note");
ok(!betaHtml.includes(BETA.sending), "the idle form must not read as mid-send");

/* ----------------------------- E. no invented copy anywhere -----------------------------
   Every rendered text node must be a WHOLE string that already exists in copy.ts or
   status.ts. The only generated text allowed is the step counters ("01" and "01 / 05"),
   which is why the counter is one template literal rather than three children. */

const corpus = new Set<string>();
const collect = (value: unknown) => {
  if (typeof value === "string") corpus.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
collect(PROBLEM);
collect(FLOW);
collect(SAFETY);
collect(WALL_TEASER);
collect(WALL);
collect(ROI);
collect(BETA);
collect(content);

const COUNTER = /^\d{2}( \/ \d{2})?$/;
const MONEY = /^\u20B9[\d,]+$/;   // formatRupees output, e.g. "₹39,000"
const VISITS = /^\d+$/;           // formatVisits output, e.g. "6"
const RUPEE = /^\u20B9$/;         // the aria-hidden rupee prefix on the two money fields
const decode = (text: string) =>
  text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

const textNodes = (html: string) =>
  html
    .split(/<[^>]*>/)
    .map((node) => decode(node).trim())
    .filter((node) => node.length > 0);

let checked = 0;
let counters = 0;
let generated = 0;
const audit = (html: string, where: string) => {
  textNodes(html).forEach((node) => {
    checked += 1;
    if (COUNTER.test(node)) {
      counters += 1;
      return;
    }
    if (MONEY.test(node) || VISITS.test(node) || RUPEE.test(node)) {
      generated += 1;
      return;
    }
    if (!corpus.has(node)) ok(false, `${where}: invented text node "${node}"`);
  });
};

audit(problemHtml, "Problem");
audit(flowHtml, "Flow");
audit(safetyHtml, "Safety");
audit(teaserChrome, "Wall teaser");
audit(roiHtml, "ROI");
audit(betaHtml, "Beta CTA");
console.log(
  "text nodes checked:",
  checked,
  "| of which generated counters:",
  counters,
  "| generated numbers:",
  generated,
  "| corpus:",
  corpus.size,
  "strings",
);
ok(checked > 30, "the audit must actually be looking at something");
ok(counters === FLOW.steps.length + 1, "exactly the five pill numbers and the one counter");
ok(generated >= 3, "the ROI must render its own money/count values, not copy");

console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);
