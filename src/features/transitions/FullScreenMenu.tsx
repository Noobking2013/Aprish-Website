import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLocation } from "react-router-dom";
import { MENU, NAV, type MenuChip } from "@/content/copy";
import { Wordmark } from "@/features/chrome/Wordmark";
import { StarFour } from "./StarFour";
import { buildMenuClose, buildMenuOpen } from "./timelines";
import { useTransition } from "./useTransition";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';
const MARQUEE_REPEATS = [0, 1, 2];
const MARQUEE_TRACKS = [0, 1];

function BandChip({ chip }: { chip: MenuChip }) {
  if (chip.status) {
    return (
      <span className="chip" data-status={chip.status}>
        {chip.label}
      </span>
    );
  }

  return (
    <span className="glass glass--light menu-chip" data-sample={chip.sample ? "true" : undefined}>
      {chip.label}
    </span>
  );
}

/** The peach hover band: two identical tracks so the marquee loops seamlessly. */
function MenuBand({ link }: { link: (typeof MENU.links)[number] }) {
  return (
    <span aria-hidden="true" className="menu-band">
      <span className="flex w-full">
        {MARQUEE_TRACKS.map((track) => (
          <span
            key={track}
            className="marquee flex min-w-full shrink-0 items-center justify-around gap-10"
          >
            {MARQUEE_REPEATS.map((repeat) => (
              <span
                key={repeat}
                className="flex items-center gap-10 text-[clamp(0.9rem,1.6vw,1.35rem)] font-medium whitespace-nowrap text-teal-950"
              >
                <span>{link.marquee}</span>
                {link.chips.map((chip) => (
                  <BandChip key={chip.label} chip={chip} />
                ))}
                <StarFour className="h-3.5 w-3.5 text-teal-950/70" />
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

export function FullScreenMenu() {
  const { menuOpen, closeMenu, go } = useTransition();
  const { pathname } = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  /* Held true for the length of the close timeline so the dialog stays mounted while the
     bars animate out; `menuOpen` alone would hide it the instant it flips to false. */
  const [closing, setClosing] = useState(false);
  /* Prior open state and the path the menu was opened on, so a browser back/forward under
     an open menu can be told apart from a menu-link navigation. */
  const wasOpenRef = useRef(false);
  const openedAtRef = useRef<string | null>(null);

  /* Open / close timelines. The scope keeps the queries inside this dialog, so
     the route overlay's own .stair elements are never touched. */
  useGSAP(
    () => {
      if (!dialogRef.current) return;

      const bars = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(".stair"));
      const links = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(".menu-link"));

      if (menuOpen) {
        const firstLink = links[0];
        const focusCall = gsap.delayedCall(0, () => firstLink?.focus({ preventScroll: true }));
        const timeline = buildMenuOpen(bars, links, headerRef.current);
        return () => {
          focusCall.kill();
          timeline.kill();
        };
      }

      // First mount already has menuOpen false — there is nothing to close yet.
      if (!wasOpenRef.current) return;

      setClosing(true);
      const timeline = buildMenuClose(bars, links, headerRef.current);
      timeline.eventCallback("onComplete", () => setClosing(false));
      return () => timeline.kill();
    },
    { scope: dialogRef, dependencies: [menuOpen] },
  );

  /* Track the prior open state (this layout effect runs before the one below, so it still
     sees the previous value), and close the dialog when the route changes while it is open:
     otherwise the browser's back/forward leaves a full-screen dialog over the visited page. */
  useEffect(() => {
    if (menuOpen) {
      if (openedAtRef.current === null) openedAtRef.current = pathname;
      else if (openedAtRef.current !== pathname) closeMenu();
    } else {
      openedAtRef.current = null;
    }
    wasOpenRef.current = menuOpen;
  }, [menuOpen, pathname, closeMenu]);

  /* Re-opening before the close finished: drop the fade immediately. */
  if (menuOpen && closing) setClosing(false);

  /* Escape closes; Tab cycles inside the dialog only. */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const insideDialog = dialogRef.current?.contains(active) === true;

      if (event.shiftKey) {
        if (!insideDialog || active === first) {
          event.preventDefault();
          last?.focus();
        }
        return;
      }

      if (!insideDialog || active === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <div
      id="site-menu"
      ref={dialogRef}
      className="menu-dialog"
      data-open={menuOpen || closing ? "true" : "false"}
      data-closing={closing && !menuOpen ? "true" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={NAV.menuDialogLabel}
    >
      <div className="menu-stairs" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="stair menu-stair" />
        ))}
      </div>

      <div
        ref={headerRef}
        className="menu-panel flex items-center justify-between px-5 py-4 md:px-10 md:py-6"
      >
        <Wordmark className="text-cream-100" />
        <button
          type="button"
          onClick={() => closeMenu()}
          className="glass flex items-center gap-3 rounded-full px-5 py-3 text-cream-100 md:px-6"
        >
          <span className="data text-[0.7rem] tracking-[0.18em] uppercase">{NAV.closeMenu}</span>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <nav className="menu-panel flex-1" aria-label={NAV.menuDialogLabel}>
        <ul className="menu-list flex h-full flex-col">
          {MENU.links.map((link) => {
            const current = link.to === pathname;

            return (
              <li key={link.to} className="menu-row flex-1">
                <a
                  href={link.to}
                  aria-current={current ? "page" : undefined}
                  className="menu-link relative flex h-full items-center gap-4 px-5 md:px-10"
                  onClick={(event) => {
                    if (
                      event.defaultPrevented ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return;
                    }

                    event.preventDefault();
                    go(link.to, { fromMenu: true });
                  }}
                >
                  <span className="display relative z-[2] text-[clamp(2.4rem,7vw,6rem)] leading-[1.05] text-cream-100">
                    {link.label}
                  </span>
                  {current ? (
                    <span
                      aria-hidden="true"
                      className="relative z-[2] h-2.5 w-2.5 rounded-full bg-peach-400"
                    />
                  ) : null}
                  <MenuBand link={link} />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
