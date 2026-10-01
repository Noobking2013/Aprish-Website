/**
 * Phase 5c check: the beta form's logic (src/lib/beta.ts), driven with a MOCKED fetch.
 *
 * Run it with:
 *   jiti scripts/beta.check.ts
 *
 * No JSX and no "@/..." imports — like scripts/roi.check.ts, so jiti needs neither of its env
 * vars here. The whole point is the rule docs/03 states and docs/09 D16 records: the form NEVER
 * fakes success. So the central assertions are:
 *   - success is returned ONLY for a real 2xx;
 *   - a non-2xx response and a thrown request are both errors, never success;
 *   - with no endpoint the result is the WhatsApp hand-over, and no request is sent;
 *   - a filled honeypot sends nothing and never reports success.
 * Everything is asserted against src/content/copy.ts, never against a literal typed here.
 */

import { BETA } from "../src/content/copy";
import {
  BETA_FIELDS,
  buildMessage,
  buildPayload,
  hasErrors,
  submitBeta,
  validateBeta,
  type BetaValues,
  type FetchLike,
} from "../src/lib/beta";

let fails = 0;
const ok = (condition: boolean, message: string) => {
  if (!condition) {
    fails += 1;
    console.log("FAIL:", message);
  }
};
const eq = (actual: unknown, expected: unknown, message: string) =>
  ok(actual === expected, `${message} — expected ${String(expected)}, got ${String(actual)}`);

/** A fetch stub that records its calls and returns (or throws) whatever the test wants. */
const makeFetch = (outcome: { ok: boolean; status: number } | Error) => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fn: FetchLike = async (url, init) => {
    calls.push({ url, init });
    if (outcome instanceof Error) throw outcome;
    return outcome;
  };
  return { fn, calls };
};

/** The WhatsApp builder is injected, so this module never reads import.meta.env. */
const waLink = (text: string) => `https://wa.test/85200000?text=${encodeURIComponent(text)}`;

const VALID: BetaValues = {
  name: "Prithvi",
  clinic: "Sunrise Clinic",
  city: "Pune",
  doctors: "3",
  contact: "+91 98765 43210",
  consent: true,
  companyWebsite: "",
};

/* ------------------------------- 1. validation ------------------------------- */

const empty = validateBeta({
  name: "",
  clinic: "",
  city: "",
  doctors: "",
  contact: "",
  consent: false,
  companyWebsite: "",
});
eq(Object.keys(empty).length, 6, "an empty form must flag every field plus consent");
eq(empty.name, BETA.required, "an empty name shows the required message");
eq(empty.clinic, BETA.required, "an empty clinic shows the required message");
eq(empty.city, BETA.required, "an empty city shows the required message");
eq(empty.doctors, BETA.required, "an empty doctors count shows the required message");
eq(empty.contact, BETA.required, "an empty contact shows the required message");
eq(empty.consent, BETA.consentRequired, "unticked consent shows the consent message");

ok(!hasErrors(validateBeta(VALID)), "a fully valid form has no errors");
ok(hasErrors(empty), "hasErrors is true when anything is flagged");

eq(validateBeta({ ...VALID, doctors: "three" }).doctors, BETA.doctorsInvalid, "\"three\" is not a count");
eq(validateBeta({ ...VALID, doctors: "0" }).doctors, BETA.doctorsInvalid, "0 doctors is not a count");
eq(validateBeta({ ...VALID, doctors: "1" }).doctors, undefined, "1 doctor is fine");
eq(validateBeta({ ...VALID, doctors: "3.5" }).doctors, BETA.doctorsInvalid, "a fraction is not a count");

eq(validateBeta({ ...VALID, contact: "hello" }).contact, BETA.contactInvalid, "\"hello\" is not a contact");
eq(validateBeta({ ...VALID, contact: "a@b" }).contact, BETA.contactInvalid, "an address without a dot is not an email");
eq(validateBeta({ ...VALID, contact: "aria@aprish.example" }).contact, undefined, "an email is accepted");
eq(validateBeta({ ...VALID, contact: "+91 98765 43210" }).contact, undefined, "a phone number is accepted");
eq(validateBeta({ ...VALID, contact: "123456" }).contact, BETA.contactInvalid, "six digits is too short for a phone");
eq(validateBeta({ ...VALID, consent: false }).consent, BETA.consentRequired, "consent stays required");

/* ------------------------- 2. WhatsApp message + payload ------------------------- */

BETA_FIELDS.forEach((field, index) => {
  ok(BETA.fields[index].length > 0, `BETA.fields[${index}] must pair with field ${field}`);
  ok(buildMessage(VALID).includes(BETA.fields[index]), `buildMessage must label the ${field} line`);
});
ok(buildMessage(VALID).startsWith(BETA.waIntro), "the prefill opens with BETA.waIntro");
ok(buildMessage(VALID).includes(VALID.name), "the prefill carries the visitor's name");
ok(buildMessage(VALID).includes(VALID.contact), "the prefill carries the visitor's contact");

const payload = buildPayload(VALID);
eq(payload.doctors, 3, "the payload sends doctors as a number");
eq(payload.consent, true, "the payload records consent");
ok(!("companyWebsite" in payload), "the payload must never carry the honeypot");

/* --------------------------- 3. the state machine --------------------------- */

const run = async () => {
  /* (a) the endpoint answers 2xx — the ONLY success. */
  const good = makeFetch({ ok: true, status: 200 });
  const goodResult = await submitBeta(VALID, { endpoint: "https://forms.test/x", fetch: good.fn, waLink });
  eq(goodResult.status, "ok", "a 2xx response is the only success");
  eq(good.calls.length, 1, "a real submit sends exactly one request");
  eq(good.calls[0].init?.method, "POST", "the request must be a POST");
  eq(good.calls[0].url, "https://forms.test/x", "the request must go to the configured endpoint");
  ok(
    String(good.calls[0].init?.body).includes(VALID.name),
    "the request body must carry the visitor's details",
  );

  /* (b) a non-2xx response is an error, never success. */
  for (const status of [400, 422, 500, 503]) {
    const fail = makeFetch({ ok: false, status });
    const result = await submitBeta(VALID, { endpoint: "https://forms.test/x", fetch: fail.fn, waLink });
    eq(result.status, "error", `HTTP ${status} must be an error, never success`);
    eq(fail.calls.length, 1, `HTTP ${status} still sends one request`);
  }

  /* (c) a thrown request (offline, DNS, timeout) is an error, never success. */
  const thrown = makeFetch(new Error("network down"));
  const thrownResult = await submitBeta(VALID, { endpoint: "https://forms.test/x", fetch: thrown.fn, waLink });
  eq(thrownResult.status, "error", "a thrown request must be an error, never success");

  /* (d) no endpoint: hand over to WhatsApp, and send nothing. */
  const unused = makeFetch({ ok: true, status: 200 });
  const waResult = await submitBeta(VALID, { endpoint: "", fetch: unused.fn, waLink });
  eq(waResult.status, "whatsapp", "an empty endpoint must fall back to WhatsApp");
  eq(unused.calls.length, 0, "the WhatsApp fallback must not send a request");
  if (waResult.status === "whatsapp") {
    ok(waResult.url.startsWith("https://wa.test/"), "the fallback URL must come from waLink");
    ok(
      waResult.url.includes(encodeURIComponent(buildMessage(VALID))),
      "the fallback URL must carry the prefilled message",
    );
  }

  /* (e) honeypot filled: dropped silently. No request, and nothing that reads as success. */
  const bot = makeFetch({ ok: true, status: 200 });
  const botResult = await submitBeta(
    { ...VALID, companyWebsite: "www.spam.example" },
    { endpoint: "https://forms.test/x", fetch: bot.fn, waLink },
  );
  eq(botResult.status, "bot", "a filled honeypot must be dropped");
  eq(bot.calls.length, 0, "a bot must never reach the endpoint");
  ok(botResult.status !== "ok", "a bot must never be told it succeeded");
  ok(botResult.status !== "whatsapp", "a bot must never be handed to WhatsApp either");

  /* (f) success is reachable ONLY through the 2xx branch: nothing else may return "ok". */
  const okFetch = () => makeFetch({ ok: true, status: 200 }).fn;
  const outcomes = [
    (await submitBeta(VALID, { endpoint: "", fetch: okFetch(), waLink })).status,
    (await submitBeta(VALID, { endpoint: "x", fetch: makeFetch({ ok: false, status: 500 }).fn, waLink })).status,
    (await submitBeta(VALID, { endpoint: "x", fetch: makeFetch(new Error("x")).fn, waLink })).status,
    (await submitBeta({ ...VALID, companyWebsite: "1" }, { endpoint: "x", fetch: okFetch(), waLink })).status,
  ];
  ok(!outcomes.includes("ok"), "only a real 2xx may ever produce ok");

  console.log(fails ? `${fails} FAILURES` : "ALL PASS");
  process.exit(fails ? 1 : 0);
};

void run();
