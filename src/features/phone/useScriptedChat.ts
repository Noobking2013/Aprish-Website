import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_DEMO, type ChatMsg, type ChatScript } from "@/content/copy";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { matchKeyword } from "./chatScript";

/** doc 06, section B.1 and B.3. */
const PATIENT_THEN_TYPING_MS = 900;
const TYPING_MS = 850;

/** idle = never played, playing = the one autoplay, done = handed over to the visitor. */
type Stage = "idle" | "playing" | "done";

export interface ScriptedChat {
  script: ChatScript;
  activeIndex: number;
  messages: ChatMsg[];
  typing: boolean;
  /** True while the one autoplay runs, so the chips and composer stay disabled. */
  autoplaying: boolean;
  usedOptions: number[];
  showHandoff: boolean;
  prefersReducedMotion: boolean;
  selectScript: (index: number) => void;
  sendOption: (index: number) => void;
  sendText: (text: string) => void;
  start: () => void;
}

/**
 * The conversation state machine behind the phone (docs/06, section B).
 *
 * `CHAT_DEMO.scripts[].intro` is the initial state, never an empty box, so the phone
 * still reads correctly with reduced motion on (docs/09 D7). The autoplay is only the
 * simulated patient message and Aria's reply, it runs once, and every timer is owned by
 * an effect so React StrictMode's double mount restarts the sequence instead of losing it.
 */
export function useScriptedChat(): ScriptedChat {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>(() => CHAT_DEMO.scripts[0].intro);
  const [typing, setTyping] = useState(false);
  const [usedOptions, setUsedOptions] = useState<number[]>([]);
  const [showHandoff, setShowHandoff] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const timers = useRef<number[]>([]);

  const script = CHAT_DEMO.scripts[activeIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const later = useCallback((run: () => void, ms: number) => {
    timers.current.push(window.setTimeout(run, ms));
  }, []);

  // One cleanup for every timer the visitor's own taps schedule.
  useEffect(() => clearTimers, [clearTimers]);

  const sendOption = useCallback(
    (index: number) => {
      const option = script.options[index];
      if (typing || stage === "playing" || !option || usedOptions.includes(index)) return;

      setMessages((current) => [...current, { from: "user", text: option.label }]);
      setUsedOptions((current) => [...current, index]);
      setTyping(true);
      later(() => {
        setMessages((current) => [...current, ...option.replies]);
        setTyping(false);
      }, TYPING_MS);
    },
    [later, script, stage, typing, usedOptions],
  );

  const sendText = useCallback(
    (text: string) => {
      const value = text.trim();
      if (value === "" || typing || stage === "playing") return;

      setMessages((current) => [...current, { from: "user", text: value }]);
      const optionIndex = matchKeyword(script, value);
      setTyping(true);
      later(() => {
        if (optionIndex === null) {
          setMessages((current) => [...current, { from: "aria", text: CHAT_DEMO.fallback }]);
          setShowHandoff(true);
        } else {
          setMessages((current) => [...current, ...script.options[optionIndex].replies]);
          setUsedOptions((current) =>
            current.includes(optionIndex) ? current : [...current, optionIndex],
          );
        }
        setTyping(false);
      }, TYPING_MS);
    },
    [later, script, stage, typing],
  );

  const selectScript = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      clearTimers();
      // A deliberate choice ends the autoplay story for good (docs/06, section B.1).
      setStage("done");
      setActiveIndex(index);
      setMessages(CHAT_DEMO.scripts[index].intro);
      setTyping(false);
      setUsedOptions([]);
      setShowHandoff(false);
    },
    [activeIndex, clearTimers],
  );

  const start = useCallback(() => {
    setStage((current) => (current === "idle" ? "playing" : current));
  }, []);

  useEffect(() => {
    if (stage !== "playing") return;

    const playing = CHAT_DEMO.scripts[activeIndex];
    setMessages(playing.intro);
    setUsedOptions([0]);
    setTyping(false);

    const toPatient = window.setTimeout(() => {
      setMessages((current) => [...current, { from: "user", text: playing.options[0].label }]);
      setTyping(true);
    }, PATIENT_THEN_TYPING_MS);

    const toReply = window.setTimeout(() => {
      setMessages((current) => [...current, ...playing.options[0].replies]);
      setTyping(false);
      setStage("done");
    }, PATIENT_THEN_TYPING_MS + TYPING_MS);

    return () => {
      window.clearTimeout(toPatient);
      window.clearTimeout(toReply);
    };
  }, [stage, activeIndex]);

  return {
    script,
    activeIndex,
    messages,
    typing,
    autoplaying: stage === "playing",
    usedOptions,
    showHandoff,
    prefersReducedMotion,
    selectScript,
    sendOption,
    sendText,
    start,
  };
}
