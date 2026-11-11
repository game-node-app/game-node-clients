import { Box, Group, Text, Tooltip } from "@mantine/core";
import { IconCrown } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { useOnMobilePlatform } from "#@/components/general/hooks/useOnMobilePlatform";
import { cn } from "#@/util";
import type { ActiveSupporterPerks } from "./supporterPerks";

export interface SupporterBadgeProps {
  /** `full` is the profile header pill; `compact` is the crown shown in lists. */
  variant: "full" | "compact";
  perks: ActiveSupporterPerks | null;
  className?: string;
}

const PREMIUM_COLORS = {
  backgroundColor: "rgba(151,71,255,0.16)",
  borderColor: "rgba(151,71,255,0.45)",
  color: "#c7a6ff",
} as const;

/**
 * Supporter badge (design D4). The caller decides whether the perk is on; the
 * component only renders it for a non-null perks object. Colors follow the
 * profile theme when it is on, and the premium violet otherwise.
 */
export function SupporterBadge({
  variant,
  perks,
  className,
}: SupporterBadgeProps) {
  const { t } = useTranslation();
  const onMobilePlatform = useOnMobilePlatform();
  const label = t("supporter.badge.label");

  if (!perks) return null;

  const colors = perks.theme
    ? {
        backgroundColor: perks.accentSoft,
        borderColor: perks.accentBorder,
        color: perks.accentText,
      }
    : PREMIUM_COLORS;

  if (variant === "compact") {
    const icon = (
      <Box
        component={"span"}
        role={"img"}
        aria-label={label}
        data-testid={"supporter-badge-compact"}
        className={cn("inline-flex shrink-0 items-center", className)}
        style={{ color: colors.color }}
      >
        <IconCrown size={14} stroke={2} aria-hidden />
      </Box>
    );

    return onMobilePlatform ? icon : <Tooltip label={label}>{icon}</Tooltip>;
  }

  return (
    <Group
      gap={4}
      wrap={"nowrap"}
      align={"center"}
      data-testid={"supporter-badge"}
      className={cn(
        "h-5 shrink-0 rounded border border-solid px-1.5",
        className,
      )}
      style={colors}
    >
      <IconCrown size={13} stroke={2} aria-hidden />
      <Text component={"span"} fz={11} fw={600} lh={"normal"} c={"inherit"}>
        {label}
      </Text>
    </Group>
  );
}
