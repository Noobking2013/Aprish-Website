import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { preload } from "./routes";
import { useTransition } from "./useTransition";

type AnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick" | "onPointerEnter" | "onFocus"
>;

export interface TLinkProps extends AnchorProps {
  to: string;
  children: ReactNode;
  /** Rendered as a plain anchor instead of routing (used for wa.me, mailto, http). */
  external?: boolean;
}

const EXTERNAL_TARGET = /^(https?:|mailto:|tel:)/i;

/**
 * The only internal link component on the site.
 * Hash links, wa.me, mailto: and external URLs are deliberately left alone.
 */
export function TLink({ to, children, external, ...rest }: TLinkProps) {
  const { go } = useTransition();

  const isHash = to.startsWith("#");
  const isExternal = external ?? EXTERNAL_TARGET.test(to);

  if (isHash || isExternal) {
    return (
      <a
        href={to}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const warm = () => {
    void preload(to);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Leave modified clicks, middle-clicks and already-handled events to the browser.
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
    go(to);
  };

  return (
    <a href={to} onPointerEnter={warm} onFocus={warm} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
