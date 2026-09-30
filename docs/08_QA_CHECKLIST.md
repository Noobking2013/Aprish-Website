# 08. QA checklist (Phase 7)

## Truth and brand
- [ ] No text on the site mentions UPI, payments, Google reviews, "zero no-shows", "#1", "500M", or invented statistics.
- [ ] Every "Live / In development / Planned" chip comes from `status.ts` (search the code for hard-coded "Live").
- [ ] Every fictional booking, name, chat and hero card is labelled "Sample" or "Interactive demo".
- [ ] No K72 assets remain (search for `k72`, `Lausanne`, `#D3FD50`, "Projets", "Agence").
- [ ] Logo renders from the transparent PNGs; the black-square theme logo is not used anywhere.
- [ ] Colours match the tokens; small text on cream is `teal-600` or `coral-700`, never `peach-400`.
- [ ] Nothing in the design-system "avoid" list appears (all-caps mono eyebrow on every heading, fade-up on every section, arrows on every button).

## Function
- [ ] Beta form: invalid input shows errors; with an endpoint, success only on 2xx; without one, it opens WhatsApp prefilled; honeypot present; consent required.
- [ ] "Chat with Aria" opens `https://wa.me/<number>?text=…` in a new tab with `rel="noopener"`.
- [ ] The QR image scans and opens the same chat (the number is a Hong Kong +852 number; founder must confirm it is intended).
- [ ] ROI calculator: defaults give ₹39,000 monthly value and 6 visits break-even; empty or zero fee does not show `Infinity` or `NaN`.
- [ ] Direct URL load of `/live`, `/black`, `/join` works after `npm run build && npm run preview` (SPA fallback configured on the host).

## Motion and interaction
- [ ] Transition acceptance (doc 05), wall acceptance (doc 04), dots and phone acceptance (doc 06).
- [ ] Reduced motion: no stairs, no drift, no dot shimmer, no autoplay chat; content still fully usable.
- [ ] Tab order is logical; every interactive element has a visible focus ring; menu and wall dialog trap focus and restore it.
- [ ] Hidden tab: rAF loops pause.

## Performance
- [ ] Lighthouse mobile: Perf ≥ 85, A11y ≥ 95, BP ≥ 95, SEO ≥ 95.
- [ ] No layout shift when fonts load (`font-display: swap` is in the Google URL; reserve heading heights).
- [ ] `/live` chunk is separate; Home JS (gz) under about 180KB excluding GSAP chunk.
- [ ] Wall: 60fps at 1440x900; `backdrop-filter` elements under 25; no memory growth after 2 minutes of dragging.
- [ ] Images have width/height or aspect-ratio; PNGs under 100KB each.

## Responsive
Test at 360, 390, 768, 1024, 1280, 1440, 1920, 2560 wide, landscape phone, and 200% browser zoom.
- [ ] No horizontal scroll on any route.
- [ ] Menu links do not overflow at 360px.
- [ ] Phone demo fits at 360px (scales down) and chips wrap.
- [ ] Wall cards remain tappable on mobile.

## Legal and ops (founder, before launch)
- [ ] Legal review of Aprish Black wording and medical-advertising compliance.
- [ ] `/privacy` reviewed against the DPDP Act; real contact email set.
- [ ] Real domain in `SITE.url`, sitemap and Open Graph tags; `og-base.png` extended with a headline.
- [ ] Form endpoint chosen and tested; where submissions are stored and who can read them is decided.
- [ ] Confirm the WhatsApp number, the beta slot count, pricing tiers, and each `confirmed: false` feature in `status.ts`.
