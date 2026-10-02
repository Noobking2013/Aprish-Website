import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "dark" | "secondaryOnDark" | "ghost";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-peach-400 text-teal-950 shadow-[0_14px_34px_-14px_rgb(23_61_61/0.55)] hover:bg-peach-300",
  secondary: "border border-teal-900/15 text-teal-900 hover:border-teal-900/40",
  dark: "bg-teal-900 text-cream-100 hover:bg-teal-950",
  secondaryOnDark: "border border-cream-100/25 text-cream-100 hover:border-cream-100/60",
  ghost: "text-teal-900 underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  md: "px-6 py-3 text-sm",
  sm: "px-4 py-2 text-sm",
};

/**
 * Class string for any element that should look like a button. Use it on the app's own
 * link component (TLink, react-router Link, a plain <a>) so the primitive never needs to
 * know about routing.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...rest} />;
}
