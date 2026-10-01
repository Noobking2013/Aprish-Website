/**
 * Phase 5c: the beta form's logic — and the one rule that matters, never fake success.
 *
 * The component (src/features/beta/BetaForm.tsx) is a thin shell; every decision lives here so
 * scripts/beta.check.ts can drive each branch with a mocked fetch. There are four outcomes and
 * only one is success:
 *
 *   ok       the endpoint returned a 2xx. This is the ONLY path that may show BETA.success.
 *   error    a non-2xx response, or the request threw (offline, DNS, timeout).
 *   whatsapp no endpoint is configured, so the visitor is handed to WhatsApp with their own
 *            details prefilled — never a confirmation we did not earn.
 *   bot      the honeypot was filled. Dropped silently: no request is sent and nothing that
 *            looks like success is ever rendered (docs/09 D16).
 *
 * `fetch` and `waLink` are injected so this module needs no DOM and never reads import.meta.env,
 * which is what keeps it runnable outside Vite (jiti) with no environment.
 */
import { BETA } from "../content/copy";

/** The five text fields, in the order docs/03 lists them. */
export type BetaField = "name" | "clinic" | "city" | "doctors" | "contact";

export interface BetaValues {
  name: string;
  clinic: string;
  city: string;
  doctors: string;
  contact: string;
  consent: boolean;
  /** Honeypot: off-screen and empty for a person, autofilled by naive bots. */
  companyWebsite: string;
}

export type BetaErrors = Partial<Record<BetaField | "consent", string>>;

export type BetaSubmitResult =
  | { status: "ok" }
  | { status: "error" }
  | { status: "bot" }
  | { status: "whatsapp"; url: string };

/** The subset of fetch this module uses, so a check can hand in a plain async stub. */
export type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number }>;

export interface BetaSubmitOptions {
  /** Empty string means "not configured", which is the WhatsApp fallback. */
  endpoint: string;
  fetch: FetchLike;
  /** Injected so this module never reads import.meta.env. */
  waLink: (text: string) => string;
}

/** Field order. BETA.fields is indexed by position here, so the two must stay in step. */
export const BETA_FIELDS: readonly BetaField[] = ["name", "clinic", "city", "doctors", "contact"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A phone-ish string: digits, spaces, dashes, brackets and an optional leading +. We do not
 * pretend to know a number's country; we only reject what cannot plausibly be one, and accept
 * anything that is clearly an email instead.
 */
function looksLikePhone(value: string): boolean {
  if (value.includes("@")) return false;
  if (!/^\+?[\d\s()-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/** Everything the visitor must fix. An empty object means the form is sendable. */
export function validateBeta(values: BetaValues): BetaErrors {
  const errors: BetaErrors = {};

  if (!values.name.trim()) errors.name = BETA.required;
  if (!values.clinic.trim()) errors.clinic = BETA.required;
  if (!values.city.trim()) errors.city = BETA.required;

  const doctors = values.doctors.trim();
  if (!doctors) errors.doctors = BETA.required;
  else if (!/^\d+$/.test(doctors) || Number(doctors) < 1) errors.doctors = BETA.doctorsInvalid;

  const contact = values.contact.trim();
  if (!contact) errors.contact = BETA.required;
  else if (!EMAIL.test(contact) && !looksLikePhone(contact)) errors.contact = BETA.contactInvalid;

  if (!values.consent) errors.consent = BETA.consentRequired;

  return errors;
}

export const hasErrors = (errors: BetaErrors): boolean => Object.keys(errors).length > 0;

/** What a visitor sees when we hand them to WhatsApp, with their own answers prefilled. */
export function buildMessage(values: BetaValues): string {
  const [labelName, labelClinic, labelCity, labelDoctors, labelContact] = BETA.fields;
  return [
    BETA.waIntro,
    `${labelName}: ${values.name.trim()}`,
    `${labelClinic}: ${values.clinic.trim()}`,
    `${labelCity}: ${values.city.trim()}`,
    `${labelDoctors}: ${values.doctors.trim()}`,
    `${labelContact}: ${values.contact.trim()}`,
  ].join("\n");
}

/** The JSON body posted to the endpoint. The honeypot never leaves the browser. */
export function buildPayload(values: BetaValues): Record<string, string | number | boolean> {
  return {
    name: values.name.trim(),
    clinic: values.clinic.trim(),
    city: values.city.trim(),
    doctors: Number(values.doctors.trim()),
    contact: values.contact.trim(),
    consent: values.consent,
  };
}

/**
 * The whole decision, in one place. The caller maps the result onto the UI; nothing here
 * touches the DOM, so the check can exercise every branch without a browser.
 */
export async function submitBeta(
  values: BetaValues,
  options: BetaSubmitOptions,
): Promise<BetaSubmitResult> {
  // Honeypot first. A person never sees this field, so a value in it is a bot: send nothing and
  // claim nothing (docs/09 D16). This is deliberately not a "pretend success".
  if (values.companyWebsite.trim()) return { status: "bot" };

  // No endpoint configured: hand over to WhatsApp rather than invent a confirmation.
  if (!options.endpoint) return { status: "whatsapp", url: options.waLink(buildMessage(values)) };

  try {
    const response = await options.fetch(options.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPayload(values)),
    });
    // Success is a real 2xx — never a swallowed error and never an "accepted" guess.
    return response.ok ? { status: "ok" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
