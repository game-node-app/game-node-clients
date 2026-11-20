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
      "--button-bg": "var(--gn-brand)",
      "--button-hover": "var(--gn-brand-7)",
      "--button-color": "var(--gn-text)",
      "--button-hover-color": "var(--gn-text)",
      "--button-bd": "1px solid transparent",
    },
  },
  secondary: {
    mantineVariant: "filled",
    vars: {
      "--button-bg": "var(--gn-nav-raised)",
      "--button-hover": "var(--gn-line)",
      "--button-color": "var(--gn-text)",
      "--button-hover-color": "var(--gn-text)",
      "--button-bd": "1px solid var(--gn-line)",
    },
  },
  ghost: {
    mantineVariant: "subtle",
    vars: {
      "--button-bg": "transparent",
      "--button-hover": "var(--gn-nav-raised)",
      "--button-color": "var(--gn-dimmed-2)",
      "--button-hover-color": "var(--gn-dimmed-2)",
      "--button-bd": "1px solid transparent",
    },
  },
  danger: {
    mantineVariant: "filled",
    vars: {
      "--button-bg": "var(--gn-status-danger-strong)",
      "--button-hover":
        "color-mix(in srgb, var(--gn-status-danger-strong) 85%, black)",
      "--button-color": "var(--gn-text)",
      "--button-hover-color": "var(--gn-text)",
      "--button-bd": "1px solid transparent",
    },
  },
  dangerOutline: {
    mantineVariant: "outline",
    vars: {
      "--button-bg": "transparent",
      "--button-hover":
        "color-mix(in srgb, var(--gn-status-danger-strong) 10%, transparent)",
      "--button-color": "var(--gn-status-danger-text)",
      "--button-hover-color": "var(--gn-status-danger-text)",
      "--button-bd": "1px solid var(--gn-status-danger-strong)",
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
