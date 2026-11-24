import { UnstyledButton } from "@mantine/core";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "#@/util/link";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";

export type PixelButtonVariant = "primary" | "ghost" | "ghost-dark";
export type PixelButtonSize = "sm" | "md";

export interface PixelButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  > {
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  className?: string;
  children?: ReactNode;
  /** Renders the app's Link presenter (web `next/link`, mobile router). */
  href?: string;
  fullWidth?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
}

const VARIANT_CLASSES: Record<PixelButtonVariant, string> = {
  primary: styles.pixelButtonPrimary,
  ghost: styles.pixelButtonGhost,
  "ghost-dark": styles.pixelButtonGhostDark,
};

/**
 * The Guild's pixel button (design D6): primary with the 3 px brand-9 drop
 * shadow and a 2 px pressed travel, ghost on parchment and ghost on dark.
 */
export function PixelButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  fullWidth = false,
  leftSection,
  rightSection,
  type,
  ...others
}: PixelButtonProps) {
  const classes = cn(
    styles.pixelButton,
    size === "sm" ? styles.pixelButtonSm : styles.pixelButtonMd,
    VARIANT_CLASSES[variant],
    fullWidth && styles.pixelButtonFullWidth,
    className,
  );

  const content = (
    <>
      {leftSection ? (
        <span className={styles.pixelButtonSection}>{leftSection}</span>
      ) : null}
      {children}
      {rightSection ? (
        <span className={styles.pixelButtonSection}>{rightSection}</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <UnstyledButton
        component={Link}
        href={href}
        className={classes}
        data-variant={variant}
        {...(others as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton
      type={type ?? "button"}
      className={classes}
      data-variant={variant}
      {...others}
    >
      {content}
    </UnstyledButton>
  );
}
