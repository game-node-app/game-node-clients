import type { SVGProps } from "react";

/** The 6px dot of the deadline chip (`Chip / prazo`, `5408:687`). */
export const EventDeadlineDot = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 6 6"
    width={6}
    height={6}
    fill="none"
    aria-hidden
    {...props}
  >
    {/* theme-exempt: event artwork */}
    <circle cx="3" cy="3" r="3" fill="#F7896D" />
  </svg>
);
