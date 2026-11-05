import { Box, BoxProps } from "@mantine/core";
import { Children, Fragment, PropsWithChildren } from "react";
import { cn } from "#@/util";

interface Props extends PropsWithChildren<BoxProps> {
  /** Draws a 1px divider between each direct child. Defaults to true. */
  withDividers?: boolean;
  /** Red border, used by the "danger zone". */
  danger?: boolean;
}

/** Bordered surface that groups rows or fields (Figma "Card"). */
export function SettingsCard({
  children,
  withDividers = true,
  danger = false,
  className,
  ...others
}: Props) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <Box
      className={cn(
        "w-full overflow-hidden rounded-xl border border-solid bg-[#1a1a1a]",
        danger ? "border-[#e5484d]" : "border-[#2a2a2a]",
        className,
      )}
      {...others}
    >
      {withDividers
        ? items.map((child, index) => (
            <Fragment key={index}>
              {index > 0 && <SettingsDivider />}
              {child}
            </Fragment>
          ))
        : children}
    </Box>
  );
}

export function SettingsDivider({ className }: { className?: string }) {
  return <Box className={cn("h-px w-full bg-[#2a2a2a]", className)} />;
}
