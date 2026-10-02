import type { ReactNode } from "react";

export interface AccordionItem {
  /** Also the DOM id of the item, so `#id` deep-links to it. */
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: ReadonlyArray<AccordionItem>;
  /** Controlled single-open state; `null` closes all. */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  headingLevel?: 3 | 4;
  className?: string;
}

/**
 * WAI-ARIA accordion: heading > button[aria-expanded] controlling a region. Height animates
 * with a grid-rows transition (.acc-panel); closed panels are `inert` so they leave the tab order.
 */
export function Accordion({ items, openId, onOpenChange, headingLevel = 3, className = "" }: AccordionProps) {
  const Heading = `h${headingLevel}` as "h3" | "h4";

  return (
    <div className={`divide-y divide-teal-900/10 border-y border-teal-900/10 ${className}`}>
      {items.map((item) => {
        const open = item.id === openId;
        const buttonId = `${item.id}-button`;
        const panelId = `${item.id}-panel`;
        return (
          <div key={item.id} id={item.id} className="scroll-mt-28">
            <Heading className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => onOpenChange(open ? null : item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-6 py-4 text-left text-base font-semibold text-teal-900 md:text-lg"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={`acc-icon grid h-8 w-8 shrink-0 place-items-center rounded-full border border-teal-900/15 ${open ? "bg-peach-400" : ""}`}
                  data-open={open}
                />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="acc-panel" data-open={open} inert={!open}>
              <div>
                <div className="pb-6 pr-12">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
