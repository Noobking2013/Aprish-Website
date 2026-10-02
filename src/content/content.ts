import { HERO } from "./copy";
import type { FeatureKey } from "./status";

/**
 * Copy for the v2 Home sections, keyed by locale. English is complete; Hindi covers the hero
 * and every CTA, and falls back to English section by section (getContent below).
 *
 * Statuses are never written here as labels: sections pass a FeatureKey or a Status to
 * <StatusChip>, which reads src/content/status.ts (scripts/qa.check.ts enforces this).
 * Everything marked "Sample", "Indicative" or "Placeholder" must be replaced before launch
 * (see docs/10_HOME_V2.md).
 */

export type Locale = "en" | "hi";

export const LOCALES: ReadonlyArray<{ id: Locale; short: string; name: string; htmlLang: string }> = [
  { id: "en", short: "EN", name: "English", htmlLang: "en-IN" },
  { id: "hi", short: "हि", name: "हिन्दी", htmlLang: "hi-IN" },
];

export type ClinicId = "general" | "dental" | "derm" | "paeds" | "fertility" | "ortho";

export interface ClinicType {
  id: ClinicId;
  label: string;
  /** The hero's sample WhatsApp confirmation. Fictional doctor, labelled as a sample. */
  heroMessage: string;
  /** Typed into the Try Aria phone. Each carries a keyword the booking script understands. */
  demoPrompts: readonly string[];
  /** Example ROI inputs. `general` must equal ROI.defaults in copy.ts. */
  roi: { avgFee: number; noShowsPerDay: number };
}

export const CLINIC_TYPES: readonly ClinicType[] = [
  {
    id: "general",
    label: "General",
    heroMessage: "Token #14 confirmed. Dr. Mehta, today 4:15 PM. Please arrive 10 minutes early.",
    demoPrompts: ["Book a check-up for today", "Is 4:15 PM free?"],
    roi: { avgFee: 500, noShowsPerDay: 3 },
  },
  {
    id: "dental",
    label: "Dental",
    heroMessage: "Token #07 confirmed. Dr. Iyer (Dental), tomorrow 11:30 AM. Bring any old X-rays.",
    demoPrompts: ["Book a dental cleaning", "Can I come at 4:15?"],
    roi: { avgFee: 800, noShowsPerDay: 2 },
  },
  {
    id: "derm",
    label: "Dermatology",
    heroMessage: "Token #22 confirmed. Dr. Kapoor (Dermatology), today 5:00 PM.",
    demoPrompts: ["I have a skin rash", "Book the 4:15 PM slot"],
    roi: { avgFee: 700, noShowsPerDay: 3 },
  },
  {
    id: "paeds",
    label: "Paediatrics",
    heroMessage: "Token #09 confirmed. Dr. Rao (Paediatrics), today 10:15 AM. Bring the vaccination card.",
    demoPrompts: ["Appointment for my child", "Book for my kid today"],
    roi: { avgFee: 600, noShowsPerDay: 4 },
  },
  {
    id: "fertility",
    label: "Fertility",
    heroMessage: "Token #03 confirmed. Dr. Sen (Fertility), Friday 12:00 PM. First consultation.",
    demoPrompts: ["Book a first consultation", "Is 4:15 PM free today?"],
    roi: { avgFee: 1500, noShowsPerDay: 2 },
  },
  {
    id: "ortho",
    label: "Ortho",
    heroMessage: "Token #18 confirmed. Dr. Bhatia (Ortho), today 6:30 PM. Bring recent scans.",
    demoPrompts: ["Book a knee consultation", "Can I come at 4:15?"],
    roi: { avgFee: 900, noShowsPerDay: 2 },
  },
];

/** The Home anchors, in page order. Drives the scroll-spy pills and the quick search. */
export const HOME_ANCHORS = [
  { id: "capabilities", label: "Product" },
  { id: "flow", label: "How it works" },
  { id: "try-aria", label: "Try Aria" },
  { id: "setup", label: "Setup" },
  { id: "trust", label: "Trust" },
  { id: "roi", label: "ROI" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "beta", label: "Join" },
] as const;

const EN = {
  hero: {
    ...HERO,
    sampleLabel: HERO.floatingCard.label,
    clinicLabel: "Your clinic type",
    clinicHint: "Changes the sample message, the demo prompts and the ROI example.",
    languageLabel: "Language",
  },
  nav: {
    joinShort: "Join",
    search: "Search the site",
    language: "Language",
    progress: "Reading progress",
  },
  mobileBar: {
    label: "Quick actions",
    chat: "Chat with Aria",
    join: "Join the beta",
  },
  proof: {
    label: "Aria at a glance",
    sampleChip: "Sample data",
    stats: [
      { value: "3", unit: "no-shows avoided a day", source: "Illustrative" },
      { value: "24/7", unit: "booking window on WhatsApp", source: "Product" },
      { value: "0", unit: "apps for patients to install", source: "Product" },
      { value: "₹39,000", unit: "monthly value at a ₹500 fee", source: "ROI example" },
      { value: "1 day", unit: "target time to go live", source: "Target, set at pilot" },
      { value: "1", unit: "engine behind chat and dashboard", source: "Product" },
    ],
  },
  capabilities: {
    eyebrow: "What Aria does",
    h2: "Four jobs your front desk does all day.",
    intro: "Each card shows its real status. A sample animation sits beside it, so you can see the job, not just read about it.",
    sample: "Sample",
    items: [
      {
        n: "01",
        feature: "bookingViaWhatsApp" as FeatureKey,
        title: "Booking, 24/7",
        body: "Patients pick a doctor and a time inside WhatsApp. The booking engine locks the slot.",
        visual: "slots" as const,
      },
      {
        n: "02",
        feature: "queueCheckIn" as FeatureKey,
        title: "Live queue tokens",
        body: "Each patient gets a token and a message when their turn is close.",
        visual: "token" as const,
      },
      {
        n: "03",
        feature: "followUps" as FeatureKey,
        title: "Reminders and follow-ups",
        body: "A short nudge before the visit, and another when a follow-up is due.",
        visual: "bubble" as const,
      },
      {
        n: "04",
        feature: "digitalRx" as FeatureKey,
        title: "Records",
        body: "Prescriptions and visit history sit beside the day's schedule.",
        visual: "records" as const,
      },
    ],
    slots: { label: "Dr. Mehta · today", times: ["10:15", "11:30", "4:15", "5:00"] },
    token: { label: "Now serving", prefix: "Token #", next: "Next up" },
    bubble: "Reminder: your visit with Dr. Rao is tomorrow at 10:15 AM. Reply 1 to confirm or 2 to change.",
    records: ["Visit · 12 Mar", "Prescription saved", "Follow-up in 2 weeks"],
  },
  steps: {
    eyebrow: "Setup",
    h2: "Three steps to a working front desk.",
    items: [
      { numeral: "I", title: "Connect your WhatsApp number", body: "Use your clinic number or a new one. Patients message the number they already know." },
      { numeral: "II", title: "Set doctors and slots", body: "Add each doctor, their hours and slot length. The booking engine follows these rules." },
      { numeral: "III", title: "Go live in a day", body: "Put the QR standee at reception. One working day is the target; your pilot confirms it." },
    ],
    ticket: {
      label: "Appointment ticket",
      sample: "Sample",
      rows: [
        { k: "Patient", v: "Riya S." },
        { k: "Doctor", v: "Dr. Mehta · Dermatology" },
        { k: "When", v: "Today, 4:15 PM" },
        { k: "Token", v: "#14" },
        { k: "Booked via", v: "WhatsApp" },
        { k: "Status", v: "Confirmed" },
      ],
      footer: "Slot locked by the booking engine. Audit log written.",
      paused: "Paused",
    },
  },
  metrics: {
    eyebrow: "One sample day",
    h2: "What a busy day looks like with Aria.",
    feed: "Demo feed",
    sampleChip: "Sample data",
    clock: "IST",
    caption: "Illustrative figures for one fictional clinic. Not customer data.",
    items: [
      { value: 64, suffix: "", label: "Bookings handled in chat" },
      { value: 38, suffix: "%", label: "Booked outside clinic hours" },
      { value: 41, suffix: "", label: "Front-desk calls avoided" },
      { value: 3, suffix: "", label: "No-shows avoided" },
    ],
  },
  integrations: {
    eyebrow: "Works with",
    h2: "Built around tools clinics already use.",
    intro: "Each one shows its status. We mark it live only once it is.",
  },
  trust: {
    eyebrow: "Trust",
    h2: "What we are confirming, in the open.",
    intro: "Every item shows where it stands today. Certifications appear here only once they are confirmed.",
    items: [
      { privacy: 0, icon: "consent" as const, body: "Patients agree to the terms in the first chat, before anything is booked." },
      { privacy: 1, icon: "shield" as const, body: "Names and numbers are stripped before any text is sent to the AI model." },
      { privacy: 2, icon: "server" as const, body: "Clinic and patient data stored on servers located in India." },
      { privacy: 3, icon: "link" as const, body: "Alignment with India's digital health records standards." },
    ],
    audit: {
      feature: "bookingEngine" as FeatureKey,
      label: "Audit log on every booking",
      body: "Every decision the booking engine makes is written to an audit log.",
    },
  },
  pricing: {
    eyebrow: "Pricing",
    h2: "Plans that start small.",
    intro: "Placeholder prices for the beta. Pilot terms are agreed with each clinic.",
    chip: "Indicative",
    billingLabel: "Billing period",
    monthly: "Monthly",
    annual: "Annual",
    annualDiscount: 0.15,
    saveTag: "Save 15%",
    perMonth: "/ month",
    billedAnnually: "billed annually",
    billedMonthly: "billed monthly",
    priceTbc: "Price to be set",
    breakEven: "See break-even for this plan",
    join: "Join the beta",
    suggested: "Suggested",
    plans: [
      {
        id: "pilot",
        name: "Pilot",
        monthly: 2000 as number | null,
        blurb: "One doctor, one location. For trying Aria at the desk.",
        features: ["ariaWhatsApp", "bookingViaWhatsApp", "bookingEngine"] as FeatureKey[],
        black: false,
        suggested: false,
      },
      {
        id: "clinic",
        name: "Clinic",
        monthly: 3000 as number | null,
        blurb: "Several doctors, one front desk. The full booking day.",
        features: ["bookingViaWhatsApp", "queueCheckIn", "webDashboard", "delayAlerts"] as FeatureKey[],
        black: false,
        suggested: true,
      },
      {
        id: "black",
        name: "Aprish Black",
        monthly: null as number | null,
        blurb: "For verified clinics that want the premium tier.",
        features: ["blackVerification", "brandPartnerRouting", "webDashboard"] as FeatureKey[],
        black: true,
        suggested: false,
      },
    ],
  },
  voices: {
    eyebrow: "Pilot voices",
    h2: "What pilot clinics say.",
    intro: "Real quotes appear here once pilot clinics agree to share them.",
    chip: "Placeholder",
    label: "Pilot clinic quotes",
    prev: "Previous quote",
    next: "Next quote",
    resultLabel: "Key result",
    slideOf: (index: number, total: number) => `Quote ${index} of ${total}`,
    slides: [
      { quote: "Pilot clinic quote coming soon.", who: "General practice · city to be added", result: "To be measured during the pilot" },
      { quote: "Pilot clinic quote coming soon.", who: "Dental clinic · city to be added", result: "To be measured during the pilot" },
      { quote: "Pilot clinic quote coming soon.", who: "Paediatrics · city to be added", result: "To be measured during the pilot" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    h2: "Questions clinics ask first.",
    copyLink: "Copy link to this answer",
    items: [
      {
        id: "faq-privacy",
        q: "What happens to patient data?",
        a: "Aria uses a patient's messages only to manage that clinic's appointments. The AI reads what the patient wants; the booking engine makes every decision. Consent, identifier removal, India-region hosting and ABDM alignment are listed with their current status in the Trust section.",
        feature: null as FeatureKey | null,
      },
      {
        id: "faq-no-app",
        q: "Do patients need to install anything?",
        a: "No. Patients use WhatsApp, which they already have. No download, no account, no password.",
        feature: "ariaWhatsApp" as FeatureKey | null,
      },
      {
        id: "faq-languages",
        q: "Which languages does Aria speak?",
        a: "The language list is still being confirmed. Tell us which languages your patients use and we will tell you plainly what works today.",
        feature: null as FeatureKey | null,
      },
      {
        id: "faq-setup",
        q: "How long does setup take?",
        a: "The target is one working day: connect the number, add doctors and slots, put the QR at reception. Your pilot confirms the real time for your clinic.",
        feature: null as FeatureKey | null,
      },
      {
        id: "faq-whatsapp-down",
        q: "What if WhatsApp is down?",
        a: "Your desk keeps working as it does today, by phone and walk-in. Bookings already made stay in the system. An SMS fallback is on the list and shown as to be confirmed.",
        feature: null as FeatureKey | null,
      },
      {
        id: "faq-pricing",
        q: "How much does it cost?",
        a: "The prices on this page are indicative. Pilot terms are agreed with each clinic before anything starts.",
        feature: null as FeatureKey | null,
      },
      {
        id: "faq-leave",
        q: "What if a doctor is on leave?",
        a: "You mark the doctor away and the booking engine stops offering those slots. Patients already booked are told and offered another time.",
        feature: "bookingEngine" as FeatureKey | null,
      },
      {
        id: "faq-reschedule",
        q: "How do patients reschedule?",
        a: "They ask Aria in the same chat. Aria offers open slots, the booking engine moves the booking and frees the old slot for someone else.",
        feature: "bookingViaWhatsApp" as FeatureKey | null,
      },
    ],
  },
  search: {
    open: "Search",
    title: "Jump to",
    placeholder: "Search sections, questions and pages",
    empty: "Nothing matches. Try another word.",
    close: "Close search",
    hint: "Press / to search",
    groups: { sections: "Sections", faq: "Questions", pages: "Pages" },
    pages: [
      { to: "/", label: "Home" },
      { to: "/product", label: "Product" },
      { to: "/live", label: "Live wall" },
      { to: "/black", label: "Aprish Black" },
      { to: "/join", label: "Join the beta" },
      { to: "/privacy", label: "Privacy" },
    ],
  },
  spy: { label: "On this page" },
  demo: { promptsLabel: "Try a prompt for" },
  roiNote: { prefix: "Plan price set from", suffix: "(indicative)." },
  footer: {
    status: "Aria is online",
    statusNote: "WhatsApp assistant",
  },
  betaNext: {
    heading: "What happens next",
    steps: [
      { title: "We read your details", body: "A person on the team reads every request. No bots." },
      { title: "We message you", body: "On WhatsApp or email, to plan a short call at a time that suits the clinic." },
      { title: "We set up your pilot", body: "Your doctors, your slots, your number. Then Aria starts booking." },
    ],
    shareHeading: "Know another clinic that should see this?",
    copy: "Copy WhatsApp link",
    copied: "Link copied",
    share: "Share on WhatsApp",
    shareText: "Have a look at Aria, a WhatsApp booking assistant for clinics:",
  },
};

export type Content = typeof EN;

type Overrides = { [K in keyof Content]?: Partial<Content[K]> };

const HI: Overrides = {
  hero: {
    tagline: "कोई ऐप डाउनलोड नहीं  ·  24/7 WhatsApp बुकिंग  ·  भारतीय क्लिनिकों के लिए",
    h1: "ज़्यादा मरीज़ों वाले क्लिनिक के लिए ऑटोमेटेड फ्रंट डेस्क।",
    h1Emphasis: "फ्रंट डेस्क",
    sub: "Aprish स्वतंत्र क्लिनिकों के लिए ऑपरेटिंग और ग्रोथ OS है। शुरुआत वहीं से जहाँ सबसे ज़्यादा परेशानी है: WhatsApp पर अपॉइंटमेंट, आज से लाइव, मरीज़ों को कुछ इंस्टॉल नहीं करना पड़ता।",
    ctaPrimary: "WhatsApp पर Aria से बात करें",
    ctaSecondary: "बीटा से जुड़ें",
    micro: "भारतीय क्लिनिक जैसे सच में चलते हैं, उसी के लिए बना।",
    sampleLabel: "नमूना संदेश",
    aliveBadge: "Aria 24/7 ऑनलाइन है",
    clinicLabel: "आपके क्लिनिक का प्रकार",
    clinicHint: "नमूना संदेश, डेमो प्रॉम्प्ट और ROI उदाहरण बदल जाते हैं।",
    languageLabel: "भाषा",
  },
  nav: { joinShort: "जुड़ें", search: "साइट में खोजें", language: "भाषा" },
  mobileBar: { label: "जल्दी के काम", chat: "Aria से बात करें", join: "बीटा से जुड़ें" },
};

const DICTIONARY: Record<Locale, Overrides> = { en: {}, hi: HI };

/** English, with each section shallow-merged with the locale's overrides. */
export function getContent(locale: Locale): Content {
  const overrides = DICTIONARY[locale];
  const merged = { ...EN } as Record<string, unknown>;
  for (const key of Object.keys(overrides) as Array<keyof Content>) {
    merged[key] = { ...EN[key], ...overrides[key] };
  }
  return merged as Content;
}

export const CONTENT_EN = EN;
