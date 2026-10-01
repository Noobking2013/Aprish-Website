import { useCallback, useState } from "react";
import { ROI } from "@/content/copy";
import { computeRoi, formatRupees, formatVisits, parseNumber } from "@/lib/roi";

/**
 * Home, section 7 (docs/02 §7): the ROI calculator, on the cream-100 band.
 *
 * Pure arithmetic over four text fields. Each field is `type="text"` with
 * `inputMode="decimal"` so a phone shows a number pad without the browser's number-input
 * spinner or its silent "value was not a number" behaviour — everything is parsed by
 * src/lib/roi.ts instead. A field only shows its error once it has been left once (blur),
 * and then re-checks on every keystroke; invalid fields feed 0 into the maths, so the two
 * results can never render NaN or Infinity.
 *
 * The results are `.data` (Space Mono), the formulas that produce them are printed under the
 * numbers, and the "example numbers" disclaimer sits with the results, not buried.
 */

type FieldKey = "avgFee" | "noShowsPerDay" | "workingDays" | "planPrice";

interface FieldSpec {
  key: FieldKey;
  label: string;
  /** The two money fields get a visible, decorative rupee prefix. */
  currency: boolean;
}

const FIELDS: readonly FieldSpec[] = [
  { key: "avgFee", label: ROI.fields.avgFee, currency: true },
  { key: "noShowsPerDay", label: ROI.fields.noShowsPerDay, currency: false },
  { key: "workingDays", label: ROI.fields.workingDays, currency: false },
  { key: "planPrice", label: ROI.fields.planPrice, currency: true },
];

const DEFAULTS: Record<FieldKey, string> = {
  avgFee: String(ROI.defaults.avgFee),
  noShowsPerDay: String(ROI.defaults.noShowsPerDay),
  workingDays: String(ROI.defaults.workingDays),
  planPrice: String(ROI.defaults.planPrice),
};

export function RoiCalculator() {
  const [values, setValues] = useState<Record<FieldKey, string>>(DEFAULTS);
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    avgFee: false,
    noShowsPerDay: false,
    workingDays: false,
    planPrice: false,
  });

  const handleChange = useCallback((key: FieldKey, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleBlur = useCallback((key: FieldKey) => {
    setTouched((previous) => (previous[key] ? previous : { ...previous, [key]: true }));
  }, []);

  const parsed = {
    avgFee: parseNumber(values.avgFee),
    noShowsPerDay: parseNumber(values.noShowsPerDay),
    workingDays: parseNumber(values.workingDays),
    planPrice: parseNumber(values.planPrice),
  };

  /* Invalid fields fall back to 0, so the results stay finite while an error is showing. */
  const result = computeRoi({
    avgFee: parsed.avgFee ?? 0,
    noShowsPerDay: parsed.noShowsPerDay ?? 0,
    workingDays: parsed.workingDays ?? 0,
    planPrice: parsed.planPrice ?? 0,
  });

  return (
    <section
      aria-labelledby="roi-title"
      data-nav-theme="light"
      className="bg-cream-100 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="roi-title"
          tabIndex={-1}
          className="display max-w-[32rem] text-[clamp(2.2rem,5vw,3.5rem)] text-teal-900"
        >
          {ROI.h2}
        </h2>
        <p className="lead mt-6 max-w-[40rem] text-teal-800">{ROI.intro}</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const invalid = touched[field.key] && parseNumber(values[field.key]) === null;
              const errorId = `roi-${field.key}-error`;

              return (
                <div key={field.key}>
                  <label
                    htmlFor={`roi-${field.key}`}
                    className="text-sm font-semibold text-teal-900"
                  >
                    {field.label}
                  </label>

                  <div
                    className={`mt-2 flex items-center rounded-xl border bg-cream-50 focus-within:border-teal-900 ${
                      invalid ? "border-coral-600" : "border-teal-900/15"
                    }`}
                  >
                    {field.currency ? (
                      <span aria-hidden="true" className="pl-3 text-teal-700">
                        {"\u20B9"}
                      </span>
                    ) : null}
                    <input
                      id={`roi-${field.key}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={values[field.key]}
                      onChange={(event) => handleChange(field.key, event.target.value)}
                      onBlur={() => handleBlur(field.key)}
                      aria-invalid={invalid || undefined}
                      aria-describedby={invalid ? errorId : undefined}
                      className="data w-full rounded-xl bg-transparent px-3 py-2.5 text-teal-900 outline-none"
                    />
                  </div>

                  {invalid ? (
                    <p id={errorId} className="mt-1 text-xs text-coral-700">
                      {ROI.invalid}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-teal-900/10 bg-cream-50 p-7">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-teal-700">{ROI.output.monthlyValue}</p>
                <p className="data mt-2 text-[clamp(1.6rem,3.5vw,2.4rem)] text-teal-900">
                  {formatRupees(result.monthlyValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-teal-700">{ROI.output.breakEven}</p>
                {result.breakEvenVisits === null ? (
                  <p className="mt-2 text-sm text-teal-700">{ROI.zeroFeePrompt}</p>
                ) : (
                  <p className="data mt-2 text-[clamp(1.6rem,3.5vw,2.4rem)] text-teal-900">
                    {formatVisits(result.breakEvenVisits)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-teal-900/10 pt-6">
              <p className="text-sm text-teal-700">{ROI.formulas.monthlyValue}</p>
              <p className="mt-2 text-sm text-teal-700">{ROI.formulas.breakEven}</p>
            </div>

            <p className="mt-6 text-xs text-teal-600">{ROI.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

