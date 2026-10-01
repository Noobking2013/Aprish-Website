/**
 * All marketing copy. Components import from here so copy can be edited in one place.
 * RULE: every sentence must be true today. Feature claims are tied to a FeatureKey so the
 * status chip can never disagree with the text. See docs/03_CONTENT_AND_CLAIMS.md.
 */
import { STATUS_LABEL, type FeatureKey, type Status } from "./status";

export const HERO = {
  tagline: "No app download  ·  24/7 WhatsApp booking  ·  Built for Indian clinics",
  h1: "The automated front desk for high-volume care.",
  h1Emphasis: "front desk", // set in Instrument Serif italic, coral-600. Emphasise ONLY this phrase.
  sub: "Aprish is the operating and growth OS for independent clinics. It starts where the pain is sharpest: appointments on WhatsApp, live today, with nothing for your patients to install.",
  ctaPrimary: "Chat with Aria on WhatsApp",
  ctaSecondary: "Join the beta",
  micro: "Built for the way Indian clinics actually work.",
  floatingCard: { label: "Sample message", body: "Token #14 confirmed. Dr. Mehta, 4:15 PM. Please reach 10 minutes early." },
  aliveBadge: "Aria is online 24/7",
  scrollCue: "Scroll", // affordance label for the thin below-the-fold hint
};

export const PROBLEM = {
  h2: "Stop losing patients to front-desk chaos.",
  intro:
    "Phones ring unanswered at peak OPD hours. WhatsApp messages get read late, or after the clinic closes. Waiting rooms fill with people who cannot tell whose turn is next. Aprish takes the repetitive front-desk work off your team.",
  seeHow: "See how it works", // docs/02 §2: the in-page link down to the flow section.
  cards: [
    { feature: "bookingViaWhatsApp" as FeatureKey, title: "Book slots 24/7, even while you sleep.",
      body: "Patients choose the doctor, the time and the clinic inside WhatsApp. The booking engine locks each slot, so two patients do not end up in the same one." },
    { feature: "queueCheckIn" as FeatureKey, title: "Stop waiting-room arguments before they start.",
      body: "A live token number for every patient, and an automatic message to the whole waiting line when a doctor runs late." },
    { feature: "digitalRx" as FeatureKey, title: "No more lost paper slips.",
      body: "Prescriptions and past visits stay on record, so an old patient returning after months does not mean digging through files." },
    { feature: "followUps" as FeatureKey, title: "Bring patients back at the right time.",
      body: "Gentle follow-up nudges when a course of treatment is due to finish." },
  ],
};

/*
   HOME, SECTION 3: THE FLOW (docs/02 "Home 3")

   Five steps in a true sequence, so they are numbered 01-05 (docs/01 allows numbering
   only for real sequences). The labels below are the pill text; the panel shows title +
   body + the chip for `step.feature`. Back/Next are the manual controls (docs/09 D13).
*/
export const FLOW = {
  h2: "Every visit, handled inside the chat.",
  intro: "From the first message to the follow-up, patients stay in an app they already use.",
  back: "Back",
  next: "Next",
  steps: [
    { feature: "ariaWhatsApp" as FeatureKey, label: "First contact", title: "One QR code at the desk. Zero crowd at the counter.",
      body: "Patients scan a standee at reception or message your WhatsApp number. No paper register, no app to install, no account to create." },
    { feature: "bookingViaWhatsApp" as FeatureKey, label: "Booking", title: "Aria finds the slot. The booking engine confirms it.",
      body: "Aria understands what the patient asked for. The booking engine checks the rules, locks the slot and writes to the audit log. The AI never books by itself." },
    { feature: "queueCheckIn" as FeatureKey, label: "Queue", title: "A live token and an honest wait time.",
      body: "Patients see their token and position. If a doctor is delayed, the waiting line is told automatically." },
    { feature: "digitalRx" as FeatureKey, label: "Records", title: "Prescriptions that do not get lost.",
      body: "Digital prescriptions and visit history sit on the same backend as the schedule, so a clinic never has two versions of the truth." },
    { feature: "followUps" as FeatureKey, label: "Follow-up", title: "The next visit, before the patient forgets.",
      body: "Follow-up nudges bring patients back when their course is due to end." },
  ],
};

export const SAFETY = {
  h2: "Aria understands. The booking engine decides.",
  nodes: [
    { title: "Patient message", sub: "via WhatsApp" },
    { title: "Gemini", sub: "interprets intent only" },
    { title: "Booking engine", sub: "slot-locking, rules, audit log", emphasis: true },
    { title: "Confirmation", sub: "sent to the patient" },
  ],
  points: [
    "The AI never books, cancels or changes roles by itself.",
    "One backend serves WhatsApp, the dashboard and future apps, so a clinic never has two versions of the truth.",
    "Multi-tenant from day one: one deployment can serve many clinics.",
  ],
  privacyHeading: "Privacy and compliance",
  privacyNote: "Status of each item is being confirmed. We will only mark something live once it is.",
};

/** Deck slide 10 formula, made interactive. Defaults are EXAMPLES (label them as such in the UI). */
export const ROI = {
  h2: "What a no-show costs. What a plan has to earn back.",
  intro: "Enter your own numbers. Nothing here is a promise; it is arithmetic.",
  defaults: { avgFee: 500, noShowsPerDay: 3, workingDays: 26, planPrice: 3000 },
  /** One label per input, in the order docs/02 §7 lists them. */
  fields: {
    avgFee: "Average consultation fee",
    noShowsPerDay: "No-shows avoided per day",
    workingDays: "Working days per month",
    planPrice: "Plan price you are considering",
  },
  /** Captions for the two results. The values themselves are computed, never copy. */
  output: {
    monthlyValue: "Monthly value of no-shows avoided",
    breakEven: "Bookings needed to break even",
  },
  /** Shown inline under a field that cannot be read as a number. */
  invalid: "Enter a number, 0 or more",
  /** Shown in place of the break-even number when the fee is 0 (division would be undefined). */
  zeroFeePrompt: "Enter your average fee to see the break-even.",
  formulas: {
    monthlyValue: "Monthly value = no-shows avoided per day × working days × average consultation fee",
    breakEven: "Break-even visits = plan price ÷ average fee",
  },
  disclaimer: "Example numbers. Your clinic\u2019s figures will differ.",
};

/*
   /product, the MODULES grid (docs/02 §product 2). Each entry is a FeatureKey plus one
   honest line about the module; the status chip is read from FEATURES, never written here,
   so the text can never disagree with the chip. `core`/`augmented` are the two columns;
   `inDev` is the full-width row that is not shippable yet.
*/
export interface ModuleSpec {
  feature: FeatureKey;
  /** One line on what the module does. It never states a status — the chip does that. */
  blurb: string;
}

/** docs/02 §product 1: the page header, above the modules grid. */
export const PRODUCT = {
  h1: "One platform. Start with one module.",
};

export const MODULES = {
  h2: "Start with one module. Add more as the clinic grows.",
  coreHeading: "Core",
  augmentedHeading: "Augmented",
  core: [
    { feature: "bookingViaWhatsApp", blurb: "Patients pick a doctor, a time and a clinic inside WhatsApp, and the booking engine locks the slot." },
    { feature: "billingEmr", blurb: "Billing and a light patient record sit beside the schedule, not in a separate system." },
    { feature: "stockTracking", blurb: "Stock is tracked as it moves, so the front desk stops guessing what is on the shelf." },
  ] as ModuleSpec[],
  augmented: [
    { feature: "ariaWhatsApp", blurb: "Aria answers patients on WhatsApp at any hour and hands every decision to the booking engine." },
    { feature: "blackVerification", blurb: "The Aprish Black trust-mark, earned by clinics and checkable by patients." },
    { feature: "brandPartnerRouting", blurb: "Patients are routed to the right brand partner at the right point in their care." },
  ] as ModuleSpec[],
  /** docs/02 §product 2: one full-width row, because the dashboard is not shippable yet. */
  inDev: {
    feature: "webDashboard",
    blurb: "A role-based web dashboard, so the whole clinic works from one shared view.",
  } as ModuleSpec,
};

/*
   /product, the optional pricing block (docs/02 §product 5). Rendered ONLY when
   SITE.showPricing is true, because the deck's tiers are marked "confirm they are current"
   (docs/09 D17). The three ranges and the note line are the deck's, verbatim.
*/
export interface PriceTier {
  name: string;
  price: string;
  /** docs/02 §product 5 marks Advanced as the target tier we are steering clinics toward. */
  target?: boolean;
}

export const PRICING = {
  h2: "Pricing",
  /** Shown as a small chip on the target tier. */
  targetLabel: "Target",
  tiers: [
    { name: "Basic", price: "\u20B92,000\u20134,000 / month" },
    { name: "Advanced", price: "\u20B915,000\u20131,00,000 / month", target: true },
    { name: "Enterprise", price: "\u20B91,00,000\u20133,00,000+ / month" },
  ] as PriceTier[],
  /** docs/02 §product 5: the one line that sums the list up. */
  note: "One published price list; rates vary by location tier.",
};

export const BLACK = {
  h2: "A trust-mark that clinics earn and patients can check.",
  sub: "A verified tier for clinics, in the spirit of food-safety or premium real-estate certifications.",
  status: "planned" as const,
  tagline: "Headache-free, friendly.",
  criteriaNote: "Criteria, who verifies and how often will be published before launch.",
  /** The two words inside the badge ring (docs/02 §black). The ALL-CAPS tracking is badge-only. */
  badge: { title: "BLACK", verified: "VERIFIED" },
  /** docs/02 §black: the only CTA, and it goes to /join. */
  cta: "Tell us you are interested",
};

/*
   HOME, SECTION 8: THE BETA CTA (docs/02 §8) + the working beta form (docs/03).

   The form's behaviour is docs/03's: it NEVER fakes success. `success` is shown only after the
   endpoint answers 2xx (see src/lib/beta.ts and docs/09 D16); without an endpoint the form opens
   WhatsApp prefilled and shows `fallbackNote`; a failure shows `error`. `fields` is the field
   order (name, clinic, city, doctors, contact) and doubles as the WhatsApp prefill line labels.
*/
export const BETA = {
  h2: "Modernise your front desk.",
  tagline: "Limited beta",
  body: "We are onboarding a small first group of clinics. Tell us about yours and we will set up a pilot.",
  /** Field labels, in the order docs/03 lists them. Reused as the WhatsApp prefill line labels. */
  fields: ["Your name", "Clinic name", "City", "Number of doctors", "WhatsApp number or email"],
  /** Shown when a required field is empty. */
  required: "Please fill this in.",
  /** Shown for the doctors field when it is not a whole number of one or more. */
  doctorsInvalid: "Enter a whole number, for example 3.",
  /** Shown for the contact field when it is neither an email nor a plausible phone number. */
  contactInvalid: "Enter a WhatsApp number or an email address.",
  consent: "I agree that Aprish may contact me about the beta. My details are used only for this purpose.",
  /** Shown when the required consent box is left unticked. */
  consentRequired: "Please tick the box so we may contact you.",
  submit: "Request a pilot",
  sending: "Sending\u2026",
  /** The ONLY success copy. Rendered only after the endpoint answers 2xx. */
  success: "Thanks. We have your details and will be in touch.",
  /** Shown for a non-2xx response, or when the request throws (offline, timeout). */
  error: "We could not send that. Please try again, or message Aria on WhatsApp.",
  /** Shown after the no-endpoint path hands the visitor to WhatsApp. */
  fallbackNote: "Prefer to talk now? Message Aria on WhatsApp.",
  /** Label for the WhatsApp button (success and fallback states). */
  whatsappButton: "Chat with Aria on WhatsApp",
  /** Accessible name for the hidden honeypot input; never shown to a person. */
  honeypotLabel: "Leave this field empty",
  /** Opening line of the message the form prefills into WhatsApp. */
  waIntro: "Hi Aria, I would like to join the Aprish beta.",
};

/* ------------------------------------------------------------------
   HOME, SECTION 4: TRY ARIA (docs/02 "Home 4", docs/06 section B)

   The phone's own labels live in CHAT_DEMO below. The H2 is plain: serif italic
   emphasis is hero-only (docs/01, docs/09 D3). The clock and the bubble timestamps
   are 2:40 / 2:40 PM so every time in the demo agrees with the scripts, which offer
   "today 4:15 PM" (docs/09 D2).
------------------------------------------------------------------- */
export const DEMO = {
  h2: "Book an appointment at any hour, even when the clinic is closed.",
  sub: "Aria answers on WhatsApp at any hour, checks the real schedule and locks the slot. The conversation below is a scripted illustration.",
  tabsLabel: "Choose a script",
  openRealAria: "Open the real Aria",
  qrCaption: "Scan to chat with Aria",
  qrAlt: "QR code that opens the Aria chat on WhatsApp",
};

/* ---------- Phone demo scripts (simulated, NOT the live model) ---------- */
export type ChatMsg = { from: "aria" | "user"; text: string; kind?: "text" | "confirmation" };
export interface ChatOption { label: string; replies: ChatMsg[] }
export interface ChatScript {
  id: string;
  tab: string;
  /**
   * The module this script depicts. It drives the tab's status chip from
   * src/content/status.ts, so a script for a feature that is not confirmed live reads
   * "In development" instead of implying it works today (docs/09 D8).
   */
  feature: FeatureKey;
  intro: ChatMsg[];
  options: ChatOption[];
  keywords: Array<{ match: RegExp; option: number }>;
}

export const CHAT_DEMO = {
  note: "Interactive demo. Replies are scripted; the real Aria is on WhatsApp.",
  fallback: "That is beyond this demo. Message the real Aria on WhatsApp to try anything.",
  /* Device chrome and in-app labels (docs/06, section B). */
  clock: "2:40",
  battery: "\u25c2\u2585\u2586 84%",
  time: "2:40 PM",
  header: { title: "Aria \u00b7 Aprish", status: "online" },
  today: "Today",
  logLabel: "Conversation",
  typing: "Aria is typing",
  tryLabel: "Try a message",
  placeholder: "Type a message to the demo",
  send: "Send",
  sent: "Sent",
  read: "Read",
  confirmed: "Confirmed",
  scripts: [
    {
      id: "book", tab: "Book a visit",
      feature: "bookingViaWhatsApp",
      intro: [{ from: "aria", text: "Hi, I\u2019m Aria. What can I help you with today?" }],
      options: [
        { label: "I need to see a dermatologist", replies: [
          { from: "aria", text: "Of course. Dr. Mehta has two openings today: 4:15 PM or 5:00 PM." },
        ]},
        { label: "4:15 PM works", replies: [
          { from: "aria", kind: "confirmation", text: "Confirmed. Token #14, Dr. Mehta, today 4:15 PM. Please reach 10 minutes early." },
        ]},
        { label: "I need a pediatrician", replies: [
          { from: "aria", text: "Dr. Rao can see you today at 3:30 PM or tomorrow at 10:15 AM." },
        ]},
      ],
      keywords: [{ match: /derm|skin|rash/i, option: 0 }, { match: /4[: ]?15|book|confirm/i, option: 1 }, { match: /paed|pedia|child|kid/i, option: 2 }],
    },
    {
      id: "reschedule", tab: "Reschedule",
      feature: "bookingViaWhatsApp",
      intro: [{ from: "aria", text: "Hello Riya. You have an appointment with Dr. Mehta today at 4:15 PM." }],
      options: [
        { label: "Can I change my appointment?", replies: [
          { from: "aria", text: "Sure. Dr. Mehta is free tomorrow at 11:00 AM or 2:30 PM. Which suits you?" },
        ]},
        { label: "Tomorrow 11:00 AM", replies: [
          { from: "aria", kind: "confirmation", text: "Done. Moved to tomorrow, 11:00 AM with Dr. Mehta. Your old slot is released." },
        ]},
        { label: "I\u2019m running late", replies: [
          { from: "aria", text: "Noted for the front desk. Your token will be held for a short while." },
        ]},
      ],
      keywords: [{ match: /change|resched|move/i, option: 0 }, { match: /tomorrow|11/i, option: 1 }, { match: /late/i, option: 2 }],
    },
    {
      id: "queue", tab: "Track the queue",
      feature: "queueCheckIn",
      intro: [{ from: "aria", text: "You\u2019re checked in, Riya. Ask me anything about your turn." }],
      options: [
        { label: "How much longer?", replies: [
          { from: "aria", text: "You\u2019re next after Token #03. Estimated wait: 12 minutes." },
        ]},
        { label: "Is the doctor running late?", replies: [
          { from: "aria", text: "Dr. Mehta is about 15 minutes behind. I\u2019ve updated everyone in the queue, so no need to wait at the desk." },
        ]},
      ],
      keywords: [{ match: /long|wait|turn|next/i, option: 0 }, { match: /late|delay|behind/i, option: 1 }],
    },
    {
      id: "rx", tab: "Prescription",
      feature: "digitalRx",
      intro: [{ from: "aria", text: "Hi Riya, hope the consultation went well." }],
      options: [
        { label: "Send my prescription", replies: [
          { from: "aria", text: "Here is today\u2019s prescription from Dr. Mehta. It stays saved to your visit history." },
        ]},
        { label: "When is my follow-up?", replies: [
          { from: "aria", text: "Dr. Mehta suggested a review in two weeks. Want me to find a slot?" },
        ]},
      ],
      keywords: [{ match: /prescri|medicine|rx/i, option: 0 }, { match: /follow|review|next visit/i, option: 1 }],
    },
  ] as ChatScript[],
};

/* ------------------------------------------------------------------
   THE LIVE WALL COPY (added in Phase 4a, docs/04_GLASS_WALL_SPEC.md)
   The wall shows fictional bookings from src/lib/wall/wallData.ts, so every
   card and the HUD carry the "sample data" honesty label (docs/03, demo rules).
   Wording is fixed by docs/02 ("title + Sample data chip") and docs/04 ("Drag,
   scroll or use arrow keys"). No numbers, no promises, nothing to verify here.
------------------------------------------------------------------ */

export const WALL = {
  /** HUD pill, top-left. Also the route's only heading (id="route-title"). */
  h1: "Confirmed bookings",
  /** The honesty chip. Fake bookings must say so wherever they appear. */
  sampleChip: "Sample data",
  /** HUD pill, bottom-centre. Fades out after the first input. */
  hint: "Drag, scroll or use arrow keys",
  /** Accessible name of the region that holds the cards. */
  regionLabel: "Confirmed bookings, sample data",
  /** Ends every card's aria-label, so no card is read without the label. */
  cardSuffix: "Sample data.",

  /* ------------------------------------------------------------------
     THE BOOKING DETAIL DIALOG (added in Phase 4b, docs/04_GLASS_WALL_SPEC.md).
     Everything a card opens into. The dialog is still sample data, so its
     accessible name and its footer both say so (docs/03, demo rules), and
     nothing here claims a status — status words come from status.ts only.
  ------------------------------------------------------------------ */
  detail: {
    /** role="dialog" aria-label. The "sample data" half is the honesty label. */
    dialogLabel: "Booking details, sample data",
    /** Captions for the two mono values the card already shows. */
    tokenLabel: "Token",
    bookingIdLabel: "Booking ID",
    /** The four steps of one booking, in order. Each is the whole line of copy. */
    steps: [
      "Message received, via WhatsApp",
      "Aria read the request, Gemini interprets intent only",
      "Slot locked, booking engine",
      "Confirmation sent",
    ],
    /** Heading over the step list. The times under it are derived samples. */
    timelineLabel: "Sample timeline",
    /** Closes the dialog (Escape and the overlay do the same). */
    close: "Close",
    /** Ends the dialog, after the timeline. Same promise as every card. */
    footer: "Sample data. No real patients.",
  },
};

/* ------------------------------------------------------------------
   HOME, SECTION 6: THE WALL TEASER (docs/02 "Home 6", docs/04)
   A still preview of /live. The H2 and the button label are the only new
   copy here: the "Sample data" chip reuses WALL.sampleChip and every card
   reuses the wall's own BookingCardContent, so the teaser can never drift
   from the live wall. The H2 is plain — serif italic emphasis is hero-only
   (docs/09 D3).
------------------------------------------------------------------ */

export const WALL_TEASER = {
  /** Plain H2 over the preview grid. */
  h2: "Confirmed bookings, one after another.",
  /** TLink to /live that sits beside the sample chip. */
  buttonLabel: "Open the live wall",
};

/* ------------------------------------------------------------------
   GLOBAL CHROME COPY (added in Phase 1)
   Nav, full-screen menu and footer labels. The short route names used by the
   stairs overlay and the screen-reader announcement live in
   src/features/transitions/routes.ts — those are deliberately shorter
   ("Live bookings") than the menu row label ("Live wall"). Keep both in sync
   if the wording changes.
------------------------------------------------------------------ */

export const NAV = {
  skipToContent: "Skip to content",
  brandLink: "Aprish, back to home",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menuDialogLabel: "Menu",
  primaryNavLabel: "Primary",
  joinCta: HERO.ctaSecondary, // "Join the beta"
};

export interface MenuChip {
  label: string;
  /** When set, the chip renders with the real .chip[data-status] styles. */
  status?: Status;
  /** Fictional demo data must say so. See PROJECT_RULES.md. */
  sample?: boolean;
}

export interface MenuLink {
  to: string;
  label: string;
  marquee: string;
  chips: MenuChip[];
}

export const MENU = {
  links: [
    {
      to: "/",
      label: "Home",
      marquee: "Back to the start",
      chips: [{ label: "Aria · online" }],
    },
    {
      to: "/product",
      label: "Product",
      marquee: "Modules, safety, ROI",
      chips: [
        { label: STATUS_LABEL.live, status: "live" as Status },
        { label: STATUS_LABEL.building, status: "building" as Status },
        { label: STATUS_LABEL.planned, status: "planned" as Status },
      ],
    },
    {
      to: "/live",
      label: "Live wall",
      marquee: "Watch bookings land",
      chips: [
        { label: "Sample", sample: true },
        { label: "Token #14 ✓" },
        { label: "Dr. Rao 3:30 PM" },
      ],
    },
    {
      to: "/black",
      label: "Aprish Black",
      marquee: "A trust-mark, coming",
      chips: [{ label: STATUS_LABEL.planned, status: "planned" as Status }],
    },
    {
      to: "/join",
      label: "Join the beta",
      marquee: "Claim a pilot spot",
      chips: [{ label: "WhatsApp" }],
    },
  ] as MenuLink[],
  separatorLabel: "star",
};

export interface FooterLink {
  label: string;
  /** Internal routes only. External links are rendered from config.waLink(). */
  to: string;
}

export const FOOTER = {
  wordmark: "aprish",
  whatsappLabel: "Chat with Aria on WhatsApp",
  copyrightName: "Aprish",
  groups: [
    {
      title: "Product",
      links: [
        { label: "Product", to: "/product" },
        { label: "Live wall", to: "/live" },
        { label: "Aprish Black", to: "/black" },
      ] as FooterLink[],
    },
    {
      title: "Company",
      links: [{ label: "Join the beta", to: "/join" }] as FooterLink[],
    },
    {
      title: "Legal",
      links: [{ label: "Privacy", to: "/privacy" }] as FooterLink[],
    },
  ],
};

/* ------------------------------------------------------------------
   /join (docs/02 §join)
   The H2 and the form are reused verbatim from the Home beta CTA (BETA). This block adds
   only the two strings docs/02 fixes: the QR caption and the team heading. The people's
   names come from SITE (config.ts); only the role labels live here, because docs/02 says
   "names and roles only; no photos or bios until supplied".
------------------------------------------------------------------ */

export const JOIN = {
  /** docs/02 §join: caption under the WhatsApp QR. */
  qrCaption: "Or scan to chat with Aria",
  /** docs/02 §join: heading over the two names. */
  teamHeading: "Who is behind Aprish",
  roles: { founder: "Founder", spokesperson: "Spokesperson" },
};

/* ------------------------------------------------------------------
   /privacy (docs/02 §privacy)
   A short plain-language notice, deliberately a STUB: it needs legal review (DPDP Act)
   before launch, so nothing here promises a retention period or a legal basis. The two
   "to be confirmed" lines are placeholders the founder fills from config (contact email).
------------------------------------------------------------------ */

export const PRIVACY_NOTICE = {
  h1: "Privacy",
  intro: "A short, plain-language notice for the Aprish website and the beta sign-up form.",
  items: [
    {
      label: "What we collect",
      body: "The beta form asks for your name, your clinic's name, your city, the number of doctors, and a WhatsApp number or email. Nothing else.",
    },
    {
      label: "Why we collect it",
      body: "Only to contact you about the beta and set up a pilot. It is not used for anything else.",
    },
    {
      label: "How long we keep it",
      body: "A retention period will be published here before launch.",
    },
  ],
  contact: {
    label: "Contact",
    /** Shown with SITE.contactEmail when it is set, or replaced by contactFallback when it is not. */
    body: "For anything to do with your details, write to us.",
  },
  contactFallback: "Contact details will be published here before launch.",
  /** Rendered next to the code comment that flags the legal review. */
  reviewNote: "This notice is a placeholder. It needs legal review before launch.",
};

/* ------------------------------------------------------------------
   The 404 route (docs/02 §"Routes"). Reached by the catch-all `*`. It keeps the site's
   voice: say what happened, then offer the way home.
------------------------------------------------------------------ */

export const NOT_FOUND = {
  h1: "Page not found",
  body: "That page does not exist, or it has moved. The link below still works.",
  home: "Back to home",
};
