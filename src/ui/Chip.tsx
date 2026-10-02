import type { ReactNode } from "react";
import { FEATURES, chipFor, type ChipStatus, type FeatureKey, type Status } from "@/content/status";

export type ChipTone = ChipStatus | "confirmed" | "sample";

export interface ChipProps {
  tone: ChipTone;
  children: ReactNode;
  className?: string;
}

/** The `.chip` pill. Colour always pairs with a dot and a word, never colour alone. */
export function Chip({ tone, children, className = "" }: ChipProps) {
  return (
    <span className={`chip ${className}`} data-status={tone}>
      {children}
    </span>
  );
}

/** A status from src/content/status.ts; `null` renders "To be confirmed". */
export function StatusChip({ status, className }: { status: Status | null; className?: string }) {
  const chip = chipFor(status);
  return (
    <Chip tone={chip.status} className={className}>
      {chip.label}
    </Chip>
  );
}

export function FeatureChip({ feature, className }: { feature: FeatureKey; className?: string }) {
  return <StatusChip status={FEATURES[feature].status} className={className} />;
}
