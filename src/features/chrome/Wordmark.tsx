import { FOOTER } from "@/content/copy";
import { StarFour } from "@/features/transitions/StarFour";

export interface WordmarkProps {
  className?: string;
}

/** "aprish" in Instrument Serif with the gold star sitting above the final letter. */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={`display inline-flex items-start gap-1 text-2xl ${className ?? ""}`}>
      <span>{FOOTER.wordmark}</span>
      <StarFour className="mt-[0.35em] h-1.5 w-1.5 text-gold-500" />
    </span>
  );
}
