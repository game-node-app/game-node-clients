import { Button, ButtonProps, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";
import { cn } from "#@/util";

export type SettingsButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerOutline";

const VARIANT_CLASSNAMES: Record<SettingsButtonVariant, string> = {
  primary: "bg-[#f15025] text-white hover:bg-[#d6360b] border-transparent",
  secondary: "bg-[#222] text-white border-[#2a2a2a] hover:bg-[#2a2a2a]",
  ghost: "bg-transparent text-[#adadad] border-transparent hover:bg-[#222]",
  danger: "bg-[#e5484d] text-white border-transparent hover:bg-[#d13d42]",
  dangerOutline:
    "bg-transparent text-[#ff6369] border-[#e5484d] hover:bg-[rgba(229,72,77,0.1)]",
};

interface Props extends Omit<ButtonProps, "variant"> {
  variant?: SettingsButtonVariant;
}

/** Compact button matching the settings modal (13px, 8px radius). */
const _SettingsButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "secondary", className, classNames, ...others }, ref) => (
    <Button
      ref={ref}
      variant={"default"}
      radius={8}
      h={"auto"}
      className={cn(
        "border border-solid px-3 py-[7px] text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSNAMES[variant],
        className,
      )}
      classNames={{ label: "leading-normal", section: "me-1.5", ...classNames }}
      {...others}
    />
  ),
);
_SettingsButton.displayName = "SettingsButton";

export const SettingsButton = createPolymorphicComponent<"button", Props>(
  _SettingsButton,
);
