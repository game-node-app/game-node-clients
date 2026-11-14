import type { ReactNode, SVGProps } from "react";

export interface NavIconProps
  extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Square size in pixels. The Figma `Icons/Nav/*` glyphs are drawn at 20. */
  size?: number | string;
}

interface NavIconBaseProps extends NavIconProps {
  children: ReactNode;
}

/**
 * Shared frame of the `Icons/Nav/*` glyphs exported from Figma: 20 × 20
 * viewBox, no fill and a 1.33333 px round stroke that inherits the current
 * text color.
 */
export function NavIconBase({
  size = 20,
  children,
  ...others
}: NavIconBaseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...others}
    >
      {children}
    </svg>
  );
}
