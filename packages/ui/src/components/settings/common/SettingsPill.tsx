import { Box, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { PropsWithChildren } from "react";
import { cn } from "#@/util";

export type SettingsPillTone =
  | "accent"
  | "neutral"
  | "success"
  | "danger"
  | "premium";

const TONE_CLASSNAMES: Record<SettingsPillTone, string> = {
  accent: "bg-brand/[0.12] text-brand",
  neutral: "bg-nav-raised text-dimmed-2",
  success: "bg-status-success-text/[0.12] text-status-success-text",
  danger: "bg-status-danger-strong/[0.12] text-status-danger-text",
  premium: "bg-premium/[0.16] text-premium-text",
};

interface Props extends PropsWithChildren {
  tone?: SettingsPillTone;
  /** Leading dot, as in "● Esta sessão". */
  withDot?: boolean;
  className?: string;
}

/** Small rounded label (Figma "Pill"). */
export function SettingsPill({
  tone = "neutral",
  withDot = false,
  className,
  children,
}: Props) {
  return (
    <Box
      component={"span"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px]",
        TONE_CLASSNAMES[tone],
        className,
      )}
    >
      {withDot && (
        <Box
          component={"span"}
          className={"size-1.5 rounded-full bg-current"}
        />
      )}
      <Text component={"span"} fz={12} fw={500} lh={"normal"} c={"inherit"}>
        {children}
      </Text>
    </Box>
  );
}

/** "New" pill used in the sidebar and section headers. */
export function SettingsNewBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <SettingsPill tone={"accent"} className={className}>
      {t("settings.badges.new")}
    </SettingsPill>
  );
}

/** Marks a control that has no backend yet; the control itself must be disabled. */
export function SettingsComingSoonBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <SettingsPill tone={"neutral"} className={className}>
      {t("settings.badges.comingSoon")}
    </SettingsPill>
  );
}
