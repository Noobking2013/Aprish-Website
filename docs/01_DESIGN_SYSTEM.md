# 01. Brand and design system

Tokens already exist in `src/styles/index.css`. This file explains how to use them and what makes the site distinctive.

## The one-line direction
**Warm clinical calm on cream, with a dark glass stage for the moments that show the product working.**
The palette is the approved "Clinical Comfort" theme (cream, deep teal, peach) plus the logo's gold star.

## Where the boldness goes (and where it does not)
The memorable things, in order:
1. **The logo assembling itself out of gold dots** in the hero (doc 06).
2. **The infinite glass wall** of confirmed bookings, big in the middle and shrinking toward the corners (doc 04).
3. **The stair-step page transitions** in the brand colours (doc 05).
4. **The phone chat** that plays a short conversation by itself, then hands over to the visitor (doc 06).

Everything else stays quiet. Specifically:
- No fade-and-slide-up on every section. Sections simply appear. Only the moments above animate on their own.
- No hover lift on every card. Hover states are for things you can click.
- No tracked-out ALL-CAPS mono eyebrow above every heading. An eyebrow is allowed only when it carries information (a status chip, a step label). Use sentence case, DM Sans 600, 0.8rem.
- No `01 / 02 / 03` numbering except on the 5-step patient flow, which is a real sequence.
- No spaced em-dash labels ("WORD — fragment") and no `→` on every button. An arrow is allowed only on a CTA that navigates to another page.
- Emphasis in a headline: italic Instrument Serif on **one phrase** in `coral-600`, and only in the hero. Other headlines are plain.

## Colour roles
| Token | Hex | Use | Never use for |
|---|---|---|---|
| `cream-100` | #f7f4e9 | page background | |
| `cream-50` | #fffdf6 | cards on cream | |
| `cream-200` | #e9eee0 | quiet band between sections | |
| `teal-900` | #173d3d | primary text on cream, dark sections, primary buttons | |
| `teal-950` | #0d2626 | glass stage, transition bars | |
| `teal-600` | #52706d | secondary text on cream (4.9:1) | text on teal backgrounds |
| `sage-300` | #bed0c4 | body text on dark (7.3:1) | |
| `peach-400` | #eaa373 | accent **fills**, buttons on dark, focus glow, highlights on dark | text on cream (1.9:1) |
| `coral-600` | #c87850 | icons, the single italic headline phrase (large text only) | small text |
| `coral-700` | #9a5a34 | small text on cream (4.9:1) | |
| `gold-400` | #edb570 | particles, star, sparkle | |
| `gold-500` | #d9962b | Aprish Black ring | |
| `tint-*` | see css | soft card fills (sand, mint, lavender, blush, parchment) | more than one tint per card |

Section rhythm on Home: cream, teal-900, cream, **teal-950 stage** (phone), cream-200, peach-400 (beta), teal-900 (footer).

## Type
- **Display**: Instrument Serif 400, `letter-spacing: -0.035em`, `line-height: 0.95` (class `.display`). Scale: hero `clamp(3.4rem, 9vw, 7.4rem)`, H2 `clamp(2.4rem, 5.5vw, 4.6rem)`, H3 `clamp(1.6rem, 2.6vw, 2.4rem)`.
- **Body/UI**: DM Sans 400/500/600. Body 1rem/1.65 on cream. Lead paragraphs use `.lead`. Line length under 70 characters.
- **Data**: Space Mono, class `.data`, only for token numbers, times, booking IDs, and the ROI results.
- Sentence case everywhere. Numerals in Latin digits. Rupee symbol ₹ with Indian grouping (`1,00,000`) via `Intl.NumberFormat("en-IN")`.

## Shape and spacing
- Radius scale (do not use one radius for everything): buttons and chips = pill; cards = 28px; wall cards = 26px; phone = 2.35rem outer; inputs = 14px.
- Section padding: `py-24 md:py-36`. Max content width 1240px, side padding `px-5 md:px-8`.
- Grid: 12-col on desktop. Text left-aligned. Centre alignment only for the wall HUD and the beta CTA.

## Buttons
- **Primary**: `teal-900` pill, cream text, 14px/28px padding. On dark stages: `peach-400` pill, `teal-900` text.
- **Secondary**: text link with a 1px underline offset 4px. No border, no fill.
- Minimum tap target 44px. Visible focus ring (already in base CSS).

## Glass (Apple "Liquid Glass" feel)
Classes in `index.css`: `.glass` (dark stages), `.glass--light` (on cream), `.glass--lite` (no blur, for far cards).
Rules:
1. Glass needs something behind it to refract. Every glass area sits on a `.stage` with 3 to 4 drifting `.orb` blobs (peach, gold, teal, lavender) or on the particle canvas.
2. Light text on glass needs the dark tint already in `.glass`. Check contrast against the brightest orb.
3. **At most 12 elements with `backdrop-filter` on screen at once.** More than that tanks mobile GPUs. The wall uses `.glass--lite` for every card that is not near the centre.
4. Always keep the `@supports not (backdrop-filter)` fallback that is already in the CSS.
5. No `transform-style: preserve-3d` or 3D rotation on any element that has `backdrop-filter`; it breaks in Safari. Use scale and translate only.

## Brand assets (`public/brand/`)
- `logo-on-dark.png` (cream A, gold star): nav on dark, glass headers, footer.
- `logo-on-light.png` (dark A, gold star): nav on cream.
- `wing-motif.png`: 1200px wing shape at low contrast, for very large background use at 4 to 8% opacity on `teal-900`.
- `qr-aria-whatsapp.png`, favicons, `og-base.png`.
The original theme logo file is an opaque black square. **Do not use it in the UI.** Use the two transparent files above.
A vector master of the logo does not exist yet; request one from the founder for print and for crisp large sizes.

## Wordmark
`aprish` lowercase, DM Sans 600, `letter-spacing: -0.04em`, next to the mark. Mark height 28px in the nav.
