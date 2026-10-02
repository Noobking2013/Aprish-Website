import type { ReactNode } from "react";

export interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  as?: "p" | "span";
  className?: string;
}

/** Space Mono, uppercase, wide tracking. coral-700 on cream (4.9:1), peach-300 on teal. */
export function Eyebrow({ children, tone = "light", as: Tag = "p", className = "" }: EyebrowProps) {
  const color = tone === "dark" ? "text-peach-300" : "text-coral-700";
  return (
    <Tag className={`data text-[0.68rem] leading-relaxed tracking-[0.2em] uppercase ${color} ${className}`}>
      {children}
    </Tag>
  );
}

export interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  titleId: string;
  intro?: ReactNode;
  tone?: "light" | "dark";
  aside?: ReactNode;
  className?: string;
}

/** Eyebrow, h2 and intro, with an optional right-hand slot (chips, toggles). */
export function SectionHeader({ eyebrow, title, titleId, intro, tone = "light", aside, className = "" }: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2
          id={titleId}
          className={`display mt-4 text-[clamp(2rem,4.6vw,3.25rem)] ${dark ? "text-cream-100" : "text-teal-900"}`}
        >
          {title}
        </h2>
        {intro ? <p className={`lead mt-4 ${dark ? "text-sage-300" : "text-teal-700"}`}>{intro}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
