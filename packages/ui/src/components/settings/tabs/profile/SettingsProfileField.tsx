import { Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { PropsWithChildren, ReactNode } from "react";
import { cn } from "#@/util";

/** Figma input look (bg #0b0b0b, subtle border, red 1.5px border on error). */
export function getSettingsProfileInputClassNames(error = false) {
  return {
    input: cn(
      "border-solid bg-[#0b0b0b] text-[14px] text-white transition-colors placeholder:text-[#7a7a7a]",
      error
        ? "border-[1.5px] border-[#e5484d] focus:border-[#e5484d]"
        : "border border-[#2a2a2a] focus:border-[#f15025]",
    ),
    section: "text-[#7a7a7a]",
  };
}

/** Red message under a field (icon + 12px text), as in the "@ taken" state. */
export function SettingsProfileFieldError({
  id,
  children,
}: PropsWithChildren<{ id?: string }>) {
  return (
    <Group id={id} gap={6} wrap={"nowrap"} role={"alert"}>
      <IconAlertCircle size={14} className={"shrink-0 text-[#e5484d]"} />
      <Text fz={12} fw={500} lh={"normal"} className={"text-[#e5484d]"}>
        {children}
      </Text>
    </Group>
  );
}

interface Props extends PropsWithChildren {
  label: ReactNode;
  /** Id of the control, so the label is clickable. */
  htmlFor?: string;
  /** Badges next to the label ("Coming soon"…). */
  labelBadges?: ReactNode;
  help?: ReactNode;
  /** Right side of the help line ("78/240"). */
  counter?: ReactNode;
  error?: ReactNode;
  errorId?: string;
  disabled?: boolean;
  /** Extra content after the help line. */
  footer?: ReactNode;
}

/** Label, control, error and help line of a profile field. */
export function SettingsProfileField({
  label,
  htmlFor,
  labelBadges,
  help,
  counter,
  error,
  errorId,
  disabled = false,
  footer,
  children,
}: Props) {
  return (
    <Stack gap={8} className={"w-full"}>
      <Group gap={8} wrap={"nowrap"}>
        <Text
          component={"label"}
          htmlFor={htmlFor}
          fz={14}
          fw={600}
          c={"white"}
          lh={"normal"}
          className={cn("min-w-0 flex-1", disabled && "opacity-60")}
        >
          {label}
        </Text>
        {labelBadges}
      </Group>
      {children}
      {error && (
        <SettingsProfileFieldError id={errorId}>
          {error}
        </SettingsProfileFieldError>
      )}
      {(help || counter) && (
        <Group gap={12} wrap={"nowrap"}>
          <Text
            fz={13}
            lh={"18px"}
            className={cn(
              "min-w-0 flex-1 text-[#adadad]",
              disabled && "opacity-60",
            )}
          >
            {help}
          </Text>
          {counter && (
            <Text
              fz={12}
              lh={"normal"}
              className={"shrink-0 whitespace-nowrap text-[#7a7a7a]"}
            >
              {counter}
            </Text>
          )}
        </Group>
      )}
      {footer}
    </Stack>
  );
}
