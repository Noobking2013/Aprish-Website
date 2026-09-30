import { NAV } from "@/content/copy";
import { useTransition } from "./useTransition";

export interface MenuButtonProps {
  /** Colour of the section currently under the navbar. */
  theme: "light" | "dark";
}

/** The corner button. Two lines that flip to teal-950 under a growing peach fill. */
export function MenuButton({ theme }: MenuButtonProps) {
  const { menuOpen, openMenu, closeMenu, menuButtonRef } = useTransition();

  return (
    <button
      ref={menuButtonRef}
      type="button"
      data-nav-theme={theme}
      className={`glass menu-button group pointer-events-auto fixed top-0 right-0 z-50 h-11 w-[120px] rounded-bl-[28px] md:h-14 md:w-[168px] ${
        theme === "light" ? "glass--light" : ""
      }`}
      aria-expanded={menuOpen}
      aria-controls="site-menu"
      aria-label={menuOpen ? NAV.closeMenu : NAV.openMenu}
      onClick={() => (menuOpen ? closeMenu() : openMenu())}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-0 h-0 bg-peach-400 transition-[height] duration-300 ease-[var(--ease-out-soft)] group-hover:h-full group-focus-visible:h-full"
      />
      <span
        aria-hidden="true"
        className="relative z-[1] flex h-full w-full flex-col items-end justify-center gap-2 pr-4 md:pr-6"
      >
        <span className="menu-button-line h-[2px] w-3/5 rounded-full transition-colors duration-300" />
        <span className="menu-button-line h-[2px] w-[36%] rounded-full transition-colors duration-300" />
      </span>
    </button>
  );
}
