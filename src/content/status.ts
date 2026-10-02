/**
 * SINGLE SOURCE OF TRUTH for what is live vs not. Every feature chip on the site
 * reads from here. Never hard-code "Live" in a component.
 *
 * Source: Aprish_Pitch_Deck.pptx slides 5, 6, 8, 12 and Aprish_QA_and_open_items.md Q10.
 * The Seva First PDF says queue/check-in, delay broadcast, digital prescriptions and
 * role-based access already exist in the backend, but the deck lists their status as
 * [FILL]. Until the founder confirms, they default to "building" (the honest, safe choice).
 */
export type Status = "live" | "building" | "planned";

export const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  building: "In development",
  planned: "Planned",
};

/**
 * The honest state for anything the founder has not confirmed yet (docs/02 §5 draws it as a
 * grey chip). It is deliberately NOT a `Status`: a chip is allowed to say "we do not know
 * yet", but a feature is not — everything in FEATURES must resolve to a real status.
 */
export const TBC_STATUS = "tbc" as const;
export const TBC_LABEL = "To be confirmed";

export type ChipStatus = Status | typeof TBC_STATUS;

/**
 * Every chip on the site goes through here, so no component ever hard-codes a label.
 * `null` (the PRIVACY default) is the only way to get the "to be confirmed" chip.
 */
export function chipFor(status: Status | null): { status: ChipStatus; label: string } {
  return status === null
    ? { status: TBC_STATUS, label: TBC_LABEL }
    : { status, label: STATUS_LABEL[status] };
}

export const FEATURES = {
  ariaWhatsApp:        { name: "Aria on WhatsApp",                       status: "live" as Status,     confirmed: true },
  bookingViaWhatsApp:  { name: "Appointments & scheduling via WhatsApp", status: "live" as Status,     confirmed: true },
  bookingEngine:       { name: "Deterministic booking engine",           status: "live" as Status,     confirmed: true },
  webDashboard:        { name: "Role-based web dashboard",               status: "building" as Status, confirmed: true },
  queueCheckIn:        { name: "Live queue & check-in",                  status: "building" as Status, confirmed: false }, // FOUNDER: confirm
  delayAlerts:         { name: "Doctor-delay alerts",                    status: "building" as Status, confirmed: false }, // FOUNDER: confirm
  digitalRx:           { name: "Digital prescriptions",                  status: "building" as Status, confirmed: false }, // FOUNDER: confirm
  billingEmr:          { name: "Billing & EMR-lite",                     status: "building" as Status, confirmed: false }, // FOUNDER: confirm
  stockTracking:       { name: "Stock tracking",                         status: "planned" as Status,  confirmed: false }, // FOUNDER: confirm
  followUps:           { name: "Follow-up nudges",                       status: "planned" as Status,  confirmed: false }, // not in deck/PDF
  blackVerification:   { name: "Aprish Black verification",              status: "planned" as Status,  confirmed: true },
  brandPartnerRouting: { name: "Brand Partner Routing",                  status: "planned" as Status,  confirmed: true },
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Integrations marquee. `null` renders the To-be-confirmed chip through chipFor.
 * FOUNDER: set a status only once it is real. A payments provider is deliberately absent:
 * no source confirms one, and scripts/qa.check.ts forbids those claims site-wide.
 */
export const INTEGRATIONS = [
  { id: "whatsapp", name: "WhatsApp Business", monogram: "WA", status: "live" as Status | null },
  { id: "gemini",   name: "Gemini (intent only)", monogram: "Ge", status: "live" as Status | null },
  { id: "gcal",     name: "Google Calendar",   monogram: "GC", status: null as Status | null },
  { id: "abdm",     name: "ABDM / ABHA",       monogram: "AB", status: null as Status | null },
  { id: "sms",      name: "SMS fallback",      monogram: "SM", status: null as Status | null },
  { id: "sheets",   name: "Google Sheets",     monogram: "GS", status: null as Status | null },
];

export const PRIVACY = [
  // Deck slide 6 strip: all four are [FILL: status]. Render as "To be confirmed" until set.
  { label: "Consent in the first chat",                    status: null as Status | null },
  { label: "Identifiers removed before text reaches the AI", status: null as Status | null },
  { label: "India-region hosting",                         status: null as Status | null },
  { label: "ABDM / ABHA alignment",                        status: null as Status | null },
];
