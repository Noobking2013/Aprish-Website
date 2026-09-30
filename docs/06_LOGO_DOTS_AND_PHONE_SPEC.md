# 06. Logo dot system and phone chat demo

Both come from the approved theme project. Read the originals first:
- `reference/theme/App.reference.tsx` (function `LogoParticles` = lines 38 to 197; `demos` data = lines 340 to 416; function `PhoneDemo` = lines 418 to 561; `ExperienceSteps` = lines 614 to 707)
- `reference/theme/LogoParticleSystem.reference.jsx` (a second, standalone version of the same idea)
- `reference/theme/index.reference.css` (the `.phone-shadow`, `.typing-bubble`, `.floating`, `.pulse-dot` rules)

Port the behaviour, not the file. Fix the issues listed under each.

---

## A. Logo dot system (`src/features/brand/LogoParticles.tsx`)

### What it does (keep)
The Aprish logo is sampled into a few thousand small dots. Dots start at random positions and ease into the logo shape. The cursor pushes dots away (radius ~110px) and they spring back. A soft shimmer varies each dot's alpha.

### Fixes and improvements
1. **Sample from alpha, not from a corner colour.** The original PNG was an opaque black square, so the code compared each pixel to the corner. The new `public/brand/logo-on-light.png` and `logo-on-dark.png` are transparent: use `alpha > 0.35` only.
2. **Two-colour mapping** read from CSS variables at draw time (so a section can re-theme it): body dots use `--particle-body` (gold-500 on cream by default, cream on `.on-dark`), star dots use `--particle-star`. Detect star pixels by hue: pixel is gold if `r > 180 && g > 130 && b < 140 && r - b > 70`. Star dots are 1.4x bigger and never shimmer below 0.7 alpha, so the star sparkles clearly. Which PNG to sample: always `logo-on-dark.png` (shape only matters; colour is remapped).
3. **Performance**: stride 4 on desktop, 6 under 768px (aim for 2,500 to 4,000 dots). Use `fillRect` for dots under 2px (faster than `arc`). Cap DPR at 2. Pause the loop with an `IntersectionObserver` when the hero is off-screen, and on `document.visibilitychange`. Re-sample on resize via `ResizeObserver` (debounced 150ms).
4. **Reduced motion**: place dots at their target immediately, draw once, no shimmer, no cursor repulsion.
5. **Touch**: `touch-action: pan-y` on the canvas so vertical scrolling still works. Repel on `pointermove` for mouse and pen; on touch, repel while the finger is down.
6. **Cleanup** (React StrictMode): cancel rAF, disconnect observers, remove listeners, revoke nothing global.
7. **Accessibility**: `aria-hidden="true"` on the canvas; the logo also exists as text/`img` elsewhere (nav).
8. **Image load failure**: if the PNG fails, render the static `<img>` of the logo instead of a blank canvas.

### Props
```ts
interface LogoParticlesProps {
  className?: string;
  compact?: boolean;        // smaller, denser: for the footer or menu (max 240px wide)
  interactive?: boolean;    // default true
}
```

### Where it is used
- Home hero (large, right column, about 660px max width).
- Optional: `/black` behind the badge at 25% opacity (no interaction).
- Optional: full-screen menu, compact, bottom-right, `.on-dark` variables.

### Acceptance
- [ ] Dots assemble into a recognisable A with a bright gold star within about 1.5s.
- [ ] Moving the cursor scatters nearby dots and they recover smoothly.
- [ ] Scrolling past the hero stops the loop (check in the Performance panel).
- [ ] Works with reduced motion and with the image blocked.

---

## B. Phone chat demo (`src/features/phone/PhoneDemo.tsx`)

### What it is
A phone with a WhatsApp-style conversation between a patient (Riya) and **Aria**. It is a **scripted, simulated demo**. It must say so, and it must lead to the real Aria on WhatsApp.

> Note for the founder: the deck (slide 5) captions a screenshot of this demo as "Live product interface". It is the website's simulated demo, not a real WhatsApp capture. On the site we label it honestly.

### Data
All text comes from `CHAT_DEMO` in `src/content/copy.ts` (4 scripts: Book a visit, Reschedule, Track the queue, Prescription). Types `ChatScript`, `ChatOption`, `ChatMsg` are exported there.

### Behaviour
1. **Autoplay once**: when the phone first scrolls into view (IntersectionObserver, threshold 0.4), Aria's intro appears, then after 900ms a simulated patient message (script 0, option 0) is "typed" and answered. Then it stops and waits for the visitor. Never autoplay again; never autoplay under reduced motion.
2. **Tabs** switch script (resets the conversation with the new `intro`). Tabs are real buttons with `aria-pressed`.
3. **Quick-reply chips** (the script's `options`) sit above the composer. Tapping a chip sends it as a user bubble, shows the typing indicator 850ms, then appends `replies`. Disable chips while typing. Once used, a chip is hidden for that run.
4. **Free typing**: the composer is a real `<input>`. On submit, test the text against `script.keywords` (regex); a match plays that option; no match replies with `CHAT_DEMO.fallback` and shows a WhatsApp button (`waLink()`).
5. **Confirmation bubbles** (`kind: "confirmation"`): styled as a card with a peach left tick icon, Space Mono token number, and "Confirmed" chip.
6. Message list auto-scrolls to the newest message (`scrollTo({top, behavior})`, instant when reduced motion). Message area has `role="log" aria-live="polite"`.
7. Footer strip inside the phone: `CHAT_DEMO.note` (small, `teal-600`).

### Visual spec (the approved theme look, improved)
- Outer bezel: `#102d2d`, 6px, radius 2.35rem, `.phone-shadow`, width 360px (max), subtle `.floating` bob (6s, +/-9px, +/-1deg). Bob is disabled under reduced motion and paused when off-screen.
- Status bar: `9:41`, signal/battery glyphs (Space Mono, tiny).
- Header: `.glass`-tinted strip on the stage. Avatar = `logo-on-dark.png` on a `teal-900` circle with a `peach-400` online dot (`pulse-dot`). Title "Aria · Aprish", subtitle "online".
- Body background `#e5ecdc` with a very faint doodle-free pattern (none). Bubbles: Aria = `#f7f6ea` with 1px `teal-900/10` border, radius 18px with bottom-left 4px; patient = `peach-400`-ish `#d89361` fill, `teal-900` text, bottom-right 4px. Timestamps in bubbles ("4:12 PM", Space Mono 9px) and WhatsApp-style ticks: one grey tick sent, two ticks read.
- **Contrast fixes**: the original used `#77918a` on `#e5ecdc` (2.8:1) and `#91a39a` placeholders (2.4:1). Use `#52706d` (4.6:1 or better) for all small labels and placeholders.
- Chips: `#f7f6ea`, 1px border, radius pill, 11px text, hover raises 1px only on desktop.
- Typing indicator: three bouncing dots (`.typing-bubble` in the original CSS).

### Typos and inconsistencies in the original demo copy (already fixed in `copy.ts`)
"perferable", "Hey Prithvi!," (the patient was called Riya), a reply that answered the wrong question, and payment-related lines. Keep the fixed version.

### Acceptance
- [ ] Autoplays exactly once when scrolled into view; the visitor can then use chips, tabs or type.
- [ ] Typing "derm" in script 1 plays the dermatologist reply; typing gibberish gives the fallback plus a WhatsApp button that opens the real Aria.
- [ ] Every small text passes 4.5:1.
- [ ] Screen reader reads new messages in order (live region).
- [ ] The words "Interactive demo" and "scripted" are visible near the phone.
