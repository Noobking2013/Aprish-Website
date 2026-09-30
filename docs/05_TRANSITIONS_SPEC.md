# 05. Page transitions ("stairs") and the full-screen menu

Source: `reference/transitions/` (the K72-style project). We keep **only the mechanics**: five vertical bars that grow to cover the screen, then step away, with the incoming page scaling in. We re-skin them in Aprish colours and fix the one structural flaw in the original.

## What the original does, and what we change
| Original (K72) | Aprish |
|---|---|
| 5 black bars, `height: 0 → 100%` (grow), then `y: 0 → 100%` (slide down), reverse stagger | Same motion. Bars alternate `teal-950` / `teal-900` with a 1px light rim (`.stair` in CSS) |
| Route changes **at the start**, so the new page flashes before the bars cover it | **Cover first, swap while covered, then reveal.** No flash |
| Page scales in from 1.2 | Scales from **1.06**, opacity 0 → 1 (1.2 is harsh) |
| Lime `#D3FD50` accent | `peach-400` |
| K72 SVG logo, Lausanne font, hotlinked K72 images | Aprish logo PNG, Instrument Serif, no images |
| Menu links open with `rotateX` flip, hover band with marquee | Keep both (see menu) |

## Components and files
```
src/features/transitions/TransitionProvider.tsx   context + overlay + timelines + go()
src/features/transitions/TLink.tsx                <a> that triggers go(); preloads on hover/focus
src/features/transitions/routes.ts                route names + lazy preloaders
src/features/transitions/FullScreenMenu.tsx       menu overlay
src/features/transitions/MenuButton.tsx           the corner button
src/hooks/usePrefersReducedMotion.ts
```
Use `TLink` for **every** internal link and CTA. Hash links (`#section`), `mailto:`, `wa.me` and external URLs are left alone.

## Context API
```ts
interface TransitionApi {
  go(to: string, opts?: { fromMenu?: boolean }): void;
  menuOpen: boolean; openMenu(): void; closeMenu(): void;
  isBusy: boolean;
}
```

## DOM
Rendered once by the provider, above the router outlet:
```html
<div class="stairs" data-active="false" aria-hidden="true">   <!-- z-90 -->
  <div class="stair"></div> x5                                <!-- flex 1 1 20% -->
  <div class="stairs-label">  <!-- centred; gold 4-point star SVG + route name (Instrument Serif italic, cream, clamp(2.5rem,7vw,6rem)) -->
</div>
```
Bars use `height` (not scaleY) to match the original feel: they grow from the top edge downward.

## Route transition timeline (`go(to)`)
1. Guard: if busy or `to === location.pathname`, return. Set busy, lock scroll (`html {overflow:hidden}`), set overlay `data-active="true"`.
2. In parallel: start the **cover** timeline AND `await routes.preload(to)` (dynamic `import()` for lazy routes). Wait for both with `Promise.all`, so a lazy chunk is never still loading when the bars leave.
3. Cover: `bars: fromTo({height:0,y:0},{height:"100%", duration:0.55, ease:"power3.inOut", stagger:{amount:0.25, from:"end"}})`. Label fades in at `-=0.15` (`opacity 0→1, y 12→0`, 0.25s).
4. At full cover: `navigate(to)`, `window.scrollTo(0,0)`, update `document.title`. Wait one frame (`requestAnimationFrame` twice) so React has committed.
5. Hold 0.12s, label out (0.2s), then **reveal**: `bars: to({y:"100%", duration:0.6, ease:"power3.inOut", stagger:{amount:0.25, from:"end"}})`.
6. Page enter (starts 0.15s into the reveal): `gsap.fromTo("#route-root", {scale:1.06, opacity:0, transformOrigin:"50% 30%"}, {scale:1, opacity:1, duration:0.9, ease:"power3.out", clearProps:"transform,opacity"})`.
7. Cleanup: overlay `data-active="false"`, reset bars (`height:0,y:0`), unlock scroll, busy=false, move focus to the new page's `<h1 id="route-title" tabindex="-1">`, and update an `aria-live="polite"` region with the new page title.

Total about 1.3 seconds. Keep durations in constants at the top of the file.

**Transform gotcha:** while `#route-root` has a `transform`, any `position: fixed` descendant is positioned relative to it. That is why `clearProps` runs at the end, and why full-viewport pages (`/live`, `/black`) must use `position: relative; height: 100dvh` with `absolute` children, not `fixed`. The navbar and the transition overlay live **outside** `#route-root`.

## Other entry cases
- **First load**: no cover. Show bars fully covering with the gold star rotating; when `document.fonts.ready` resolves (max 1.2s) run the reveal. This is the site's loader.
- **Browser back/forward** (`useNavigationType() === "POP"`): reveal-only version (bars start covering, then step away). Cannot intercept, so do not try.
- **Same-route link**: ignore.
- **Reduced motion**: replace everything with a 160ms `teal-950` fade in, swap, 160ms fade out. No bars, no scale. Also for `window.matchMedia("(prefers-reduced-motion: reduce)")` changing at runtime.
- **Interrupted animation**: `busy` prevents stacking. Kill running timelines in `useGSAP` cleanup.
- **Prefetch**: `TLink` calls `routes.preload(to)` on `pointerenter` and `focus`.

## Full-screen menu
Open (from `openMenu()`), mirrors the original timeline:
1. Menu container `display:block`, `role="dialog" aria-modal="true" aria-label="Menu"`, `#route-root` gets `inert`.
2. Five bars (`.stair`, z-80) `height 0 → 100%`, `delay 0.2`, `stagger {amount:-0.3}`.
3. Links (`.menu-link`, `transform-origin: top`) `opacity 0→1, rotateX 90→0`, `stagger {amount:0.3}`. Header (logo + close) fades in.
4. Focus moves to the first link. `Escape` closes. Tab is trapped.

Close: links `rotateX 90, opacity 0` (stagger 0.1), bars `height → 0` (stagger 0.1), header fades, `display:none`, `inert` removed, focus returns to the menu button.

**Choosing a link while open** (`go(to,{fromMenu:true})`): do NOT run the cover phase. The menu bars already cover the screen. Call `navigate(to)` immediately, then run the close timeline (that is the reveal), plus the page-enter tween.

### Links (Instrument Serif, cream, `clamp(3rem, 8vw, 8rem)`, top border 1px cream 15%)
Home, Product, Live wall, Aprish Black, Join the beta. Current route gets `aria-current="page"` and a peach dot.

### Hover band (desktop only, `@media (hover:hover)`)
Each row has an absolutely positioned peach-400 band, `opacity 0 → 1` on hover, containing a marquee (the original `.moveX` `translateX(0 → -100%)`, 10s linear infinite, two duplicated tracks). Content is text + small light-glass chips instead of K72's photos:
| Link | Marquee text | Chips |
|---|---|---|
| Home | "Back to the start" | `Aria · online` |
| Product | "Modules, safety, ROI" | `Live` `In development` `Planned` (real chip styles) |
| Live wall | "Watch bookings land" | `Token #14 ✓` `Dr. Rao 3:30 PM` (Space Mono) |
| Aprish Black | "A trust-mark, coming" | `Planned` |
| Join the beta | "Claim a pilot spot" | `WhatsApp` |
Band text is `teal-950` on peach (5.6:1). Separator between repeats is the gold 4-point star.

### Menu button (corner, top-right, flush to the corner)
`glass` panel, 56px tall x 168px wide desktop (44x120 mobile), bottom-left corner radius 28px. Two right-aligned 2px lines (60% and 36% width). On hover a `peach-400` fill grows from the top (`height 0 → 100%`, 300ms) and the lines go `teal-950`. `aria-expanded`, `aria-controls`. Line colour follows `data-nav-theme` of the section underneath.

## Navbar theme rule
`data-nav-theme="dark|light"` goes on **sections** (or, on single-section pages such as `/live` and `/black`, on the page's one inner wrapper), **never on `<main>` or `#route-root`**. The observer picks the first intersecting element in document order, so a wrapper that always intersects the top of the page pins the navbar to one theme for the whole page.

## Acceptance checks
- [ ] Clicking any internal link: bars cover, page swaps unseen, bars step away, new page scales in. No flash of the new page during the cover.
- [ ] Lazy routes (`/live`, `/black`) never show a Suspense fallback during the reveal.
- [ ] Back and forward buttons work and land at the top with a reveal.
- [ ] Menu open/close matches the original feel; choosing a link does not play a second cover.
- [ ] Focus lands on the new page's `<h1>`; screen reader announces the page title.
- [ ] Reduced motion: only a short fade.
- [ ] Fast double-clicking a link never stacks animations.
- [ ] Bars and menu use only Aprish colours; nothing from K72 remains.
