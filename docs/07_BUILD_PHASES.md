# 07. Build phases (give DeepSeek ONE phase per request)

Smaller requests give better results from a coding model than one giant prompt. Each phase ends with a working, committed site. After each phase: `npx tsc --noEmit && npm run build`, then `git commit`.

Paste this at the top of every request:
> Read `PROJECT_RULES.md`. Do **Phase N** below and nothing else. Read only the docs it lists. Output complete files. Run the checks at the end and fix what fails.

---

## Phase 0. Project bootstrap
**Read:** `PROJECT_RULES.md`
1. `npm install` (the `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/styles/index.css`, `src/content/*`, `src/lib/wall/*`, `public/brand/*` already exist; do not overwrite them).
2. Create `src/main.tsx` (StrictMode, `BrowserRouter`, imports `./styles/index.css`) and a minimal `src/App.tsx` with routes `/ /product /live /black /join /privacy *`, each a placeholder page with one `<h1>`.
3. `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useDocumentMeta.ts`.
4. `public/robots.txt`.
**Done when:** `npm run dev` shows the placeholder pages; build passes.

## Phase 1. Global chrome and transitions
**Read:** `docs/05_TRANSITIONS_SPEC.md`, `docs/01_DESIGN_SYSTEM.md` (Glass, Wordmark)
Build the whole `src/features/transitions/*` set, the Navbar, the menu button, the full-screen menu, `TLink`, the footer, skip link and `#route-root` wrapper.
**Done when:** every acceptance check in doc 05 passes (test with placeholder pages).

## Phase 2. Logo dots + Home hero
**Read:** `docs/06_LOGO_DOTS_AND_PHONE_SPEC.md` (section A), `docs/02_SITE_MAP_AND_SECTIONS.md` (Home 1), `docs/01_DESIGN_SYSTEM.md`
Build `LogoParticles` and the hero, with the floating glass card.
**Done when:** the acceptance list in doc 06 section A passes.

## Phase 3. Phone chat demo + Try Aria section
**Read:** `docs/06_LOGO_DOTS_AND_PHONE_SPEC.md` (section B), `docs/02` (Home 4)
Build `PhoneDemo` and the stage section.
**Done when:** doc 06 section B acceptance passes.

## Phase 4. The glass wall
**Read:** `docs/04_GLASS_WALL_SPEC.md`, `docs/01_DESIGN_SYSTEM.md` (Glass), and the two files in `src/lib/wall/`
Build `/live` completely, plus `BookingDetail`.
**Done when:** doc 04 acceptance passes. Verify at 390x800 and 1440x900 and 1920x1080.

## Phase 5. Remaining Home sections
**Read:** `docs/02` (Home 2, 3, 5, 6, 7, 8), `docs/03_CONTENT_AND_CLAIMS.md`
Problem, Flow, Safety model, wall teaser, ROI calculator, beta CTA, and the working beta form.
**Progress:** 5a (Problem, Flow, Safety model) and 5b (wall teaser, ROI calculator) are built.
`scripts/sections.check.ts` checks the sections and `scripts/roi.check.ts` checks the ROI maths;
`npm run check` runs those plus the wall and detail checks. The beta CTA and the working form are
still to come. See docs/09 **D13** (the Flow section's clock), **D14** (the safety pulse and the
Problem icons) and **D15** (the ROI arithmetic and the static wall teaser).
**Done when:** the form never fakes success, the ROI maths is right (`3 × 26 × ₹500 = ₹39,000`; `₹3,000 ÷ ₹500 = 6 visits`), every status chip reads from `status.ts`.

## Phase 6. Product, Black, Join, Privacy, 404
**Read:** `docs/02` (the route sections), `docs/03`
**Done when:** all routes complete; `/product` pricing hidden while `SITE.showPricing` is false.

## Phase 7. Polish and QA
**Read:** everything once.
1. Run through `docs/08_QA_CHECKLIST.md` and fix failures.
2. Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
3. Keyboard-only pass through every route. Screen-reader spot check of the wall dialog and the chat log.
4. Test with `prefers-reduced-motion` on. Test in Safari (blur, `dvh`, pointer events).
5. `npm run build && npm run preview`, click every link.

---

## If DeepSeek gets stuck
- **Wall shows nothing**: check the range setState, that cards are `position:absolute; left:0; top:0`, and that the container has explicit height (`100dvh`).
- **Blur looks flat**: glass needs orbs behind it; check `.stage` and z-order, and that no ancestor has `overflow:hidden` with `transform`, `filter` or `opacity < 1` that flattens the backdrop.
- **Stairs flash the new page**: the swap must happen only after the cover tween's `onComplete`.
- **Double animations in dev**: StrictMode; return cleanup from every effect, and use `useGSAP` scope + `revertOnUpdate`.
- **Fixed elements jump after a transition**: an ancestor still has a `transform`; ensure `clearProps: "transform,opacity"`.
