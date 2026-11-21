import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useTranslation } from "@repo/locales";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import type { FeatItem } from "../util/feats";

export interface FeatsFeaturedSlotProps {
  /** First featured feat of the viewed user. */
  item?: FeatItem | null;
  isOwner: boolean;
  /** Opens the featured feat picker. Required for the owner's actions. */
  onPickFeatured?: () => void;
}

/**
 * Featured feat of the user's profile. Visitors without a featured feat see
 * nothing; the owner always sees the slot, with an empty state when needed.
 */
const FeatsFeaturedSlot = ({
  item,
  isOwner,
  onPickFeatured,
}: FeatsFeaturedSlotProps) => {
  const { t } = useTranslation();
  const title = isOwner
    ? t("achievements.featured.title")
    : t("achievements.featured.titleVisitor");

  if (!item && !isOwner) return null;

  return (
    <Box className={"rounded-xl border border-paper-4 bg-black/40 px-3.5 py-3"}>
      {item ? (
        <Group gap={14} wrap={"nowrap"} align={"center"}>
          <AchievementBadge
            icon={item.achievement.icon}
            tier={item.progress?.tier ?? 0}
            size={44}
            variant={"tile"}
          />
          <Stack gap={2} className={"min-w-0 flex-1"}>
            <Text fz={12} lh={"normal"} className={"text-dimmed-1"}>
              {title}
            </Text>
            <Text
              fz={15}
              fw={600}
              lh={"normal"}
              className={"truncate text-white"}
            >
              {item.achievement.name} ·{" "}
              {t("achievements.card.tier", { level: item.displayTier })}
            </Text>
          </Stack>
          {isOwner && onPickFeatured && (
            <UnstyledButton
              onClick={onPickFeatured}
              className={
                "flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-brand"
              }
            >
              <IconArrowsExchange size={18} />
              {t("achievements.featured.change")}
            </UnstyledButton>
          )}
        </Group>
      ) : (
        <Group justify={"space-between"} gap={12} wrap={"nowrap"}>
          <Stack gap={2} className={"min-w-0"}>
            <Text fz={12} lh={"normal"} className={"text-dimmed-1"}>
              {title}
            </Text>
            <Text fz={14} fw={600} lh={"normal"} className={"text-white"}>
              {t("achievements.featured.empty")}
            </Text>
          </Stack>
          {isOwner && onPickFeatured && (
            <UnstyledButton
              onClick={onPickFeatured}
              className={
                "flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-brand"
              }
            >
              <IconArrowsExchange size={18} />
              {t("achievements.featured.change")}
            </UnstyledButton>
          )}
        </Group>
      )}
    </Box>
  );
};

export { FeatsFeaturedSlot };
