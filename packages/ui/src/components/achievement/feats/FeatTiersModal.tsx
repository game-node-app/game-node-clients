import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useFeatureFeat } from "#@/components/achievement/hooks/useFeatureFeat";
import type { FeatItem } from "#@/components/achievement/util/feats";
import {
  formatFeatAmount,
  formatFeatDate,
  formatFeatNumber,
} from "#@/components/achievement/util/feats";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { BaseModalProps, cn, Modal } from "#@/util";
import {
  Badge,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { AchievementTierV2Dto, AchievementV2Dto } from "@repo/wrapper/server";
import { IconCheck, IconStar } from "@tabler/icons-react";

export interface FeatTiersModalProps extends BaseModalProps {
  item: FeatItem | null;
  targetUserId: string;
  isOwner: boolean;
}

const CATEGORY_LABEL_KEYS = {
  [AchievementV2Dto.category._0]: "achievements.filters.categories.collection",
  [AchievementV2Dto.category._1]: "achievements.filters.categories.followers",
  [AchievementV2Dto.category._2]: "achievements.filters.categories.reviews",
  [AchievementV2Dto.category._3]: "achievements.filters.categories.comments",
  [AchievementV2Dto.category._4]: "achievements.filters.categories.specials",
  [AchievementV2Dto.category._5]: "achievements.filters.categories.events",
} as const;

type TierState = "obtained" | "progress" | "locked";

/**
 * Tier details of a feat: header, progress towards the next tier and one row
 * per tier. The table becomes a two-line list below `sm` (same on narrow web
 * and the native app).
 */
const FeatTiersModal = ({
  opened,
  onClose,
  item,
  targetUserId,
  isOwner,
}: FeatTiersModalProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language || "en";
  const onMobile = useOnMobile();
  const featureFeatMutation = useFeatureFeat(targetUserId);

  if (item == null) return null;

  const { achievement, progress } = item;
  const tiers = achievement.tiers;
  const obtainedTier = progress?.tier ?? 0;
  const value = progress?.value ?? 0;
  const isComplete = item.state === "complete";
  const nextTier = isComplete ? undefined : item.nextTier;
  const nextThreshold = item.nextThreshold;
  const progressValue =
    nextThreshold != null && nextThreshold > 0
      ? Math.min(100, Math.max(0, (value / nextThreshold) * 100))
      : 0;

  const obtainedDates = new Map(
    (progress?.obtainedTiers ?? []).map((obtained) => [
      obtained.level,
      obtained.obtainedAt,
    ]),
  );

  const tierState = (tier: AchievementTierV2Dto): TierState => {
    if (tier.level <= obtainedTier) return "obtained";
    if (nextTier?.level === tier.level) return "progress";
    return "locked";
  };

  const statusText = (tier: AchievementTierV2Dto) => {
    const state = tierState(tier);
    if (state === "obtained") {
      const date = obtainedDates.get(tier.level);
      const formattedDate =
        date != undefined ? formatFeatDate(date, locale) : "";
      return formattedDate
        ? t("achievements.tiers.obtainedAt", { date: formattedDate })
        : t("achievements.tiers.obtained");
    }
    if (state === "progress") {
      return t("achievements.card.progress", {
        value: formatFeatNumber(value, locale),
        threshold: formatFeatNumber(nextThreshold ?? tier.threshold, locale),
      });
    }
    return t("achievements.tiers.locked");
  };

  const rarityText = (tier: AchievementTierV2Dto) =>
    t("achievements.tiers.rarity", {
      rarity: formatFeatNumber(Number((tier.rarity * 100).toFixed(1)), locale),
    });

  const xpText = (tier: AchievementTierV2Dto) =>
    t("achievements.tiers.xp", {
      xp: formatFeatNumber(tier.expReward, locale),
    });

  const thresholdText = (tier: AchievementTierV2Dto) =>
    formatFeatAmount(tier.threshold, {
      locale,
      metric: achievement.metric,
      t,
    });

  const dotClass = (tier: AchievementTierV2Dto) => {
    const state = tierState(tier);
    if (state === "obtained") return "bg-brand";
    if (state === "progress") return "border-2 border-brand";
    return "bg-paper-1";
  };

  const canFeature = isOwner && obtainedTier > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("achievements.tiers.title")}
      breakpoints={[0, 0.75, 1]}
      initialBreakpoint={0.75}
      size={"lg"}
      centered
    >
      <Stack gap={18}>
        <Group align={"flex-start"} gap={18} wrap={"nowrap"}>
          <AchievementBadge
            icon={achievement.icon}
            tier={obtainedTier}
            size={64}
            variant={"tile"}
          />
          <Stack gap={4} className={"min-w-0 flex-1"}>
            <Group gap={8} wrap={"wrap"}>
              <Badge
                color={"brand"}
                variant={"light"}
                radius={"sm"}
                size={"sm"}
              >
                {t("achievements.tiers.levelOf", {
                  level: item.displayTier,
                  total: tiers.length,
                })}
              </Badge>
              <Badge color={"gray"} variant={"light"} radius={"sm"} size={"sm"}>
                {t(CATEGORY_LABEL_KEYS[achievement.category])}
              </Badge>
            </Group>
            <Title order={4} lh={"normal"} className={"break-words"}>
              {achievement.name}
            </Title>
            <Text fz={13} c={"dimmed"} lh={"normal"}>
              {achievement.description}
            </Text>
          </Stack>
        </Group>

        {isComplete ? (
          <Group gap={6} c={"teal"}>
            <IconCheck size={18} />
            <Text fz={14} fw={600}>
              {t("achievements.tiers.complete")}
            </Text>
          </Group>
        ) : (
          <Stack gap={8}>
            <Group justify={"space-between"} gap={"sm"} wrap={"nowrap"}>
              <Text fz={13} c={"dimmed"}>
                {t("achievements.tiers.towards", {
                  level: nextTier?.level ?? item.displayTier,
                })}
              </Text>
              <Text fz={13} fw={700}>
                {formatFeatNumber(value, locale)}
                {" / "}
                {nextThreshold != null
                  ? formatFeatAmount(nextThreshold, {
                      locale,
                      metric: achievement.metric,
                      t,
                    })
                  : formatFeatNumber(0, locale)}
              </Text>
            </Group>
            <Progress
              value={progressValue}
              color={"brand"}
              bg={"dark.7"}
              size={8}
              radius={"xl"}
            />
          </Stack>
        )}

        {onMobile ? (
          <Stack gap={0}>
            {tiers.map((tier) => {
              const state = tierState(tier);
              return (
                <Box
                  key={tier.level}
                  data-level={tier.level}
                  data-state={state}
                  px={4}
                  py={12}
                  className={"border-b border-paper-5 last:border-b-0"}
                  style={{
                    backgroundColor:
                      state === "progress"
                        ? "color-mix(in srgb, var(--gn-brand) 6%, transparent)"
                        : undefined,
                  }}
                >
                  <Group
                    justify={"space-between"}
                    align={"flex-start"}
                    gap={"sm"}
                    wrap={"nowrap"}
                  >
                    <Stack gap={2} className={"min-w-0"}>
                      <Group gap={8} align={"center"} wrap={"nowrap"}>
                        <Box
                          w={9}
                          h={9}
                          className={cn(
                            "shrink-0 rounded-[4.5px]",
                            dotClass(tier),
                          )}
                        />
                        <Text fz={13} fw={600} truncate>
                          {t("achievements.card.tier", { level: tier.level })}
                          {" · "}
                          {thresholdText(tier)}
                        </Text>
                      </Group>
                      <Text fz={12} c={"dimmed"} lh={"normal"}>
                        {statusText(tier)}
                        {" · "}
                        {t("achievements.card.rarity", {
                          rarity: formatFeatNumber(
                            Number((tier.rarity * 100).toFixed(1)),
                            locale,
                          ),
                        })}
                      </Text>
                    </Stack>
                    <Text
                      fz={13}
                      fw={700}
                      className={"shrink-0"}
                      c={state === "locked" ? "dimmed" : "brand"}
                    >
                      {xpText(tier)}
                    </Text>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Table verticalSpacing={"sm"} horizontalSpacing={"sm"}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("achievements.tiers.columns.level")}</Table.Th>
                <Table.Th>{t("achievements.tiers.columns.threshold")}</Table.Th>
                <Table.Th>{t("achievements.tiers.columns.xp")}</Table.Th>
                <Table.Th>{t("achievements.tiers.columns.rarity")}</Table.Th>
                <Table.Th>{t("achievements.tiers.columns.status")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tiers.map((tier) => {
                const state = tierState(tier);
                return (
                  <Table.Tr
                    key={tier.level}
                    data-level={tier.level}
                    data-state={state}
                    style={{
                      backgroundColor:
                        state === "progress"
                          ? "color-mix(in srgb, var(--gn-brand) 6%, transparent)"
                          : undefined,
                    }}
                  >
                    <Table.Td>
                      <Group gap={8} align={"center"} wrap={"nowrap"}>
                        <Box
                          w={9}
                          h={9}
                          className={cn(
                            "shrink-0 rounded-[4.5px]",
                            dotClass(tier),
                          )}
                        />
                        <Text fz={13} fw={600}>
                          {t("achievements.card.tier", { level: tier.level })}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={13}>{thresholdText(tier)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        fz={13}
                        fw={700}
                        c={state === "locked" ? "dimmed" : "brand"}
                      >
                        {xpText(tier)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={13} c={"dimmed"}>
                        {rarityText(tier)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={12} c={"dimmed"}>
                        {statusText(tier)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}

        {canFeature && (
          <Button
            variant={"default"}
            fullWidth
            leftSection={<IconStar size={18} />}
            loading={featureFeatMutation.isPending}
            onClick={() => {
              featureFeatMutation.mutate(achievement.id, {
                onSuccess: onClose,
              });
            }}
          >
            {t("achievements.featured.action")}
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export { FeatTiersModal };
