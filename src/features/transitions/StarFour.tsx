interface StarFourProps {
  className?: string;
  /** Decorative by default: the text next to it carries the meaning. */
  title?: string;
}

/** The gold four-point star from the Aprish mark. */
export function StarFour({ className, title }: StarFourProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path
        d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12Z"
        fill="currentColor"
      />
    </svg>
  );
}
