/**
 * Site-wide configuration. Anything a founder may need to change lives here or in .env.
 * Vite exposes only variables prefixed VITE_.
 */
const env = import.meta.env;

/**
 * WhatsApp number for Aria. Decoded from the QR code in the pitch deck:
 *   https://wa.me/85254943646?text=Hello%21+I+am+interested+in+learning+more+about+your+business.
 * NOTE: 852 is Hong Kong. FOUNDER: confirm this is the intended live number for Indian clinics.
 * Digits only, country code first, no "+".
 */
export const WHATSAPP_NUMBER: string = env.VITE_WHATSAPP_NUMBER ?? "85254943646";
export const WHATSAPP_PREFILL: string =
  env.VITE_WHATSAPP_PREFILL ?? "Hi Aria, I would like to see how Aprish works for my clinic.";

export const waLink = (text: string = WHATSAPP_PREFILL) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/** Where the beta form posts (Formspree / Web3Forms / Google Apps Script URL). Empty = form falls back to WhatsApp. */
export const FORM_ENDPOINT: string = env.VITE_FORM_ENDPOINT ?? "";

export const SITE = {
  name: "Aprish",
  url: env.VITE_SITE_URL ?? "https://aprish.example",   // FOUNDER: set real domain
  founder: "Prithvi Singh",
  spokesperson: "Grishika Vashisht",
  betaSlots: 20,          // FOUNDER: confirm "first 20 clinics" (from the old site brief; not in the deck)
  showPricing: false,     // FOUNDER: deck tiers are marked "confirm they are current". Keep false until confirmed.
  contactEmail: "",       // FOUNDER: fill
  showIndicativePricing: true, // Home pricing section with placeholder prices, chip-labelled "Indicative".
} as const;
