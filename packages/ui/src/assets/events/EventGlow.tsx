import type { SVGProps } from "react";

/**
 * Soft brand glow of the Home event cards (frame `5444:2034`, layer `glow`):
 * a 210px circle at 16% opacity blurred by 84px inside a 756px box.
 */
export const EventGlow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 756 756"
    width={756}
    height={756}
    fill="none"
    aria-hidden
    preserveAspectRatio="none"
    {...props}
  >
    <g opacity="0.16" filter="url(#event-glow-blur)">
      <circle cx="378" cy="378" r="210" fill="#F15025" />
    </g>
    <defs>
      <filter
        id="event-glow-blur"
        x="0"
        y="0"
        width="756"
        height="756"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur stdDeviation="84" result="effect1_foregroundBlur" />
      </filter>
    </defs>
  </svg>
);
