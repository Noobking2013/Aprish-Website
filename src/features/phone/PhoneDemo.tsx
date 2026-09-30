import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { waLink } from "@/content/config";
import { CHAT_DEMO, DEMO } from "@/content/copy";
import { TLink } from "@/features/transitions/TLink";
import { ChatBubble } from "./ChatBubble";
import type { ScriptedChat } from "./useScriptedChat";

export interface PhoneDemoProps {
  chat: ScriptedChat;
}

/**
 * The phone (docs/06, section B).
 *
 * Two jobs belong to this component alone: the observer that starts the one autoplay
 * (threshold 0.4) and holds the bob still while the phone is off-screen, and the
 * auto-scroll of the log. The conversation itself lives in useScriptedChat, because the
 * script tabs sit in the section's left column (docs/02, Home section 4).
 */
export function PhoneDemo({ chat }: PhoneDemoProps) {
  const {
    script,
    messages,
    typing,
    autoplaying,
    usedOptions,
    showHandoff,
    prefersReducedMotion,
    sendOption,
    sendText,
    start,
  } = chat;
  const phoneRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const busy = typing || autoplaying;

  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          phone.dataset.paused = entry.isIntersecting ? "false" : "true";
          if (entry.isIntersecting && !prefersReducedMotion) start();
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(phone);
    return () => observer.disconnect();
  }, [prefersReducedMotion, start]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    // Instant when reduced motion is on (docs/06, section B.6).
    log.scrollTo({ top: log.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, typing, prefersReducedMotion]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || draft.trim() === "") return;
    sendText(draft);
    setDraft("");
  };

  return (
    <div
      ref={phoneRef}
      data-paused="true"
      className="phone-shadow float-soft mx-auto w-full max-w-[360px] rounded-[2.35rem] border-[6px] border-teal-950 bg-phone-frame p-2 pb-3 [--float-r:1deg] [--float-y:9px]"
    >
      <div className="overflow-hidden rounded-[1.85rem] bg-phone-body">
        <div
          aria-hidden="true"
          className="flex items-center justify-between bg-teal-900 px-5 pt-2.5 pb-2 text-[9px] text-cream-100"
        >
          <span className="data">{CHAT_DEMO.clock}</span>
          <span className="data tracking-[0.18em]">{CHAT_DEMO.battery}</span>
        </div>

        {/*
          docs/06 asks for a .glass header. Glass's tint assumes a dark backdrop, but here
          the backdrop is the cream body, so the strip carries an explicit dark tint of its
          own and keeps the blur and rim (docs/09 D4).
        */}
        <div className="glass flex items-center gap-3 rounded-none bg-teal-950/95 px-4 py-3 before:hidden">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-900">
            <img
              src="/brand/logo-on-dark.png"
              alt=""
              width={804}
              height={534}
              className="h-4 w-auto"
            />
            <span
              aria-hidden="true"
              className="pulse-dot absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-peach-400 ring-2 ring-teal-900"
            />
          </span>
          <span className="flex flex-col">
            <span className="text-[13px] font-semibold text-cream-100">
              {CHAT_DEMO.header.title}
            </span>
            <span className="text-[10px] text-sage-300">{CHAT_DEMO.header.status}</span>
          </span>
        </div>

        <div
          ref={logRef}
          tabIndex={0}
          role="log"
          aria-live="polite"
          aria-label={CHAT_DEMO.logLabel}
          className="chat-scroll flex h-[22rem] flex-col gap-2.5 overflow-y-auto px-3.5 py-3 sm:h-[24rem]"
        >
          <p className="mb-0.5 text-center text-[9px] text-teal-700">{CHAT_DEMO.today}</p>

          {messages.map((message, index) => (
            <ChatBubble key={`${chat.activeIndex}-${index}`} message={message} />
          ))}

          {typing ? (
            <div
              data-testid="aria-typing"
              aria-label={CHAT_DEMO.typing}
              className="typing-bubble self-start rounded-[18px] rounded-bl-[4px] border border-teal-900/10 bg-bubble-cream px-4"
            >
              <span />
              <span />
              <span />
            </div>
          ) : null}

          {showHandoff ? (
            <TLink
              to={waLink()}
              className="mt-1 rounded-2xl bg-peach-400 px-3.5 py-2.5 text-center text-[11.5px] font-semibold text-teal-950 transition-colors hover:bg-peach-300"
            >
              {DEMO.openRealAria}
            </TLink>
          ) : null}
        </div>

        <div className="border-t border-teal-900/10 bg-phone-frame px-3 pt-2.5 pb-3">
          <p className="px-1 pb-2 text-[0.8rem] font-semibold text-teal-700">{CHAT_DEMO.tryLabel}</p>

          <div className="flex flex-wrap gap-1.5">
            {script.options.map((option, index) =>
              usedOptions.includes(index) ? null : (
                <button
                  key={option.label}
                  type="button"
                  disabled={busy}
                  onClick={() => sendOption(index)}
                  className="rounded-full border border-teal-900/15 bg-bubble-cream px-3 py-2 text-left text-[11px] leading-4 text-teal-700 transition-all hover:border-peach-400 hover:bg-cream-50 disabled:cursor-wait disabled:opacity-50 md:hover:-translate-y-px"
                >
                  {option.label}
                </button>
              ),
            )}
          </div>

          {/*
            The input's own focus ring would be clipped by the phone's rounded overflow, so
            the indicator is drawn on the pill instead (focus-within), where it stays visible.
          */}
          <form
            onSubmit={handleSubmit}
            className="mt-2.5 flex items-center gap-2 rounded-[14px] border border-teal-900/15 bg-bubble-cream px-3 py-1 focus-within:border-peach-400 focus-within:ring-2 focus-within:ring-peach-400/40"
          >
            <label className="sr-only" htmlFor="aria-composer">
              {CHAT_DEMO.placeholder}
            </label>
            <input
              id="aria-composer"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={busy}
              autoComplete="off"
              placeholder={CHAT_DEMO.placeholder}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[11.5px] text-teal-900 placeholder:text-teal-700 focus:outline-none"
            />
            <button
              type="submit"
              aria-label={CHAT_DEMO.send}
              disabled={busy || draft.trim() === ""}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-peach-400 text-teal-950 transition-colors hover:bg-peach-300 disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* The honesty label travels with the phone, so it survives any screenshot (docs/09 D1). */}
      <p className="px-3 pt-2.5 text-center text-[10px] leading-4 text-teal-600">{CHAT_DEMO.note}</p>
    </div>
  );
}
