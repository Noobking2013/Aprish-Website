# 09. Decisions log (this file wins when docs disagree)

Order of authority when two docs conflict: **09 (this file)**, then the more specific doc (06 beats 02 for anything inside the phone, 04 for the wall, 05 for transitions), then everything else. Ask the founder only when the answer changes what the site claims.

| # | Decision | Why |
|---|---|---|
| D1 | `CHAT_DEMO.note` ("Interactive demo. Replies are scripted...") renders **on the phone only**, as a chin strip on the pastel frame. The left column does not repeat it; `DEMO.sub` there already says "scripted illustration". | The honesty label must travel with any screenshot of the phone. Saying it twice in one section reads as nervous. |
| D2 | The Try Aria H2 is **"Book an appointment at any hour, even when the clinic is closed."** The phone clock and bubble timestamps are **2:40 / 2:40 PM**. | The earlier "9:41 PM" H2 contradicted the scripts, which offer "today 4:15 PM". 24/7 availability is still stated by `DEMO.sub`; founder to confirm uptime wording (see README). |
| D3 | Headline emphasis (italic coral) is **hero only**. Try Aria's H2 is plain. | docs/01. |
| D4 | Phone header keeps `.glass` blur and rim but uses an explicit dark tint (`bg-teal-950/95`) and must measure 4.5:1 or better. | Glass tint assumes a dark backdrop; inside the phone it is cream. |
| D5 | In-phone small text: `teal-700` on the chat body. `teal-600` only on the frame (4.67:1) or on cream. Doc 06's earlier "4.6:1" for teal-600 on `#e5ecdc` was wrong (it is 4.46). | Re-measured. |
| D6 | `data-nav-theme` goes on sections, never on `<main>`. | The observer takes the first intersecting element in document order. |
| D7 | The chat intro is the initial state. Autoplay is only the patient message and Aria's reply, once, never under reduced motion. | The phone is never an empty box; matches reduced-motion behaviour. |
| D8 | Each script tab shows a status chip from `status.ts`. Any demo depicting a feature with `confirmed: false` carries its chip. | The demo otherwise shows unconfirmed features as working. |
| D9 | Phone bezel uses the `teal-950` token, not `#102d2d`. QR sits in a cream card with explicit width/height. | Single-sourced palette; no bare white square; no layout shift. |

## Open founder items still affecting build
WhatsApp number (+852 in the QR), pricing currency, "limited beta" count, status of each `confirmed: false` feature, and whether "24/7" is a promise you can keep (uptime, WhatsApp rate limits, what happens when the model is down).
