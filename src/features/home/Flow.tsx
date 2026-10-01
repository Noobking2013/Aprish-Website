import { useRef, type AnimationEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FLOW } from "@/content/copy";
import { FEATURES, chipFor } from "@/content/status";
import { useFlowTabs } from "./useFlowTabs";

/** "01" ... "05". The pills and the counter share it so the two can never disagree. */
const pad = (value: number) => String(value).padStart(2, "0");

const TOTAL = FLOW.steps.length;

/**
 * Home, section 3 (docs/02_SITE_MAP_AND_SECTIONS.md "Home 3").
 *
 * Five steps in a true sequence, so they are numbered 01-05 (docs/01 allows numbering only
 * for real sequences). The pills are a real tablist: only the selected tab is in the tab
 * order and the arrow keys move between them, so the section is keyboard operable without a
 * grid of five tabbable pills.
 *
 * The status chip lives in the tabpanel card, never on a pill: a pill is a position in the
 * flow, the chip is a claim about the feature that step is about (src/content/status.ts).
 * Every panel is rendered and the inactive ones are `hidden`, so all five step bodies are in
 * the static HTML — screen readers skip the hidden ones and the copy is there without JS.
 *
 * The progress underline and the auto-advance are `useFlowTabs` (docs/09 D13).
 */
export function Flow() {
  const flow = useFlowTabs(TOTAL);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { activeIndex } = flow;

  /* Roving focus. Selecting by keyboard is taking over, exactly like a click. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target = -1;
    if (event.key === "ArrowRight") target = Math.min(activeIndex + 1, TOTAL - 1);
    else if (event.key === "ArrowLeft") target = Math.max(activeIndex - 1, 0);
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = TOTAL - 1;
    if (target < 0) return;

    event.preventDefault();
    flow.select(target);
    tabRefs.current[target]?.focus();
  };

  const onBarEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.animationName === "flow-fill") flow.advance();
  };

  return (
    <section
      id="flow"
      aria-labelledby="flow-title"
      data-nav-theme="light"
      className="scroll-mt-24 bg-cream-100 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="flow-title"
          tabIndex={-1}
          className="display max-w-[34rem] text-[clamp(2.2rem,5vw,3.5rem)] text-teal-900"
        >
          {FLOW.h2}
        </h2>

        <p className="lead mt-6 max-w-[38rem] text-teal-700">{FLOW.intro}</p>

        <div
          ref={flow.rowRef}
          data-armed={flow.armed}
          data-paused={flow.paused}
          className="flow-row mt-12"
          onMouseEnter={flow.onMouseEnter}
          onMouseLeave={flow.onMouseLeave}
          onFocus={flow.onFocus}
          onBlur={flow.onBlur}
        >
          <div
            role="tablist"
            aria-labelledby="flow-title"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="flex flex-wrap gap-2"
          >
            {FLOW.steps.map((step, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={step.feature}
                  id={`flow-tab-${index}`}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`flow-panel-${index}`}
                  tabIndex={active ? 0 : -1}
                  data-active={active}
                  onClick={() => flow.select(index)}
                  className={`flow-pill flex min-w-[7.5rem] flex-col items-start gap-1.5 rounded-2xl border px-4 pt-3 pb-2 text-left text-sm font-semibold transition-colors ${
                    active
                      ? "border-peach-400 bg-peach-400 text-teal-950"
                      : "border-teal-900/15 bg-cream-50 text-teal-700 hover:border-teal-900/35"
                  }`}
                >
                  <span className="data text-[0.68rem] opacity-70">{pad(index + 1)}</span>
                  {step.label}
                  <span className="flow-bar mt-1 w-full" aria-hidden="true" onAnimationEnd={onBarEnd} />
                </button>
              );
            })}
          </div>

          {FLOW.steps.map((step, index) => {
            const chip = chipFor(FEATURES[step.feature].status);

            return (
              <div
                key={step.feature}
                id={`flow-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`flow-tab-${index}`}
                tabIndex={0}
                hidden={index !== activeIndex}
                className="flow-panel mt-6 rounded-3xl border border-teal-900/10 bg-cream-50 p-7 md:p-9"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h3 className="display max-w-[34rem] text-2xl text-teal-900 md:text-3xl">
                    {step.title}
                  </h3>
                  <span className="chip" data-status={chip.status}>
                    {chip.label}
                  </span>
                </div>
                <p className="mt-4 max-w-[46rem] text-teal-700">{step.body}</p>
              </div>
            );
          })}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={flow.back}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-2 rounded-full border border-teal-900/20 px-5 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:border-teal-900/45 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-teal-900/20"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {FLOW.back}
            </button>

            <button
              type="button"
              onClick={flow.next}
              disabled={activeIndex === TOTAL - 1}
              className="inline-flex items-center gap-2 rounded-full border border-teal-900/20 px-5 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:border-teal-900/45 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-teal-900/20"
            >
              {FLOW.next}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* One text node on purpose: "01" + " / " + "05" as three children would put a
                bare " / " in the DOM for no reason (and the copy check would flag it). */}
            <p className="data ml-1 text-sm text-teal-600">{`${pad(activeIndex + 1)} / ${pad(TOTAL)}`}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
