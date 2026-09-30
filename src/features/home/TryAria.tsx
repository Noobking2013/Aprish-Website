import { waLink } from "@/content/config";
import { CHAT_DEMO, DEMO } from "@/content/copy";
import { FEATURES, STATUS_LABEL } from "@/content/status";
import { TLink } from "@/features/transitions/TLink";
import { PhoneDemo } from "@/features/phone/PhoneDemo";
import { useScriptedChat } from "@/features/phone/useScriptedChat";

/**
 * Home, section 4 (docs/02): the Try Aria stage, teal-950 with orbs behind the phone.
 *
 * The script tabs live here, not in the phone, so the conversation state is owned by the
 * section and passed down. Each tab carries a status chip built from
 * src/content/status.ts, because two of the four scripts depict features that are still
 * in development and the demo must not imply otherwise (docs/09 D8). The H2 is plain:
 * serif italic emphasis is hero-only (docs/09 D3).
 */
export function TryAria() {
  const chat = useScriptedChat();

  return (
    <section
      aria-labelledby="try-aria-title"
      data-nav-theme="dark"
      className="stage on-dark px-5 py-24 md:px-8 md:py-36"
    >
      <div aria-hidden="true" className="orb orb--peach -top-24 right-[8%] h-72 w-72" />
      <div aria-hidden="true" className="orb orb--teal bottom-[-4rem] -left-24 h-[24rem] w-[24rem]" />
      <div aria-hidden="true" className="orb orb--gold top-1/3 left-[45%] h-64 w-64" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-16">
        <div className="max-w-[34rem]">
          {/* docs/01 H2 scale, ceiling trimmed for a two-column section. */}
          <h2
            id="try-aria-title"
            tabIndex={-1}
            className="display text-[clamp(2.2rem,5vw,3.5rem)] text-cream-100"
          >
            {DEMO.h2}
          </h2>

          <p className="lead mt-6 text-sage-300">{DEMO.sub}</p>

          <div role="group" aria-label={DEMO.tabsLabel} className="mt-8 flex flex-wrap gap-2">
            {CHAT_DEMO.scripts.map((script, index) => {
              const active = index === chat.activeIndex;
              const status = FEATURES[script.feature].status;

              return (
                <button
                  key={script.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chat.selectScript(index)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border-peach-400 bg-peach-400 text-teal-950"
                      : "border-cream-100/20 text-sage-300 hover:border-cream-100/45"
                  }`}
                >
                  {script.tab}
                  <span className="chip" data-status={status}>
                    {STATUS_LABEL[status]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <TLink
              to={waLink()}
              className="inline-flex items-center rounded-full bg-peach-400 px-6 py-3 text-sm font-semibold text-teal-950 transition-colors hover:bg-peach-300"
            >
              {DEMO.openRealAria}
            </TLink>

            {/* Opaque RGB PNG, so it sits on a cream card rather than a bare white square. */}
            <figure className="flex w-[10.5rem] flex-col items-center gap-2 rounded-2xl bg-cream-50 p-3">
              <img
                src="/brand/qr-aria-whatsapp.png"
                alt={DEMO.qrAlt}
                width={400}
                height={402}
                loading="lazy"
                className="h-[7.5rem] w-auto rounded-lg"
              />
              <figcaption className="text-center text-[11px] leading-4 text-teal-700">
                {DEMO.qrCaption}
              </figcaption>
            </figure>
          </div>
        </div>

        <PhoneDemo chat={chat} />
      </div>
    </section>
  );
}
