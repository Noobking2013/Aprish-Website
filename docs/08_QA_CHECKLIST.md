# 08. QA checklist (Phase 7)

Phase 7 status. The decidable items are now enforced by `scripts/qa.check.ts` (part of
`npm run check`): forbidden terms, hard-coded status labels, PNG sizes, the `index.html`
head/SEO tags and the per-route heading structure. Lighthouse was run against `npm run preview`
for every route, and the 360-2560 responsive sweep was run headless. Items that need a human
browser, a screen reader, a real device or the founder are marked **(manual)**.

Lighthouse mobile (Perf / A11y / BP / SEO), target ≥ 85 / ≥ 95 / ≥ 95 / ≥ 95:

| route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| `/` | 94 | 100 | 100 | 100 |
| `/product` | 97 | 100 | 100 | 100 |
| `/live` | 97 | 100 | 100 | 100 |
| `/black` | 91 | 100 | 100 | 100 |
| `/join` | 97 | 100 | 100 | 100 |
| `/privacy` | 97 | 100 | 100 | 100 |

## Truth and brand
- [x] No text on the site mentions UPI, payments, Google reviews, "zero no-shows", "#1", "500M", or invented statistics. (`scripts/qa.check.ts` + the no-invented-copy audit in `sections.check.ts` / `routes.check.ts`.)
- [x] Every "Live / In development / Planned" chip comes from `status.ts` (`qa.check.ts` scans every source file for a hard-coded label outside `status.ts`).
- [x] Every fictional booking, name, chat and hero card is labelled "Sample" or "Interactive demo" (`HERO.floatingCard` "Sample message", the `WALL` chip/card suffix, `CHAT_DEMO.note`, and every card's visually-hidden "Sample data.").
- [x] No K72 assets remain (`qa.check.ts` scans the terms and the shipped file names).
- [x] Logo renders from the transparent PNGs (`Wordmark` SVG + `logo-on-light.png`); the black-square theme logo is not used.
- [x] Colours match the tokens; the only `peach-400` text sits on the dark teal Problem band, and Lighthouse `color-contrast` is clean on every route.
- [x] Nothing in the design-system "avoid" list appears (no all-caps mono eyebrow on every heading, no fade-up on every section, no arrows on every button).

## Function
- [x] Beta form: errors on invalid input, success only on 2xx, WhatsApp fallback with no endpoint, honeypot, consent required (`scripts/beta.check.ts`).
- [x] "Chat with Aria" opens `https://wa.me/<number>?text=…` in a new tab with `rel="noopener"`.
- [ ] **(manual/founder)** The QR image scans and opens the same chat (the number is a Hong Kong +852 number; founder must confirm it is intended).
- [x] ROI calculator: defaults give ₹39,000 monthly value and 6 visits break-even; empty/zero fee never shows `Infinity`/`NaN` (`scripts/roi.check.ts`).
- [x] Direct URL load of `/live`, `/black`, `/join` returns the app shell after `npm run build && npm run preview` (verified with `curl`; SPA fallback configured on the host).

## Motion and interaction
- [x] No `data-nav-theme` on any `<main>` (it sits on the inner section/wrapper; docs/09 D6).
- [x] Every time shown in the chat demo agrees with every other (status bar, bubble timestamps, "today 4:15 PM").
- [x] Transition acceptance (doc 05), wall acceptance (doc 04), dots and phone acceptance (doc 06) — all covered by `npm run check`.
- [x] Reduced motion: the CSS `prefers-reduced-motion` block stops the stairs, drift, dot shimmer and autoplay, and every JS driver reads the same query.
- [x] Menu and wall dialog trap focus and restore it (`FullScreenMenu`, `BookingDetail`; the dialog markup is asserted in `detail.check.ts`). **(manual)** a keyboard-only pass still to be run by a human.
- [x] Hidden tab: the rAF loops pause (`visibilitychange` in `GlassWall` and `LogoParticles`).

## Performance
- [x] Lighthouse mobile meets the targets — see the table above.
- [x] No layout shift when fonts load (`font-display: swap` is asserted by `qa.check.ts`; headings reserve their space).
- [x] `/live` chunk is separate (`LivePage-*.js`, ~9 KB gz); Home JS is the `index` chunk (~95 KB gz) plus `router` (~17 KB gz), well under 180 KB excluding the GSAP chunk.
- [ ] **(manual)** Wall: 60fps at 1440x900; `backdrop-filter` elements under 25; no memory growth after 2 minutes of dragging — needs a real browser session.
- [x] Images have width/height or aspect-ratio; every PNG under `public/` is under 100KB (`qa.check.ts`).

## Responsive
Test at 360, 390, 768, 1024, 1280, 1440, 1920, 2560 wide, landscape phone, and 200% browser zoom.
- [x] No horizontal scroll on any route at 360-2560 (headless CDP sweep: `scrollWidth === innerWidth` on all six routes at all eight widths).
- [x] Menu links do not overflow at 360px (covered by the sweep).
- [x] Phone demo fits at 360px and chips wrap (covered by the sweep).
- [ ] **(manual)** Wall cards remain tappable on mobile — needs a touch device / emulation pass.

## Legal and ops (founder, before launch)
- [ ] Legal review of Aprish Black wording and medical-advertising compliance.
- [ ] `/privacy` reviewed against the DPDP Act; real contact email set.
- [ ] Real domain in `SITE.url`, sitemap and Open Graph tags; `og-base.png` extended with a headline. (The per-route `rel=canonical` and `og:url` are already emitted at runtime from the live origin by `useDocumentMeta`; only the absolute URLs + sitemap wait on the domain.)
- [ ] Form endpoint chosen and tested; where submissions are stored and who can read them is decided.
- [ ] Confirm the WhatsApp number, the beta slot count, pricing tiers, and each `confirmed: false` feature in `status.ts`.
