import { NavIconBase, type NavIconProps } from "./NavIcon";

/**
 * Figma `Escudo` (Guild shield), 22 × 24, rendered at 24 px. The plus is cut
 * out of the shield so a single `currentColor` reads as the monochrome glyph.
 */
export function NavGuildIcon({ size = 24, ...props }: NavIconProps) {
  return (
    <NavIconBase
      size={size}
      viewBox="0 0 22 24"
      fill="currentColor"
      stroke="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 0H20V2H22V14H20V18H18V20H14V22H12V24H10V22H8V20H4V18H2V14H0V2H2V0ZM10 6H12V10H16V12H12V16H10V12H6V10H10V6Z"
      />
    </NavIconBase>
  );
}
