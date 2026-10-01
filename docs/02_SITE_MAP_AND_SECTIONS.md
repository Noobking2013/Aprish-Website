# 02. Site map and section-by-section layout

## Routes
| Route | Purpose | Loaded |
|---|---|---|
| `/` | Home: what Aprish is, try Aria, join the beta | eager |
| `/product` | Modules with honest status, the safety model, ROI calculator, optional pricing | eager |
| `/live` | **The infinite glass wall** of confirmed bookings (sample data). Full viewport, no page scroll | `React.lazy` |
| `/black` | Aprish Black trust-mark (Planned) | `React.lazy` |
| `/join` | Beta form + WhatsApp QR + who is behind Aprish | eager |
| `/privacy` | Privacy notice (placeholder text, needs legal review) | eager |
| `*` | Not-found page with a link home | eager |

The wall is its own route on purpose. A drag-canvas inside a scrolling page traps the visitor's scroll. Home only shows a small static preview of it with a button to enter (which triggers the stairs transition).

## Global chrome
- **Navbar** (fixed, top): logo + wordmark left; right side a glass menu button (two lines, K72-style) that opens the full-screen stairs menu. On desktop also show a peach "Join the beta" pill left of the button. Nav text colour follows the section underneath via `data-nav-theme="dark|light"` on sections and an IntersectionObserver.
- **Full-screen menu**: doc 05.
- **Footer**: teal-900. Logo, three link groups (Product, Company, Legal), WhatsApp link, "© 2026 Aprish". No fake social icons; only links that exist.
- **Skip link** to `#main` as the first focusable element.

## Home (`/`)
Section order, background, and what each contains. Copy keys are in `src/content/copy.ts`.

### 1. Hero (cream-100, `min-h-[100dvh]`)
```
┌──────────────────────────────────────────────────────────────┐
│ [logo] aprish                        [Join the beta] [≡]     │
│                                                              │
│  No app download · 24/7 WhatsApp booking · Built for…        │
│                                     ·  ·  ·  ·  ·  ·        │
│  The automated                    ·  · (gold dots forming  ·)│
│  *front desk*                     ·  ·   the Aprish logo   · │
│  for high-volume care.            ·  ·   reacting to cursor· │
│                                      [glass card: Sample     │
│  Aprish is the operating…            "Token #14 confirmed…"] │
│  [Chat with Aria on WhatsApp]  Join the beta                 │
│  ● Aria is online 24/7                                       │
└──────────────────────────────────────────────────────────────┘
```
- Left: text column (max 34rem). H1 uses `HERO.h1` with only `HERO.h1Emphasis` in italic `coral-600`.
- Right: `LogoParticles` canvas fills the column (doc 06). One `.glass--light` floating card (`HERO.floatingCard`) overlaps its lower-left, and a small "Aria is online" pill overlaps its upper-right. Both cards drift 6px on a slow CSS float (the only ambient motion here).
- Primary CTA opens `waLink()` in a new tab (`rel="noopener"`). Secondary goes to `/join`.
- Below the fold hint: a thin scroll cue that fades after first scroll.
- Background: `cream-100` with a very faint 48px grid at 4% and one radial peach/teal glow (from the theme).

### 2. Problem (teal-900, `.on-dark`)
- Left column: H2 `PROBLEM.h2`, intro, link "See how it works" scrolling to section 3.
- Right: 2×2 tinted cards (`PROBLEM.cards`). Each card: icon (lucide, `teal-700` — see docs/09 D14), title, body, and a **status chip** from `FEATURES[card.feature].status`. Card fill uses a tint token, text `teal-900`.

### 3. The flow (cream-100)
- H2 `FLOW.h2`, intro.
- Five steps as a horizontal pill tabs row + one large card (the original `ExperienceSteps` pattern), auto-advancing every 6s **only while in view and not hovered/focused**, with a progress underline on the active pill. Back/Next buttons. Each step shows its status chip.
- Numbered (01 to 05) because it is a true sequence.

### 4. Try Aria: the phone (`.stage` teal-950, `.on-dark`)
- Two columns. Left: H2 "Book an appointment at any hour, even when the clinic is closed." (plain, no emphasis; see docs/09 D2), supporting line (`DEMO.sub`, which already says the conversation is a scripted illustration), the four script tabs (`CHAT_DEMO.scripts`) each with its status chip, a **"Open the real Aria" button** (`waLink()`) and the QR image with caption "Scan to chat with Aria". `CHAT_DEMO.note` is rendered **on the phone only** (docs/09 D1), not repeated here.
- Right: the phone (doc 06). Behind it: orbs. The phone header is `.glass`.

### 5. The safety model (cream-200)
- H2 `SAFETY.h2`. A four-node horizontal flow (`SAFETY.nodes`) drawn with divs and one SVG connector line. The third node (Booking engine) is filled `peach-400`. When the section enters view, a peach "pulse" travels node 1 → 4 once (GSAP timeline, 2.4s). Below, the three `SAFETY.points`.
- Under that, the four privacy items from `PRIVACY`. `status: null` renders a grey chip "To be confirmed".

### 6. Wall teaser (`.stage` teal-950)
- 3 columns × 2 rows of static `.glass` booking cards using `bookingAt()` with the same lens scale profile (large middle, smaller outside), plus H2 "Confirmed bookings, one after another." and a peach button "Open the live wall". Label "Sample data" chip.

### 7. ROI calculator (cream-100)
- H2 `ROI.h2`. Four numeric inputs (average fee ₹, no-shows avoided per day, working days, plan price ₹). Outputs (Space Mono): monthly value and break-even visits. Formulas printed under the outputs (`ROI.formulas`). Show `ROI.disclaimer` next to the outputs. Debounce nothing; compute synchronously. Validate: non-negative numbers, empty = 0, guard divide-by-zero.

### 8. Beta CTA (peach-400)
- H2 `BETA.h2`, body, the form (doc 03 for behaviour) or a compact 2-field version that continues on `/join`. Consent checkbox is required.

## `/product`
1. Header: "One platform. Start with one module."
2. **Modules** (`MODULES`): two columns "Core" and "Augmented", each item a card with name, one-line description, and status chip; then a full-width row for the web dashboard ("In development").
3. **Safety model**: same component as Home section 5.
4. **ROI calculator**: same component.
5. **Pricing** (render only if `SITE.showPricing`): three tiers Basic / Advanced (target) / Enterprise with the ranges from the deck (₹2,000–4,000; ₹15,000–1,00,000; ₹1,00,000–3,00,000+ per month) and the line "One published price list; rates vary by location tier." Default is hidden until the founder confirms these are current.

## `/live` (the glass wall)
Full spec in `docs/04_GLASS_WALL_SPEC.md`. Full-viewport `.stage`, nothing else scrolls. Fixed HUD: title + "Sample data" chip top-left, hint bottom-centre, nav on top.

## `/black`
- Full-viewport `teal-900` with `wing-motif.png` at 6% opacity.
- Centre: the badge, a `gold-500` ring 2px (SVG circle, draws itself once), logo inside, text "BLACK" and below it "VERIFIED" in DM Sans, wide letter-spacing (this is the one place ALL-CAPS tracking is right, because it is a badge). A `Planned` chip beneath.
- Then H2 `BLACK.h2`, `BLACK.sub`, `BLACK.tagline` in italic serif, and `BLACK.criteriaNote`. Do not invent criteria, verifiers, cost or timing; the deck marks all of them as not yet defined.
- CTA: "Tell us you are interested" to `/join`.

## `/join`
- Left: H2 and the beta form. Right: QR (`qr-aria-whatsapp.png`, 200px) with "Or scan to chat with Aria", and a small "Who is behind Aprish" block: **Prithvi Singh, Founder** and **Grishika Vashisht, Spokesperson** (names and roles only; no photos or bios until supplied).
- Success state replaces the form with `BETA.success` and the WhatsApp button.

## `/privacy`
Short plain-language notice stub: what the form collects (name, clinic, city, doctor count, contact), why, retention placeholder, contact placeholder. Add a visible comment `{/* Needs legal review (DPDP Act) before launch */}` and an `SITE.contactEmail` placeholder.

## SEO
Per-route `document.title` and meta description via a tiny `useDocumentMeta` hook (no library). Add `robots.txt`, `sitemap.xml`, and JSON-LD `Organization` on Home. `og-base.png` is the share image.
