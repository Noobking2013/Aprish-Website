import { Check, CheckCheck } from "lucide-react";
import { CHAT_DEMO, type ChatMsg } from "@/content/copy";
import { tokenSegments } from "./chatScript";

export interface ChatBubbleProps {
  message: ChatMsg;
}

const TOKEN_CHUNK = /^Token #\d+$/;

/**
 * One message in the phone: Aria on the left, the patient on the right (docs/06, section B).
 *
 * Small text uses `teal-700` on the chat body and `teal-600` on the cream bubble, the two
 * combinations that clear 4.5:1 on the phone's own colours (docs/09 D5). The patient's
 * bubble holds `teal-900` at full strength: tinting it would drop below 4.5:1.
 */
export function ChatBubble({ message }: ChatBubbleProps) {
  const fromAria = message.from === "aria";
  const isConfirmation = message.kind === "confirmation";

  return (
    <div className={`bubble-enter flex max-w-[88%] ${fromAria ? "self-start" : "self-end"}`}>
      <div
        className={
          fromAria
            ? "rounded-[18px] rounded-bl-[4px] border border-teal-900/10 bg-bubble-cream px-3.5 py-2.5"
            : "rounded-[18px] rounded-br-[4px] bg-bubble-peach px-3.5 py-2.5"
        }
      >
        {isConfirmation ? (
          <p className="flex items-center gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-peach-400 text-teal-950">
              <Check className="h-3 w-3" />
            </span>
            <span className="chip" data-status="confirmed">
              {CHAT_DEMO.confirmed}
            </span>
          </p>
        ) : null}

        <p
          className={`text-[11.5px] leading-5 ${isConfirmation ? "mt-2" : ""} ${
            fromAria ? "text-teal-700" : "text-teal-900"
          }`}
        >
          {tokenSegments(message.text).map((chunk, index) =>
            TOKEN_CHUNK.test(chunk) ? (
              <span key={index} className="data font-semibold">
                {chunk}
              </span>
            ) : (
              <span key={index}>{chunk}</span>
            ),
          )}
        </p>

        <p
          className={`mt-1 flex items-center gap-1 text-[9px] ${
            fromAria ? "text-teal-600" : "text-teal-900"
          }`}
        >
          <span className="data">{CHAT_DEMO.time}</span>
          {fromAria ? (
            <>
              <Check className="h-3 w-3" />
              <span className="sr-only">{CHAT_DEMO.sent}</span>
            </>
          ) : (
            <>
              <CheckCheck className="h-3 w-3" />
              <span className="sr-only">{CHAT_DEMO.read}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
