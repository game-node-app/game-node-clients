import {
  Button,
  ButtonProps,
  createPolymorphicComponent,
  type ButtonVariant,
} from "@mantine/core";
import { forwardRef } from "react";
import { cn } from "#@/util";

export type SettingsButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerOutline";

interface VariantConfig {
  /**
   * Underlying Mantine variant. Deliberately never `"default"`: the mobile app
   * repaints every `[data-variant="default"]` button via its Button theme
   * override (`apps/mobile/src/components/theme.module.css`).
   */
  mantineVariant: ButtonVariant;
  /**
   * Colours are supplied through Mantine's own button CSS variables and set
   * inline, so they win over any stylesheet regardless of injection order.
   */
  vars: Record<string, string>;
}

const VARIANT_CONFIG: Record<SettingsButtonVariant, VariantConfig> = {
  primary: {
    mantineVariant: "filled",
    vars: {
      "--button-bg": "#f15025",
      "--button-hover": "#d6360b",
      "--button-color": "#ffffff",
      "--button-hover-color": "#ffffff",
      "--button-bd": "1px solid transparent",
    },
  },
  secondary: {
    mantineVariant: "filled",
    vars: {
      "--button-bg": "#222222",
      "--button-hover": "#2a2a2a",
      "--button-color": "#ffffff",
      "--button-hover-color": "#ffffff",
      "--button-bd": "1px solid #2a2a2a",
    },
  },
  ghost: {
    mantineVariant: "subtle",
    vars: {
      "--button-bg": "transparent",
      "--button-hover": "#222222",
      "--button-color": "#adadad",
      "--button-hover-color": "#adadad",
      "--button-bd": "1px solid transparent",
    },
  },
  danger: {
    mantineVariant: "filled",
    vars: {
      "--button-bg": "#e5484d",
      "--button-hover": "#d13d42",
      "--button-color": "#ffffff",
      "--button-hover-color": "#ffffff",
      "--button-bd": "1px solid transparent",
    },
  },
  dangerOutline: {
    mantineVariant: "outline",
    vars: {
      "--button-bg": "transparent",
      "--button-hover": "rgba(229, 72, 77, 0.1)",
      "--button-color": "#ff6369",
      "--button-hover-color": "#ff6369",
      "--button-bd": "1px solid #e5484d",
    },
  },
};

interface Props extends Omit<ButtonProps, "variant"> {
  variant?: SettingsButtonVariant;
}

/** Compact button matching the settings modal (13px, 8px radius). */
const _SettingsButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "secondary", className, classNames, style, ...others }, ref) => {
    const config = VARIANT_CONFIG[variant];

    return (
      <Button
        ref={ref}
        variant={config.mantineVariant}
        radius={8}
        h={"auto"}
        style={[config.vars, style]}
        className={cn(
          "px-3 py-[7px] text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        classNames={{
          label: "leading-normal",
          section: "me-1.5",
          ...classNames,
        }}
        {...others}
      />
    );
  },
);
_SettingsButton.displayName = "SettingsButton";

export const SettingsButton = createPolymorphicComponent<"button", Props>(
  _SettingsButton,
);
