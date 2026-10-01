/**
 * Phase 7 check: the static half of docs/08_QA_CHECKLIST.md, so it stays enforced.
 *
 * Run it with:
 *   JITI_JSX=1 JITI_TSCONFIG_PATHS=1 npx jiti scripts/qa.check.ts
 *
 * The two env vars are the same as scripts/sections.check.ts and scripts/routes.check.ts:
 * the pages are JSX that import through "@/", so jiti needs its JSX transform on and the
 * tsconfig paths honoured, and React must be on globalThis because jiti compiles with the
 * classic runtime.
 *
 * It covers the parts of the checklist that are decidable from the repository:
 *   A. forbidden terms (scripts/ is not scanned, so this file's own list is safe);
 *   B. no hard-coded status labels outside src/content/status.ts;
 *   C. every public PNG is under 100KB;
 *   D. index.html carries the head/SEO tags the checklist and Lighthouse need;
 *   E. every route renders exactly one <h1> and never skips a heading level.
 *
 * The interactive and visual items (Lighthouse numbers, keyboard-only, screen reader,
 * Safari, responsive widths) cannot be decided here; they are run by hand and recorded in
 * docs/08 itself.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

(globalThis as unknown as { React: typeof React }).React = React;

const { HomePage } = await import("../src/pages/HomePage");
const { ProductPage } = await import("../src/pages/ProductPage");
const { LivePage } = await import("../src/pages/LivePage");
const { BlackPage } = await import("../src/pages/BlackPage");
const { JoinPage } = await import("../src/pages/JoinPage");
const { PrivacyPage } = await import("../src/pages/PrivacyPage");
const { NotFoundPage } = await import("../src/pages/NotFoundPage");
const { TransitionContext } = await import("../src/features/transitions/useTransition");

let fails = 0;
const ok = (condition: boolean, message: string) => {
  if (!condition) {
    fails += 1;
    console.log("FAIL:", message);
  }
};

/* --------------------------------- helpers --------------------------------- */

/** Every file under `dir` (recursive) whose name matches `test`. */
const walk = (dir: string, test: RegExp, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, test, out);
    else if (test.test(entry.name)) out.push(path);
  }
  return out;
};

/**
 * Strip comments so a scan never flags a word that only appears in prose. "//" is kept when
 * it is part of "://", so a URL does not swallow the rest of its line.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/gm, "$1");

const srcFiles = walk("src", /\.(ts|tsx)$/);

/* ------------------------- A. forbidden terms (docs/08) ------------------------- */

const FORBIDDEN: Array<[RegExp, string]> = [
  [/\bUPI\b/i, "UPI"],
  [/\bpayments?\b/i, "payments"],
  [/Google reviews/i, "Google reviews"],
  [/zero[\s-]?no[\s-]?shows?\b/i, '"zero no-shows"'],
  [/#1\b/, '"#1"'],
  [/\b500M\b/, '"500M"'],
  [/\bk72\b/i, "k72"],
  [/Lausanne/i, "Lausanne"],
  [/#D3FD50/i, "#D3FD50"],
  [/\bProjets\b/i, "Projets"],
  [/\bAgence\b/i, "Agence"],
];

const scanTargets: Array<readonly [string, string]> = [
  ["index.html", readFileSync("index.html", "utf8")],
  ...srcFiles.map((path) => [path, readFileSync(path, "utf8")] as const),
];
for (const [path, source] of scanTargets) {
  for (const [pattern, label] of FORBIDDEN) {
    ok(!pattern.test(source), `${path} must not mention ${label}`);
  }
}
console.log("forbidden-term scan:", scanTargets.length, "files");

/* ------------------- B. no hard-coded status labels outside status.ts ------------------- */

const STATUS_LITERAL = /(["'`])(Live|Planned|In development|To be confirmed)\1/g;
for (const path of srcFiles) {
  if (path.endsWith("content/status.ts")) continue;
  const source = stripComments(readFileSync(path, "utf8"));
  const hit = source.match(STATUS_LITERAL);
  ok(!hit, `${path} must read status labels from status.ts, not hard-code ${hit?.[0] ?? ""}`);
}

/* ----------------------- C. every public PNG is under 100KB ----------------------- */

const LIMIT = 100 * 1024;
const pngs = walk("public", /\.png$/i);
ok(pngs.length > 0, "there must be at least one PNG under public/");
for (const path of pngs) {
  const bytes = statSync(path).size;
  ok(bytes <= LIMIT, `${path} is ${bytes} bytes; every PNG must be under 100KB`);
  console.log(`${bytes.toString().padStart(7)}  ${path}`);
}
for (const required of [
  "wing-motif.png",
  "qr-aria-whatsapp.png",
  "og-base.png",
  "logo-on-dark.png",
  "logo-on-light.png",
]) {
  ok(pngs.some((path) => path.endsWith(required)), `public/brand/${required} must exist`);
}
/* The retired K72 logo must not be shipped under any name. */
ok(!pngs.some((path) => /k72|black-square/i.test(path)), "no retired K72 logo asset may ship");

/* --------------------------- D. index.html head audit --------------------------- */

const head = readFileSync("index.html", "utf8");
const needHead: Array<[RegExp, string]> = [
  [/<html[^>]*\blang=["'][^"']+["']/i, "a non-empty <html lang>"],
  [/<title>[^<]+<\/title>/i, "a non-empty <title>"],
  [/<meta\s+name=["']description["']\s+content=["'][^"']{40,}["']/i, "a meta description of 40+ characters"],
  [/<meta\s+name=["']viewport["'][^>]*width=device-width/i, "a responsive viewport"],
  [/<meta\s+name=["']theme-color["']/i, "a theme-color"],
  [/rel=["']icon["']/i, "a favicon"],
  [/rel=["']apple-touch-icon["']/i, "an apple-touch-icon"],
  [/<meta\s+property=["']og:type["']/i, "og:type"],
  [/<meta\s+property=["']og:title["']/i, "og:title"],
  [/<meta\s+property=["']og:description["']/i, "og:description"],
  [/<meta\s+property=["']og:image["']/i, "og:image"],
  [/<meta\s+property=["']og:url["']/i, "og:url"],
  [/<meta\s+property=["']og:site_name["']/i, "og:site_name"],
  [/<meta\s+property=["']og:locale["']/i, "og:locale"],
  [/<meta\s+name=["']twitter:card["']/i, "twitter:card"],
  [/rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com/i, "a preconnect to fonts.googleapis.com"],
  [/rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com/i, "a preconnect to fonts.gstatic.com"],
];
for (const [pattern, label] of needHead) ok(pattern.test(head), `index.html must carry ${label}`);
ok(head.includes("display=swap"), "the Google Fonts URL must request display=swap (docs/08 performance)");

/*
 * The canonical and og:url are per-route and written at runtime by useDocumentMeta (a
 * root-relative href in index.html would make Vite bundle the site root as an asset, and
 * an absolute SITE.url is still the placeholder). Asserted at the source, like the
 * DPDP-comment check in scripts/routes.check.ts.
 */
const metaHook = readFileSync("src/hooks/useDocumentMeta.ts", "utf8");
ok(
  metaHook.includes('setLink("canonical"') && metaHook.includes('setMeta("property", "og:url"'),
  "useDocumentMeta must write the per-route canonical and og:url",
);

/* ------------------------ E. heading structure per route ------------------------ */

const stub = {
  go: () => {},
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  isBusy: false,
  menuButtonRef: { current: null },
};

const withStub = (Page: React.ComponentType) =>
  React.createElement(TransitionContext.Provider, { value: stub }, React.createElement(Page));

/** /live also calls useLocation, so it needs a router around the stub. */
const withRouter = (path: string, Page: React.ComponentType) =>
  React.createElement(MemoryRouter, { initialEntries: [path] }, withStub(Page));

const headingsOf = (html: string) => [...html.matchAll(/<h([1-6])/g)].map((match) => Number(match[1]));

const routes: Array<[string, string, () => string]> = [
  ["/", "Home", () => renderToStaticMarkup(withStub(HomePage))],
  ["/product", "Product", () => renderToStaticMarkup(withStub(ProductPage))],
  ["/live", "Live", () => renderToStaticMarkup(withRouter("/live", LivePage))],
  ["/black", "Black", () => renderToStaticMarkup(withRouter("/black", BlackPage))],
  ["/join", "Join", () => renderToStaticMarkup(withStub(JoinPage))],
  ["/privacy", "Privacy", () => renderToStaticMarkup(withStub(PrivacyPage))],
  ["*", "404", () => renderToStaticMarkup(withStub(NotFoundPage))],
];

for (const [path, name, render] of routes) {
  const levels = headingsOf(render());
  ok(levels.length > 0, `${name} (${path}) must render at least one heading`);
  ok(levels.filter((level) => level === 1).length === 1, `${name} (${path}) must have exactly one <h1>`);
  ok(levels[0] === 1, `${name} (${path}) must open with its <h1>, found h${levels[0]}`);
  for (let i = 1; i < levels.length; i += 1) {
    ok(
      levels[i] <= levels[i - 1] + 1,
      `${name} (${path}) skips from h${levels[i - 1]} to h${levels[i]} (heading ${i + 1})`,
    );
  }
  console.log(`${name.padEnd(8)} (${path})  headings: ${levels.join(", ")}`);
}

console.log(fails ? `${fails} FAILURES` : "ALL PASS");
process.exit(fails ? 1 : 0);
