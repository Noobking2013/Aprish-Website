# 04. The infinite glass wall (`/live`)

**What it is:** an endless, draggable field of Apple-glass cards, each one a **confirmed booking** (fictional names). The card in the middle of the screen is zoomed up; cards shrink and fade toward the corners. It is inspired by the original "Infinite scroll" project (`reference/infinite-scroll/`), rebuilt in TypeScript with glass cards instead of photos.

**Already written and tested for you:**
- `src/lib/wall/wallData.ts`: `bookingAt(col,row)` returns a deterministic fictional booking for any cell, so the wall is infinite with no backend.
- `src/lib/wall/wallMath.ts`: `metricsFor`, `cellCenter`, `visibleRange`, `lens`, `damp`. Tested at 390x800 through 2560x1440: no card overlap (minimum gap 5px), and no card can appear on screen that is outside the returned cell range.
Do not rewrite these. Build the component on top of them.

## Files to create
```
src/pages/LivePage.tsx            page shell: stage, orbs, HUD, mounts <GlassWall/>
src/features/wall/GlassWall.tsx   camera, input, render loop, virtualisation
src/features/wall/BookingCard.tsx memoised card markup
src/features/wall/BookingDetail.tsx expanded sheet (focus-trapped dialog)
src/features/wall/useCamera.ts    drag, wheel, keys, inertia
```

## Card design (`BookingCard`)
Size 248x156 at unit 1 (the lens and metrics handle scaling). Rounded 26px. Content:
```
┌───────────────────────────────┐
│ (AS)  Aarav S.        ✓ Confirmed│   avatar = initials in a circle with a tint ring
│                               │
│ Dr. Mehta · Dermatology       │   DM Sans 500
│ Today, 4:15 PM     Token #14  │   times and token in Space Mono
│ via WhatsApp        APR-4F2A  │   small, sage-300
└───────────────────────────────┘
```
- Root element `<button>` (so it is focusable and keyboard-operable). Its accessible name is its own visible text followed by a visually-hidden "Sample data." — there is no `aria-label`, so WCAG 2.5.3 (Label in Name) holds and no card is ever read without the sample-data suffix (docs/09 D18).
- The check mark is a small `peach-400` circle with a `teal-950` tick, not an emoji.
- Avatar ring colour comes from `booking.tint` (0 to 4 maps to the five `tint-*` tokens).
- No photos. No logos inside cards.

## Glass level of detail
- Card uses class `glass` when `lens.scale >= 0.85`, otherwise `glass--lite` (no `backdrop-filter`).
- Toggle by setting `el.dataset.lod = "hi" | "lo"` only when it changes, and style with CSS (`[data-lod="hi"] {…}`) or swap the class. Do **not** write the class every frame.
- Expected: about 12 to 20 cards get real blur. Never more than 25.

## Stage (behind the cards)
`.stage` (teal-950) full-viewport with four `.orb` blobs (peach, gold, teal, lavender) at different sizes (40 to 60vmax), slow drift already defined. Add a 4% dot grid via `radial-gradient`. On screens under 768px use 2 orbs only. The orbs are what the glass refracts, so keep at least one bright orb near the centre.

## Coordinates and the render loop
Camera `(camX, camY)`: `screen = world + cam + (W/2, H/2)`. Camera `(0,0)` centres cell (0,0).

Each animation frame (use `requestAnimationFrame`, `dt` from timestamps):
1. `cam.x = damp(cam.x, target.x, dt)`, same for y. Apply inertia (below) to `target` before that.
2. `m = metricsFor(W)`. `range = visibleRange(cam.x, cam.y, W, H, m)`.
3. If the range integers (`c0,c1,r0,r1`) differ from last frame, `setState(range)` (this is the ONLY React re-render trigger). React renders one `BookingCard` per cell in range with `key = "${col},${row}"`.
4. For **every rendered card** (from a `Map<string, HTMLElement>` filled by ref callbacks):
   - world = `cellCenter(col,row,m)`; unwarped screen = `world + cam + (W/2,H/2)`.
   - `L = lens(sx, sy, W, H)`.
   - Off-screen test using `L.x, L.y, m.cardW*L.scale, m.cardH*L.scale` with a 60px slack. If off-screen: `el.style.display = "none"` and continue (this keeps ~30 to 60 cards visible out of ~100 to 160 mounted).
   - Else `el.style.display = ""`, `el.style.transform = translate3d(L.x - m.cardW/2 px, L.y - m.cardH/2 px, 0) scale(L.scale)`, `el.style.opacity = L.opacity`, `el.style.zIndex = L.z`, and update `data-lod`. Cards are `position:absolute; left:0; top:0; width:cardW; height:cardH; transform-origin:center`.
   - Track the card with the largest `L.focus` as the **focused** card: set `data-focus="true"` on it only (remove from the previous). CSS: brighter border, +8% white fill, `box-shadow` peach glow 0 0 0 1px + 0 0 40px peach 25%.
5. Never touch React state per frame. All per-frame work is direct style writes.

## Input (`useCamera`)
- **Pointer drag**: `pointerdown` on the wall container with `setPointerCapture`; `touch-action: none`; cursor `grab`/`grabbing`. Update `target` by pointer delta. Keep the last ~6 samples for velocity. On release: `target += velocity * 240` (ms of momentum). A pointer movement over 6px marks the gesture as a drag and suppresses the click on release.
- **Wheel / trackpad**: `target.x -= deltaX`, `target.y -= deltaY` (listener `{ passive: false }` and `preventDefault()` so the page does not scroll). Shift+wheel maps vertical delta to horizontal.
- **Keyboard**: arrow keys pan by 160px (hold Shift for 480). `Enter` or `Space` on a focused card opens it. `Escape` closes the detail. Tab moves through on-screen cards in DOM order (cards are buttons).
- **Idle drift**: if the visitor has not interacted for 4s, add a slow drift (`target.x += 0.25 px/frame`). Stop instantly on any input. Disabled for reduced motion.
- **Reduced motion**: no idle drift, no intro stagger, `damp` rate 1 (instant), lens still applies (it is layout, not motion).

## Opening a card (`BookingDetail`)
Original behaviour: the image flies to the middle and grows to 40% of the viewport, with the custom ease `"hop"` (`0.9, 0, 0.1, 1`). Do the same:
1. On click, read the card's current bounding rect. Mount a portal `dialog` element (`role="dialog" aria-modal="true" aria-label="Booking details, sample data"`) positioned at that rect.
2. GSAP `fromTo` to the centre: width `min(92vw, 520px)`, height auto (~360px), duration 0.9, ease `"hop"` (`CustomEase.create("hop","0.9,0,0.1,1")`). Hide the original card (`visibility:hidden`) meanwhile.
3. Dim the stage: overlay `rgb(3 20 20 / 0.55)` with `backdrop-filter: blur(6px)` (this is the one place a large blur is fine; it replaces the wall's own blurs while open, so pause the loop's style writes).
4. Content (cross-fade in after 0.5s): big Space Mono token `#14`; patient (first + initial), doctor, specialty, date/time; booking ID; a 4-step timeline that echoes the safety story with sample timestamps:
   *Message received (via WhatsApp)* → *Aria read the request (Gemini, intent only)* → *Slot locked (booking engine)* → *Confirmation sent*.
   Footer line: "Sample data. No real patients." and a Close button.
5. Close on Escape, on overlay click, or Close button: reverse the tween back to the card rect, restore visibility, return focus to the card.
6. While open: freeze the camera and ignore wheel/drag. Trap focus inside the dialog.

## Intro
On mount, cards appear from the centre outward: `gsap.from(cards, { scale: 0.6, opacity: 0, duration: 0.9, ease: "power3.out", stagger: { each: 0.012, from: "center" } })`, applied once to the first batch only (not to cards that mount later while dragging).

## HUD (fixed, above the wall, `pointer-events: none` except buttons)
- Top-left glass pill: "Confirmed bookings" + `Sample data` chip. Sits below the navbar.
- Bottom-centre glass pill: "Drag, scroll or use arrow keys". Fades out after the first interaction.
- Top-right area is the navbar (already global).
- Optional live pulse (skip if time is short): every 3 to 4.5s, one random card with `L.r < 0.7` plays a 700ms ring pulse on its tick. Disabled for reduced motion.

## Mobile
- `unit` shrinks the whole system (`metricsFor`). Cards stay tappable (minimum on-screen width about 165px at the centre).
- Touch drag uses the same pointer code. Add a visible "Back" affordance: the navbar remains on top, so there is never a scroll trap.
- Use `100dvh`. Cap orbs to 2. `will-change: transform` only on the cards, never on the stage.

## Acceptance checks
- [ ] Dragging in any direction for 60 seconds never runs out of cards and never shows an empty hole.
- [ ] Middle card is visibly the largest (about 1.3x), corner cards about 0.5x and faded. No overlaps.
- [ ] Chrome Performance panel: steady 60fps on a mid-range laptop at 1440x900; mounted card count stays under 170; visible under 70; `backdrop-filter` elements under 25.
- [ ] Click opens the detail with the "hop" flight; Escape closes; focus returns.
- [ ] Refreshing the page shows the same cards in the same places (deterministic).
- [ ] `prefers-reduced-motion`: no intro, no drift, instant camera.
- [ ] Every card and the dialog are labelled "Sample data".
