/**
 * All marketing copy. Components import from here so copy can be edited in one place.
 * RULE: every sentence must be true today. Feature claims are tied to a FeatureKey so the
 * status chip can never disagree with the text. See docs/03_CONTENT_AND_CLAIMS.md.
 */
import type { FeatureKey } from "./status";

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

/* ---------- Phone demo scripts (simulated, NOT the live model) ---------- */
export type ChatMsg = { from: "aria" | "user"; text: string; kind?: "text" | "confirmation" };
export interface ChatOption { label: string; replies: ChatMsg[] }
export interface ChatScript {
  id: string; tab: string; intro: ChatMsg[]; options: ChatOption[]; keywords: Array<{ match: RegExp; option: number }>;
}

export const CHAT_DEMO = {
  note: "Interactive demo. Replies are scripted; the real Aria is on WhatsApp.",
  fallback: "That is beyond this demo. Message the real Aria on WhatsApp to try anything.",
  scripts: [
    {
      id: "book", tab: "Book a visit",
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
