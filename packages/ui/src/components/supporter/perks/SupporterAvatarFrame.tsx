import { Box } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { type CSSProperties, type PropsWithChildren } from "react";
import { cn } from "#@/util";
import { ACCENT_SURFACE, getReadableAccent, hexToRgba } from "./accentColor";
import classes from "./SupporterAvatarFrame.module.css";

export interface SupporterAvatarFrameProps extends PropsWithChildren {
  /** Stored accent (`#RRGGBB`); the ring lightens it to reach 3:1. */
  accent: string;
  /** Set false in lists. Reduced motion also forces the static ring (D5). */
  animated?: boolean;
  className?: string;
}

/**
 * Animated ring around the profile avatar (design D5). Rotation is a
 * transform-only animation on a masked pseudo-element; reduced motion renders
 * the same ring without animation.
 */
export function SupporterAvatarFrame({
  accent,
  animated = true,
  className,
  children,
}: SupporterAvatarFrameProps) {
  const reducedMotion = useReducedMotion();
  const style = {
    "--ring": getReadableAccent(accent, ACCENT_SURFACE, 3),
    "--ring-soft": hexToRgba(accent, 0.25),
  } as CSSProperties;

  return (
    <Box
      data-testid={"supporter-avatar-frame"}
      className={cn(
        classes.frame,
        (!animated || reducedMotion) && classes.static,
        className,
      )}
      style={style}
    >
      <Box className={classes.inner}>{children}</Box>
    </Box>
  );
}
