import { Tooltip } from "@mantine/core";
import { cn } from "@repo/ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Accessible name of the button. */
  label: string;
  /** Optional tooltip content; the button is rendered without a tooltip when omitted. */
  tooltip?: ReactNode;
  /** Renders the hover background while the related popover is open. */
  active?: boolean;
}

/**
 * Topbar icon button (design node 5202:2220): 40 × 40, rounded, `nav-raised`
 * on hover/active and a 2 px brand focus outline. Shared by the search and
 * notification buttons.
 */
export function TopbarIconButton({
  label,
  tooltip,
  active = false,
  className,
  children,
  type = "button",
  ...others
}: Props) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-md text-nav-text",
        "hover:bg-nav-raised focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-brand-5",
        active && "bg-nav-raised",
        className,
      )}
      {...others}
    >
      {children}
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip label={tooltip} position="bottom" offset={8}>
      {button}
    </Tooltip>
  );
}
