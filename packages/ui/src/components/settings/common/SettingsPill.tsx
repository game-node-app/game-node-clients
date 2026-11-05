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
  accent: "bg-[rgba(241,80,37,0.12)] text-[#f15025]",
  neutral: "bg-[#222] text-[#adadad]",
  success: "bg-[rgba(61,214,140,0.12)] text-[#3dd68c]",
  danger: "bg-[rgba(229,72,77,0.12)] text-[#ff6369]",
  premium: "bg-[rgba(151,71,255,0.16)] text-[#c7a6ff]",
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
