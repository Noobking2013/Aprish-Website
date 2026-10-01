import { useCallback, useId, useState, type FormEvent } from "react";
import { BETA } from "@/content/copy";
import { FORM_ENDPOINT, waLink } from "@/content/config";
import {
  BETA_FIELDS,
  buildMessage,
  hasErrors,
  submitBeta,
  validateBeta,
  type BetaErrors,
  type BetaField,
  type BetaValues,
} from "@/lib/beta";

/**
 * The working beta form (docs/03 "Beta form behaviour", docs/09 D16). Reused by the Home beta
 * CTA (section 8) and, in Phase 6, by /join.
 *
 * The single promise: it never fakes success. A "thanks" is shown only after the endpoint
 * answers 2xx (src/lib/beta.ts decides that); with no endpoint it opens WhatsApp prefilled; on
 * any failure it says so and offers WhatsApp. A filled honeypot is dropped in silence — no
 * request, no confirmation.
 *
 * Accessibility: labels are tied by id, each error is announced through `aria-describedby`, and
 * the result is a `role="status"`/`role="alert"` region. Errors appear after a field is left, or
 * after the first submit attempt, so a field is never scolded mid-typing.
 */

type BetaStatus = "idle" | "sending" | "ok" | "error" | "whatsapp";

/** One text input per field. `inputMode` gives phones the right keypad, without type=number. */
const INPUTS: ReadonlyArray<{
  key: BetaField;
  autoComplete: string;
  inputMode?: "numeric" | "text" | "email";
  wide?: boolean;
}> = [
  { key: "name", autoComplete: "name" },
  { key: "clinic", autoComplete: "organization" },
  { key: "city", autoComplete: "address-level2" },
  { key: "doctors", autoComplete: "off", inputMode: "numeric" },
  { key: "contact", autoComplete: "off", inputMode: "text", wide: true },
];

const EMPTY: BetaValues = {
  name: "",
  clinic: "",
  city: "",
  doctors: "",
  contact: "",
  consent: false,
  companyWebsite: "",
};

const UNTOUCHED: Record<BetaField | "consent", boolean> = {
  name: false,
  clinic: false,
  city: false,
  doctors: false,
  contact: false,
  consent: false,
};

/** The field label, borrowed from copy by position (BETA_FIELDS mirrors BETA.fields). */
const fieldLabel = (key: BetaField): string => BETA.fields[BETA_FIELDS.indexOf(key)];

export function BetaForm() {
  const uid = useId();
  const [values, setValues] = useState<BetaValues>(EMPTY);
  const [touched, setTouched] = useState<Record<BetaField | "consent", boolean>>(UNTOUCHED);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<BetaStatus>("idle");

  const errors: BetaErrors = validateBeta(values);
  /* A field shows its error once it has been left, or once submit has been pressed. */
  const visible = (key: BetaField | "consent"): string | undefined =>
    touched[key] || attempted ? errors[key] : undefined;

  const blur = useCallback((key: BetaField | "consent") => {
    setTouched((previous) => (previous[key] ? previous : { ...previous, [key]: true }));
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAttempted(true);
      if (hasErrors(errors)) return;

      setStatus("sending");
      const result = await submitBeta(values, { endpoint: FORM_ENDPOINT, fetch, waLink });

      if (result.status === "ok") {
        setStatus("ok");
      } else if (result.status === "error") {
        setStatus("error");
      } else if (result.status === "whatsapp") {
        // Open WhatsApp in a new tab; the link below stays for a blocked popup.
        window.open(result.url, "_blank", "noopener,noreferrer");
        setStatus("whatsapp");
      } else {
        // result.status === "bot": dropped silently. Nothing resembling success is rendered.
        setStatus("idle");
      }
    },
    [errors, values],
  );

  /* ------------------------------ success (2xx only) ------------------------------ */

  if (status === "ok") {
    return (
      <div className="rounded-3xl border border-teal-900/10 bg-cream-50 p-6 sm:p-7">
        <p role="status" className="text-base text-teal-900">
          {BETA.success}
        </p>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center rounded-full bg-peach-400 px-5 py-2.5 text-sm font-semibold text-teal-950 transition-colors hover:bg-peach-300"
        >
          {BETA.whatsappButton}
        </a>
      </div>
    );
  }

  const handOver = status === "error" || status === "whatsapp";
  const whatsappHref = handOver ? waLink(buildMessage(values)) : waLink();

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={status === "sending"}
      className="rounded-3xl border border-teal-900/10 bg-cream-50 p-6 sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {INPUTS.map((input) => {
          const error = visible(input.key);
          const inputId = `${uid}-${input.key}`;
          const errorId = `${inputId}-error`;

          return (
            <div key={input.key} className={input.wide ? "sm:col-span-2" : undefined}>
              <label htmlFor={inputId} className="text-sm font-semibold text-teal-900">
                {fieldLabel(input.key)}
              </label>
              <input
                id={inputId}
                name={input.key}
                type="text"
                inputMode={input.inputMode}
                autoComplete={input.autoComplete}
                value={values[input.key]}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, [input.key]: event.target.value }))
                }
                onBlur={() => blur(input.key)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`mt-2 w-full rounded-xl border bg-cream-100 px-3 py-2.5 text-teal-900 outline-none transition-colors focus:border-teal-900 ${
                  error ? "border-coral-600" : "border-teal-900/15"
                }`}
              />
              {error ? (
                <p id={errorId} className="mt-1 text-xs text-coral-700">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Honeypot: off-screen, out of the tab order and hidden from assistive tech. A person
          never fills it; a naive bot does, and submitBeta then drops the submission silently. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company-website`}>{BETA.honeypotLabel}</label>
        <input
          id={`${uid}-company-website`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.companyWebsite}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, companyWebsite: event.target.value }))
          }
        />
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm text-teal-800">
          <input
            type="checkbox"
            required
            checked={values.consent}
            onChange={(event) =>
              setValues((previous) => ({ ...previous, consent: event.target.checked }))
            }
            onBlur={() => blur("consent")}
            aria-invalid={visible("consent") ? true : undefined}
            aria-describedby={visible("consent") ? `${uid}-consent-error` : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-teal-900"
          />
          <span>{BETA.consent}</span>
        </label>
        {visible("consent") ? (
          <p id={`${uid}-consent-error`} className="mt-1 text-xs text-coral-700">
            {visible("consent")}
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-5 text-sm font-medium text-coral-700">
          {BETA.error}
        </p>
      ) : null}
      {status === "whatsapp" ? (
        <p role="status" className="mt-5 text-sm text-teal-800">
          {BETA.fallbackNote}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-full bg-teal-900 px-6 py-3 text-sm font-semibold text-cream-100 transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? BETA.sending : BETA.submit}
        </button>
        {handOver ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-teal-900 underline underline-offset-4 transition-colors hover:text-teal-800"
          >
            {BETA.whatsappButton}
          </a>
        ) : null}
      </div>
    </form>
  );
}
