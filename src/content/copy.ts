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

export const FLOW = {
  h2: "Every visit, handled inside the chat.",
  intro: "From the first message to the follow-up, patients stay in an app they already use.",
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
  formulas: {
    monthlyValue: "Monthly value = no-shows avoided per day × working days × average consultation fee",
    breakEven: "Break-even visits = plan price ÷ average fee",
  },
  disclaimer: "Example numbers. Your clinic\u2019s figures will differ.",
};

export const MODULES = {
  h2: "Start with one module. Add more as the clinic grows.",
  core: ["bookingViaWhatsApp", "billingEmr", "stockTracking"] as FeatureKey[],
  augmented: ["ariaWhatsApp", "blackVerification", "brandPartnerRouting"] as FeatureKey[],
  inDev: ["webDashboard"] as FeatureKey[],
};

export const BLACK = {
  h2: "A trust-mark that clinics earn and patients can check.",
  sub: "A verified tier for clinics, in the spirit of food-safety or premium real-estate certifications.",
  status: "planned" as const,
  tagline: "Headache-free, friendly.",
  criteriaNote: "Criteria, who verifies and how often will be published before launch.",
};

export const BETA = {
  h2: "Modernise your front desk.",
  tagline: "Limited beta",
  body: "We are onboarding a small first group of clinics. Tell us about yours and we will set up a pilot.",
  fields: ["Your name", "Clinic name", "City", "Number of doctors", "WhatsApp number or email"],
  consent: "I agree that Aprish may contact me about the beta. My details are used only for this purpose.",
  success: "Thanks. We have your details and will be in touch.",
  fallbackNote: "Prefer to talk now? Message Aria on WhatsApp.",
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
