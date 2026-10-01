import { WALL, WALL_TEASER } from "@/content/copy";
import { TLink } from "@/features/transitions/TLink";
import { BookingCardContent } from "@/features/wall/BookingCard";
import { bookingAt } from "@/lib/wall/wallData";
import { cellCenter, lens, metricsFor } from "@/lib/wall/wallMath";

/**
 * Home, section 6 (docs/02 "Home 6", docs/04): a still preview of the /live wall on a
 * teal-950 stage, with the same orbs as Try Aria.
 *
 * The preview is a frozen snapshot of the wall at a fixed 1440x900 design board, so it reuses
 * the wall's own geometry (`cellCenter` + `lens`) and its own card markup
 * (`BookingCardContent`). Every card is placed with a percentage `left`/`top`/`width`/`height`
 * and the lens `scale` pushed onto a `translate(-50%,-50%) scale(...)` transform, all computed
 * ONCE at module scope — no measuring and no frame loop, unlike GlassWall.
 *
 * Because the six cells are a pure proportional scale of the wall's proven 1440x900 layout,
 * the cards cannot overlap at any width the board is squeezed into (scripts/sections.check.ts
 * re-checks that numerically).
 *
 * The two centre cards (the two highest lens scales) get the real `.glass` blur; the other
 * four get `.glass--lite`, exactly as the wall does for far-from-centre cards. The whole grid
 * is `aria-hidden`: it is decoration, and the H2, the sample chip and the button are the
 * readable, honest parts.
 *
 * One deliberate trade-off: the cards are sized as a share of the board, so at a phone width
 * they render small and their fixed-px text clips inside the (aria-hidden) card. That keeps
 * the layout purely percentage-driven and needs no measuring; the preview is decorative.
 */

const BOARD = { w: 1440, h: 900 } as const;

/** The 3 x 2 cells around the origin. Row 1 uses the wall's brick offset via cellCenter. */
const CELLS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [0, 0],
  [1, 0],
  [0, 1],
  [-1, 1],
  [1, 1],
];

/** unit = 1 at a 1440px board, so cardW/cardH/pitch match the wall's BASE exactly. */
const metrics = metricsFor(BOARD.w);

export interface TeaserCard {
  col: number;
  row: number;
  booking: ReturnType<typeof bookingAt>;
  /** Percentage of the board, ready to drop into a CSS value. */
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  scale: number;
  opacity: number;
  z: number;
  /** Real `.glass` (true) or `.glass--lite` (false). */
  glass: boolean;
}

const laidOut = CELLS.map(([col, row]) => {
  const cell = cellCenter(col, row, metrics);
  // Camera (0,0) puts the origin cell at the board centre, exactly like GlassWall at rest.
  const result = lens(cell.x + BOARD.w / 2, cell.y + BOARD.h / 2, BOARD.w, BOARD.h);
  return { col, row, result };
});

/* The two centre cards = the two highest lens scales. Sorting a copy is stable, so the tie
   between the two lower brick cells resolves to the one listed first in CELLS. */
const centreKeys = new Set(
  [...laidOut]
    .sort((a, b) => b.result.scale - a.result.scale)
    .slice(0, 2)
    .map(({ col, row }) => `${col},${row}`),
);

export const TEASER_CARDS: TeaserCard[] = laidOut.map(({ col, row, result }) => ({
  col,
  row,
  booking: bookingAt(col, row),
  leftPct: (result.x / BOARD.w) * 100,
  topPct: (result.y / BOARD.h) * 100,
  widthPct: (metrics.cardW / BOARD.w) * 100,
  heightPct: (metrics.cardH / BOARD.h) * 100,
  scale: result.scale,
  opacity: result.opacity,
  z: result.z,
  glass: centreKeys.has(`${col},${row}`),
}));

export function WallTeaser() {
  return (
    <section
      aria-labelledby="wall-teaser-title"
      data-nav-theme="dark"
      className="stage on-dark px-5 py-24 md:px-8 md:py-32"
    >
      <div aria-hidden="true" className="orb orb--peach -top-20 right-[10%] h-72 w-72" />
      <div aria-hidden="true" className="orb orb--teal bottom-[-5rem] -left-24 h-[24rem] w-[24rem]" />
      <div aria-hidden="true" className="orb orb--gold top-1/4 left-[48%] h-64 w-64" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="wall-teaser-title"
            tabIndex={-1}
            className="display max-w-[30rem] text-[clamp(2.2rem,5vw,3.5rem)] text-cream-100"
          >
            {WALL_TEASER.h2}
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <span className="glass glass--light wall-chip" data-sample="true">
              {WALL.sampleChip}
            </span>
            <TLink
              to="/live"
              className="inline-flex items-center rounded-full bg-peach-400 px-6 py-3 text-sm font-semibold text-teal-950 transition-colors hover:bg-peach-300"
            >
              {WALL_TEASER.buttonLabel}
            </TLink>
          </div>
        </div>

        <div
          aria-hidden="true"
          data-teaser-grid="true"
          className="relative mt-12 aspect-[16/10] w-full"
        >
          {TEASER_CARDS.map((card) => (
            <div
              key={`${card.col},${card.row}`}
              data-glass={card.glass ? "true" : "false"}
              className={`wall-teaser-card ${card.glass ? "glass" : "glass glass--lite"} flex flex-col justify-between rounded-[26px] px-4 py-3.5`}
              style={{
                position: "absolute",
                left: `${card.leftPct}%`,
                top: `${card.topPct}%`,
                width: `${card.widthPct}%`,
                height: `${card.heightPct}%`,
                transform: `translate(-50%, -50%) scale(${card.scale})`,
                transformOrigin: "center",
                opacity: card.opacity,
                zIndex: card.z,
              }}
            >
              <BookingCardContent booking={card.booking} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
