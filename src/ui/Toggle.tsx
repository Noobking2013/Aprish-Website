import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface ToggleOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface ToggleProps<T extends string> {
  options: ReadonlyArray<ToggleOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  tone?: "light" | "dark";
  size?: "md" | "sm";
  className?: string;
}

/**
 * Segmented control with a sliding pill. A radiogroup: Tab enters on the checked option,
 * arrow keys move and select (WAI-ARIA radio pattern).
 */
export function Toggle<T extends string>({ options, value, onChange, label, tone = "light", size = "md", className = "" }: ToggleProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const dark = tone === "dark";

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const height = size === "sm" ? "min-h-9 text-xs" : "min-h-11 text-sm";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`relative grid rounded-full border p-1 ${dark ? "border-cream-100/20 bg-teal-950/40" : "border-teal-900/12 bg-cream-50"} ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="toggle-indicator absolute inset-y-1 left-1 rounded-full bg-peach-400"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option, i) => {
        const checked = i === index;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full px-4 font-semibold whitespace-nowrap transition-colors ${height} ${
              checked ? "text-teal-950" : dark ? "text-cream-100/85 hover:text-cream-100" : "text-teal-700 hover:text-teal-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
