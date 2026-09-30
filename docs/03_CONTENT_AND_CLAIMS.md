# 03. Content and claims: what the site may say

The site has to match the pitch deck. The deck says it plainly: "We only list what is live." This file sorts every claim from the old theme copy brief, the deck and the Seva First PDF into three groups.

## A. Safe to state (supported by the deck or PDF)
- WhatsApp-first, **no app download** for patients.
- Aria is **live on WhatsApp**. Appointments and scheduling via WhatsApp AI is **live**.
- Booking, rescheduling and check-in happen in the chat (PDF).
- **Aria understands; the booking engine decides.** Gemini only interprets intent. Slot-locking, rules and an audit log make every booking decision. The AI never books, cancels or changes roles by itself.
- One backend serves WhatsApp, the dashboard and future apps. Multi-tenant from day one.
- Role-based web dashboard: **in development**.
- Aprish Black verification and Brand Partner Routing: **planned**.
- Positioning: "the Operating & Growth OS for independent healthcare"; ICP is independent and small-chain outpatient practices, 5 to 30 doctors, 1 to 5 locations.
- Founder: Prithvi Singh. Spokesperson: Grishika Vashisht.

## B. Built according to the PDF, but the deck lists the status as [FILL]
Live queue and check-in, doctor-delay alerts (broadcast), digital prescriptions, doctor scheduling, role-based access, Billing & EMR-lite, Stock tracking.
**Default on the site: "In development"** (`status.ts`, `confirmed: false`). The founder flips each to `live` in one line once confirmed. Do not write "live" in copy for these.

## C. Not supported by any source. Do not publish
These came from the old theme brief (`reference/theme/old-copy-brief.txt`). Leave them out unless the founder supplies proof.

| Old claim | Why it is out | What we say instead |
|---|---|---|
| "Instant UPI payments", "100% advance UPI = zero no-shows", "₹500 received via UPI" | No source mentions payments. Billing status is [FILL]. "Zero no-shows" is an absolute claim nobody can back. | Rescheduling and reminders reduce empty slots (only if reminders are confirmed). The ROI calculator lets the clinic do its own arithmetic. |
| "Happy patients are routed to a 5-star Google review, unhappy feedback caught privately" | This is review gating. Google's review policies prohibit selectively soliciting positive reviews, and it may breach Indian consumer rules on misleading reviews. Verify before ever using. | Removed. Flow step 6 is dropped. |
| Daily medication reminders, "aftercare automation" | Not in the deck or PDF. | "Follow-up nudges" tagged **Planned**. |
| "500M+ Indians use WhatsApp every day" | Unsourced. | Removed. |
| "18 questions answered, 6 queue updates, 4 reviews" | Invented illustrative numbers. | Removed. Any number shown must be labelled "Sample". |
| "First 20 clinics only" | Not in the deck. Kept in config (`SITE.betaSlots = 20`) for the founder to confirm; the word "limited beta" is used without a number until confirmed. | "Limited beta" |
| "Rank your clinic #1 in your city" | Outcome guarantee. | Removed. |
| "Eliminate no-shows completely", "revenue on autopilot", "permanently end front-desk chaos" | Absolute or guaranteed outcomes; also risky under Indian medical-advertising rules. | Plain descriptions of what the product does. |
| Title "Aprish, Clinical Comfort" and the "quiet clinic / human warmth" idea | The old theme positioning. The deck positions Aprish as an operating and growth OS. | "The operating and growth OS for independent clinics" |

## Voice
Confident, plain, specific. Short sentences. Say what a thing does, not how it feels. No hype words (revolutionary, seamless, game-changing). No exclamation marks except inside the sample chat messages. Refer to the reader as "your clinic" and "your patients".

## Demo and sample data rules
- Every fictional booking, name, token, time and chat reply is labelled **Sample** (chip or caption) wherever it appears.
- Names are first name + last initial only. No photos, no phone numbers, no real doctor names.
- Do not show running totals ("1,284 bookings today"). They would read as real traction.

## Beta form behaviour (fix for a bug in the old code)
The old `WaitlistForm` showed a success message **without sending anything**. Do not repeat that.
1. Fields: name, clinic name, city, number of doctors (number), WhatsApp number or email. Consent checkbox (required) with `BETA.consent`.
2. Validate on blur and on submit. Show inline errors with `aria-describedby`.
3. If `FORM_ENDPOINT` is set: `fetch(POST, JSON)`; show success only on a 2xx response; on failure show an error and the WhatsApp fallback.
4. If `FORM_ENDPOINT` is empty: open `waLink()` with the entered details pre-filled as the message, and show `BETA.fallbackNote`. Never fake a success.
5. Honeypot field named `company_website` (hidden) to reduce spam. Disable the button while sending.

## Compliance to-do (surface in the footer and `/privacy`)
- Consent line next to any form (DPDP Act).
- No third-party analytics or cookies by default. If analytics are added later, add a consent banner first.
- Legal review before launch of: Aprish Black wording, any Brand Partner Routing wording, and medical-advertising compliance.

## Open placeholders that must stay visibly unresolved
Do not fill these with guesses. Render nothing or a neutral "To be confirmed": privacy statuses, Aprish Black criteria/verifier/cost, signed partners, traction numbers, advisors, market sizing, competitor table, prices (unless `showPricing`).
