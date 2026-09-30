import { NAV } from "@/content/copy";
import { MenuButton } from "@/features/transitions/MenuButton";
import { TLink } from "@/features/transitions/TLink";
import { Wordmark } from "./Wordmark";
import { useNavTheme } from "./useNavTheme";

/**
 * Fixed chrome. The header box ignores pointer events so the top strip of the page
 * stays clickable; the nav pill and the menu button opt back in.
 */
export function Navbar() {
  const theme = useNavTheme();
  const light = theme === "light";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <nav
        aria-label={NAV.primaryNavLabel}
        className={`glass pointer-events-auto absolute top-4 left-5 flex items-center gap-2 rounded-full py-2 pr-2 pl-5 md:top-6 md:left-10 ${
          light ? "glass--light" : ""
        }`}
      >
        <TLink to="/" aria-label={NAV.brandLink} className="flex items-center">
          <Wordmark className={light ? "text-teal-900" : "text-cream-100"} />
        </TLink>
        <TLink
          to="/join"
          className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:inline-flex ${
            light
              ? "bg-teal-900 text-cream-100 hover:bg-teal-950"
              : "bg-peach-400 text-teal-950 hover:bg-peach-300"
          }`}
        >
          {NAV.joinCta}
        </TLink>
      </nav>

      <MenuButton theme={theme} />
    </header>
  );
}
