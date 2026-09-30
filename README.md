# Aprish website: build pack

A complete brief, brand assets and tested starter code for building the Aprish marketing site in VS Code with DeepSeek (or any coding model).

## How to use
1. Unzip, open the folder in VS Code, run `npm install`.
2. Copy `PROJECT_RULES.md` into your extension's rules location so it loads on every request.
3. Paste `FIRST_PROMPT_FOR_DEEPSEEK.md` as the first message.
4. Then send **one phase at a time** from `docs/07_BUILD_PHASES.md` (Phase 0 to 7). Run `npm run build` after each.

## What the site is
| Piece | Comes from | Doc |
|---|---|---|
| Palette, fonts, "Clinical Comfort" look, glass | your theme project + logo gold | 01 |
| Routes and section layouts | your theme copy brief, corrected to match the deck | 02 |
| What the site may claim | pitch deck, Seva First PDF, Q&A sheet | 03 |
| **Infinite glass wall** (`/live`): big in the middle, small at the corners, fictional confirmed bookings | your "Infinite scroll" project | 04 |
| **Stair page transitions** + full-screen menu, re-skinned | your "Tranctiontions" project | 05 |
| **Logo dot system** and **phone chat demo** | your theme project | 06 |

## What is already done (tested)
- `public/brand/`: transparent logos (light and dark), wing motif, favicons, OG base, the QR code, all extracted from your deck.
- `src/styles/index.css`: Tailwind v4 tokens, glass classes, stairs, chips, reduced-motion rules.
- `src/lib/wall/`: deterministic booking generator and the lens maths. Tested at 8 viewport sizes: no card overlap (min gap 5px), full coverage of every card that can appear on screen. Run `tsx` on your own tests if you change them.
- `src/content/`: `copy.ts` (all copy and the chat scripts), `status.ts` (single source of truth for Live / In development / Planned), `config.ts` (WhatsApp number, form endpoint).

## Not tested
No `npm install` or browser run was possible where this pack was made, so the React components, GSAP timelines and CSS have **not** been run. The specs include acceptance checks for each; Phase 7 is where they get verified.

## Decisions for the founder (details in docs/03 and docs/08)
1. **WhatsApp number.** The QR in the deck encodes `+852 5494 3646` (a Hong Kong number). Confirm it is the number Indian clinics should message. It is set in `src/content/config.ts`.
2. **Claims removed** from the old site copy because no source supports them: UPI payments, "zero no-shows", 5-star Google review routing, medication reminders, invented usage numbers. The review routing is also review-gating, which Google's policies prohibit.
3. **Status of built-but-unconfirmed features** (queue, delay alerts, prescriptions, billing, stock): shown as "In development" until you flip them in `status.ts`. The Seva First PDF says several already exist.
4. **Pricing** is hidden (`SITE.showPricing = false`) until you confirm the deck's tiers are current.
5. **"First 20 clinics"** was in the old site brief but not the deck; the site says "limited beta" without a number.
6. **Logo.** The theme project's logo is an opaque black square, which is why its dot system compared pixels to a corner. The pack uses transparent versions cut from the deck. A vector master would still be better.
7. The deck's slide 5 calls the phone screenshot a "live product interface", but it comes from the website's scripted demo. The site labels it "Interactive demo".
