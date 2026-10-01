/**
 * Phase 6 check: the Product, Black, Join, Privacy and 404 routes (docs/02), plus the
 * no-invented-copy rule for every one of them.
 *
 * Run it with:
 *   JITI_JSX=1 JITI_TSCONFIG_PATHS=1 npx jiti scripts/routes.check.ts
 *
 * The two env vars are the same as scripts/sections.check.ts (JSX transform on, tsconfig paths
 * honoured). React goes on globalThis first because jiti compiles JSX with the classic runtime.
 *
 * Each page is rendered on its own via renderToStaticMarkup, wrapped in a stub TransitionContext
 * because Black/Join/404 render a TLink, and TLink calls useTransition() before it decides how to
 * render the anchor. The pages that pull in Home sections (Product → Safety + ROI) render fine:
 * useGSAP and the document effects never run under static rendering.
 *
 * Everything is asserted against src/content/*, never against a literal typed here — a hard-coded
 * string in this file would defeat the point of (F).
 */

import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as unknown as { React: typeof React }).React = React;

const { ProductPage } = await import("../src/pages/ProductPage");
const { BlackPage } = await import("../src/pages/BlackPage");
const { JoinPage } = await import("../src/pages/JoinPage");
const { PrivacyPage } = await import("../src/pages/PrivacyPage");
const { NotFoundPage } = await import("../src/pages/NotFoundPage");
const { TransitionContext } = await import("../src/features/transitions/useTransition");
const copy = await import("../src/content/copy");
const content = await import("../src/content/status");
const { SITE } = await import("../src/content/config");

const {
  PRODUCT,
  MODULES,
  PRICING,
  BLACK,
  JOIN,
  PRIVACY_NOTICE,
  NOT_FOUND,
  BETA,
  DEMO,
  ROI,
  SAFETY,
  FOOTER,
} = copy;
const { FEATURES, STATUS_LABEL, chipFor } = content;

let fails = 0;
const ok = (condition: boolean, message: string) => {
  if (!condition) {
    fails += 1;
    console.log("FAIL:", message);
  }
};

/* TLink throws without a provider, so every page is rendered inside the same stub. */
const stub = {
  go: () => {},
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  isBusy: false,
  menuButtonRef: { current: null },
};

const render = (Page: React.ComponentType) =>
  renderToStaticMarkup(
    React.createElement(TransitionContext.Provider, { value: stub }, React.createElement(Page)),
  );

const productHtml = render(ProductPage);
const blackHtml = render(BlackPage);
const joinHtml = render(JoinPage);
const privacyHtml = render(PrivacyPage);
const notFoundHtml = render(NotFoundPage);

/**
 * Entity-decoded text for assertions about copy that contains ' or & — renderToStaticMarkup
 * escapes both, so a plain includes() on the raw HTML would miss the real string.
 */
const decodeEntities = (text: string) =>
  text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

const productText = decodeEntities(productHtml);
const privacyText = decodeEntities(privacyHtml);

/* -------------------------------- A. Product (docs/02 §product) -------------------------------- */

ok(productHtml.includes(PRODUCT.h1), "the /product header must be PRODUCT.h1");
ok(productHtml.includes(MODULES.h2), "the modules section must show MODULES.h2");
ok(productHtml.includes(MODULES.coreHeading), "the core column must show MODULES.coreHeading");
ok(
  productHtml.includes(MODULES.augmentedHeading),
  "the augmented column must show MODULES.augmentedHeading",
);

for (const spec of [...MODULES.core, ...MODULES.augmented, MODULES.inDev]) {
  ok(productText.includes(FEATURES[spec.feature].name), `module ${spec.feature} must show its name`);
  ok(productText.includes(spec.blurb), `module ${spec.feature} must show its blurb`);
}

/* The chips come from FEATURES, so a building/planned feature must read as such, not "Live". */
const inDevChip = chipFor(FEATURES[MODULES.inDev.feature].status);
ok(
  productHtml.includes(`data-status="${inDevChip.status}"`),
  "the dashboard row must carry its real status chip",
);
ok(
  productHtml.includes(inDevChip.label),
  "the dashboard chip must show the status label from status.ts",
);

/* Safety (Home 5) and ROI (Home 7) are the same components, not copies. */
ok(productHtml.includes(SAFETY.h2), "the Safety model must be imported from Home section 5");
ok(productHtml.includes(ROI.h2), "the ROI calculator must be imported from Home section 7");

/* Pricing is HIDDEN while SITE.showPricing is false (docs/02 §product 5, docs/09 D17). */
ok(SITE.showPricing === false, "SITE.showPricing must be false in this build");
ok(!productHtml.includes(PRICING.note), "no pricing note may render while SITE.showPricing is false");
ok(
  !productHtml.includes(PRICING.tiers[0].price),
  "no tier price may render while SITE.showPricing is false",
);
ok(
  !productHtml.includes(PRICING.targetLabel),
  "no target-tier chip may render while SITE.showPricing is false",
);

/* ------------------------------- B. Black (docs/02 §black) ------------------------------- */

ok(blackHtml.includes('data-nav-theme="dark"'), "/black must declare the dark navbar theme");
ok(blackHtml.includes("on-dark"), "/black must sit on .on-dark so body text is sage-300");
ok(blackHtml.includes("bg-teal-900"), "/black must be the teal-900 surface");
ok(
  blackHtml.includes('src="/brand/wing-motif.png"') && blackHtml.includes("opacity-[0.06]"),
  "the wing motif must be the 6% background",
);
ok(
  blackHtml.includes("text-gold-500") && blackHtml.includes("<circle"),
  "the badge ring must be a gold-500 SVG circle",
);
ok(blackHtml.includes(BLACK.badge.title), "the badge must read BLACK.badge.title");
ok(blackHtml.includes(BLACK.badge.verified), "the badge must read BLACK.badge.verified");
ok(
  blackHtml.includes(`data-status="${BLACK.status}"`) &&
    blackHtml.includes(STATUS_LABEL[BLACK.status]),
  "the badge must carry the real Planned chip",
);
ok(blackHtml.includes(BLACK.h2), "/black must show BLACK.h2");
ok(blackHtml.includes(BLACK.sub), "/black must show BLACK.sub");
ok(blackHtml.includes(BLACK.tagline), "/black must show BLACK.tagline");
ok(blackHtml.includes(BLACK.criteriaNote), "/black must show BLACK.criteriaNote");
ok(
  blackHtml.includes('href="/join"') && blackHtml.includes(BLACK.cta),
  "the only CTA must be BLACK.cta to /join",
);
/* Nothing about criteria, verifiers, cost or timing may be invented. */
ok(
  !/\b(price|cost|fee|verify|verifier|certified|audit)/i.test(blackHtml.replace(/<[^>]*>/g, " ")),
  "/black must invent no criteria, verifier, cost or timing",
);

/* -------------------------------- C. Join (docs/02 §join) -------------------------------- */

ok(joinHtml.includes(BETA.h2), "/join must show the beta H2 (BETA.h2)");
ok(joinHtml.includes("<form"), "/join must carry the working beta form");
ok(joinHtml.includes('name="company_website"'), "/join's form must keep the honeypot");
ok(
  joinHtml.includes('src="/brand/qr-aria-whatsapp.png"') && joinHtml.includes(DEMO.qrAlt),
  "the WhatsApp QR must be present with its accessible name",
);
ok(joinHtml.includes(JOIN.qrCaption), "the QR caption must be JOIN.qrCaption");
ok(joinHtml.includes(JOIN.teamHeading), "the team block must be headed JOIN.teamHeading");
ok(joinHtml.includes(SITE.founder), "the team block must name SITE.founder");
ok(joinHtml.includes(JOIN.roles.founder), "the team block must show the founder's role");
ok(joinHtml.includes(SITE.spokesperson), "the team block must name SITE.spokesperson");
ok(joinHtml.includes(JOIN.roles.spokesperson), "the team block must show the spokesperson's role");

/* ------------------------------ D. Privacy (docs/02 §privacy) ------------------------------ */

ok(privacyHtml.includes(PRIVACY_NOTICE.h1), "/privacy must show its heading");
ok(privacyHtml.includes(PRIVACY_NOTICE.intro), "/privacy must show its intro");
for (const item of PRIVACY_NOTICE.items) {
  ok(privacyText.includes(item.label), `/privacy must show the "${item.label}" heading`);
  ok(privacyText.includes(item.body), `/privacy must show the "${item.label}" body`);
}
ok(
  privacyHtml.includes(PRIVACY_NOTICE.contact.label) &&
    privacyHtml.includes(PRIVACY_NOTICE.contact.body),
  "/privacy must show the contact block",
);
/* SITE.contactEmail is empty, so the placeholder must be shown instead of an address. */
ok(SITE.contactEmail === "", "SITE.contactEmail is expected to be empty in this build");
ok(
  privacyHtml.includes(PRIVACY_NOTICE.contactFallback),
  "/privacy must show the contact placeholder while SITE.contactEmail is empty",
);
ok(privacyHtml.includes(PRIVACY_NOTICE.reviewNote), "/privacy must state that it needs review");
{
  const source = readFileSync("src/pages/PrivacyPage.tsx", "utf8");
  ok(
    source.includes("Needs legal review (DPDP Act) before launch"),
    "/privacy source must carry the DPDP legal-review comment (docs/02 §privacy)",
  );
}

/* ------------------------------- E. 404 (docs/02 §Routes) ------------------------------- */

ok(notFoundHtml.includes(NOT_FOUND.h1), "the 404 must show NOT_FOUND.h1");
ok(notFoundHtml.includes(NOT_FOUND.body), "the 404 must show NOT_FOUND.body");
ok(
  notFoundHtml.includes('href="/"') && notFoundHtml.includes(NOT_FOUND.home),
  "the 404 must offer NOT_FOUND.home as a link to /",
);

/* ----------------------------- F. no invented copy anywhere ----------------------------- */

const corpus = new Set<string>();
const collect = (value: unknown) => {
  if (typeof value === "string") corpus.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
collect(PRODUCT);
collect(MODULES);
collect(PRICING);
collect(BLACK);
collect(JOIN);
collect(PRIVACY_NOTICE);
collect(NOT_FOUND);
collect(BETA);
collect(DEMO);
collect(ROI);
collect(SAFETY);
collect(FOOTER);
collect(content);
collect(SITE);

const COUNTER = /^\d{2}( \/ \d{2})?$/;
const MONEY = /^\u20B9[\d,]+$/; // formatRupees output, e.g. "₹39,000"
const VISITS = /^\d+$/; // formatVisits output, e.g. "6"
const RUPEE = /^\u20B9$/; // the aria-hidden rupee prefix on the two money fields

const textNodes = (html: string) =>
  html
    .split(/<[^>]*>/)
    .map((node) => decodeEntities(node).trim())
    .filter((node) => node.length > 0);

let checked = 0;
let generated = 0;
const audit = (html: string, where: string) => {
  textNodes(html).forEach((node) => {
    checked += 1;
    if (COUNTER.test(node)) return;
    if (MONEY.test(node) || VISITS.test(node) || RUPEE.test(node)) {
      generated += 1;
      return;
    }
    if (!corpus.has(node)) ok(false, `${where}: invented text node "${node}"`);
  });
};

audit(productHtml, "Product");
audit(blackHtml, "Black");
audit(joinHtml, "Join");
audit(privacyHtml, "Privacy");
audit(notFoundHtml, "404");
console.log(
  "text nodes checked:",
  checked,
  "| generated numbers:",
  generated,
  "| corpus:",
  corpus.size,
  "strings",
);
ok(checked > 30, "the audit must actually be looking at something");

console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);
