import type { SVGProps } from "react";

/** The 14px "ao-vivo" mark in front of the event card eyebrow (`5444:2046`). */
export const EventLiveDot = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 14 14"
    width={14}
    height={14}
    fill="none"
    aria-hidden
    {...props}
  >
    <circle cx="7" cy="7" r="7" fill="#F15025" />
    <circle cx="7" cy="7" r="3" fill="#F15025" />
  </svg>
);
