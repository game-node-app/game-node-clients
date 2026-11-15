import {
  Badge,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import type { ReactNode } from "react";
import { useI18nContext, useTranslation } from "@repo/locales";
import { AchievementV2Dto } from "@repo/wrapper/server";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import { AchievementBadge } from "../AchievementBadge";
import { FeatItem, formatFeatNumber } from "../util/feats";
import { FeatTierSegments } from "./FeatTierSegments";

export interface FeatCardProps {
  item: FeatItem;
  onOpenTiers: (item: FeatItem) => void;
}

const CATEGORY_LABEL_KEYS = {
  [AchievementV2Dto.category._0]: "achievements.filters.categories.collection",
  [AchievementV2Dto.category._1]: "achievements.filters.categories.followers",
  [AchievementV2Dto.category._2]: "achievements.filters.categories.reviews",
  [AchievementV2Dto.category._3]: "achievements.filters.categories.comments",
  [AchievementV2Dto.category._4]: "achievements.filters.categories.specials",
  [AchievementV2Dto.category._5]: "achievements.filters.categories.events",
} as const;

const FeatCard = ({ item, onOpenTiers }: FeatCardProps) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const { achievement, progress, state } = item;

  const isSecret = state === "secret";
  const isComplete = state === "complete";
  const obtainedTier = progress?.tier ?? 0;
  const value = progress?.value ?? 0;
  const threshold = item.nextThreshold;
  const nextTier = item.nextTier;
  const tierCount = achievement.tiers.length;
  const hasSegments = !isSecret && !isComplete && tierCount > 1;
  const progressValue =
    threshold != null && threshold > 0
      ? Math.min(100, Math.max(0, (value / threshold) * 100))
      : 0;

  const formatNumber = (amount: number) => formatFeatNumber(amount, language);

  const displayedTier = achievement.tiers.find(
    (tier) => tier.level === item.displayTier,
  );
  const rarityLabel =
    displayedTier != null
      ? t("achievements.card.rarity", {
          rarity: formatNumber(Number((displayedTier.rarity * 100).toFixed(1))),
        })
      : null;

  const categoryLabel = t(CATEGORY_LABEL_KEYS[achievement.category]);

  let statusBadge: ReactNode;
  if (isSecret) {
    statusBadge = (
      <Badge color={"gray"} variant={"light"} size={"sm"} radius={"sm"}>
        {t("achievements.card.secretBadge")}
      </Badge>
    );
  } else if (isComplete) {
    statusBadge = (
      <Badge color={"teal"} variant={"light"} size={"sm"} radius={"sm"}>
        {t("achievements.card.complete")}
      </Badge>
    );
  } else if (state === "obtained") {
    statusBadge = (
      <Badge color={"brand"} variant={"light"} size={"sm"} radius={"sm"}>
        {t("achievements.card.tier", { level: item.displayTier })}
      </Badge>
    );
  } else {
    statusBadge = (
      <Badge color={"gray"} variant={"light"} size={"sm"} radius={"sm"}>
        {categoryLabel}
      </Badge>
    );
  }

  let body: ReactNode;
  if (isSecret) {
    body = (
      <>
        <Progress
          value={0}
          color={"brand"}
          bg={"dark.7"}
          size={8}
          radius={"xl"}
        />
        <Text fz={12} c={"dimmed"}>
          {t("achievements.card.secretDescription")}
        </Text>
      </>
    );
  } else if (isComplete) {
    body = (
      <Group gap={4} align={"center"} c={"teal"}>
        <IconCheck size={16} />
        <Text component={"span"} fz={12} fw={600}>
          {t("achievements.card.obtained")}
        </Text>
        <Text component={"span"} fz={12}>
          {"·"}
        </Text>
        <Text component={"span"} fz={12} fw={600}>
          {t("achievements.card.earnedXp", {
            xp: formatNumber(item.earnedXp),
          })}
        </Text>
      </Group>
    );
  } else {
    body = (
      <>
        {hasSegments && <FeatTierSegments item={item} />}
        <Progress
          value={progressValue}
          color={"brand"}
          bg={"dark.7"}
          size={8}
          radius={"xl"}
        />
        <Group
          justify={"space-between"}
          align={"flex-start"}
          gap={"xs"}
          wrap={"nowrap"}
        >
          <Text fz={12} fw={600} className={"text-[#e6e6e6]"}>
            {t("achievements.card.progress", {
              value: formatNumber(value),
              threshold: threshold != null ? formatNumber(threshold) : "—",
            })}
            {tierCount > 1 && nextTier != null && (
              <>
                <Text component={"span"} fz={12} fw={400} c={"dimmed"}>
                  {" · "}
                </Text>
                <Text component={"span"} fz={12} fw={400} c={"dimmed"}>
                  {t("achievements.card.tierOf", {
                    level: nextTier.level,
                    total: tierCount,
                  })}
                </Text>
              </>
            )}
          </Text>
          {nextTier != null && (
            <Text fz={12} c={"dimmed"} className={"shrink-0"}>
              {tierCount === 1
                ? t("achievements.card.reward", {
                    xp: formatNumber(nextTier.expReward),
                  })
                : t("achievements.card.nextLevel", {
                    xp: formatNumber(nextTier.expReward),
                  })}
            </Text>
          )}
        </Group>
      </>
    );
  }

  return (
    <Paper
      data-state={state}
      className={`flex w-full flex-col gap-3.5 rounded-lg border bg-paper-7 p-4 sm:p-5 ${
        isSecret ? "border-dashed border-paper-4" : "border-paper-4"
      }`}
    >
      <Group align={"flex-start"} gap={14} wrap={"nowrap"} w={"100%"}>
        {isSecret ? (
          <Box
            data-variant={"tile"}
            aria-hidden
            className={
              "flex h-[60px] w-[60px] min-w-[60px] shrink-0 items-center justify-center rounded-[14px] border border-dashed border-paper-4 bg-paper-2 text-xl font-semibold text-dimmed"
            }
          >
            ?
          </Box>
        ) : (
          <AchievementBadge
            icon={achievement.icon}
            tier={obtainedTier}
            size={60}
            variant={"tile"}
          />
        )}
        <Stack gap={2} className={"min-w-0 grow"}>
          <Text fz={16} fw={600} truncate>
            {isSecret ? t("achievements.card.secretTitle") : achievement.name}
          </Text>
          <Text fz={13} c={"dimmed"} lineClamp={2}>
            {isSecret
              ? t("achievements.labels.secretDescription")
              : achievement.description}
          </Text>
        </Stack>
        <Box className={"shrink-0"}>{statusBadge}</Box>
      </Group>

      {body}

      {!isSecret && (
        <Group
          justify={"space-between"}
          align={"center"}
          gap={"sm"}
          wrap={"nowrap"}
          w={"100%"}
          className={"border-t border-paper-4 pt-3"}
        >
          <Text fz={12} c={"dimmed"}>
            {rarityLabel}
          </Text>
          <UnstyledButton
            onClick={() => onOpenTiers(item)}
            className={
              "flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-300 hover:text-white"
            }
          >
            {t("achievements.card.tiersAction")}
            <IconChevronRight size={14} aria-hidden />
          </UnstyledButton>
        </Group>
      )}
    </Paper>
  );
};

export { FeatCard };
