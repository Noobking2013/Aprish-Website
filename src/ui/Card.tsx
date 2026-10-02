import type { HTMLAttributes } from "react";

export type CardTone = "cream" | "sand" | "mint" | "lavender" | "blush" | "parchment" | "glassDark";

const TONES: Record<CardTone, string> = {
  cream: "border-teal-900/10 bg-cream-50",
  sand: "border-teal-900/10 bg-tint-sand",
  mint: "border-teal-900/10 bg-tint-mint",
  lavender: "border-teal-900/10 bg-tint-lavender",
  blush: "border-teal-900/10 bg-tint-blush",
  parchment: "border-teal-900/10 bg-tint-parchment",
  glassDark: "glass border-cream-100/15 text-cream-100",
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "li" | "section";
  tone?: CardTone;
  padding?: "md" | "lg";
}

export function Card({ as: Tag = "div", tone = "cream", padding = "md", className = "", ...rest }: CardProps) {
  const pad = padding === "lg" ? "p-7 md:p-8" : "p-6";
  return (
    <Tag
      className={`rounded-3xl border shadow-[0_24px_60px_-40px_rgb(23_61_61/0.45)] ${TONES[tone]} ${pad} ${className}`}
      {...rest}
    />
  );
}
