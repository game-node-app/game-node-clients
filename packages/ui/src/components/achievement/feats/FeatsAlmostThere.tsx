import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useTranslation } from "@repo/locales";
import {
  Box,
  Flex,
  Group,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { formatFeatNumber, type FeatItem } from "../util/feats";

export interface FeatsAlmostThereProps {
  /** Model's "almost there" ranking, already capped at three items. */
  items: readonly FeatItem[];
  onOpenTiers: (item: FeatItem) => void;
}

/**
 * Up to three feats closest to their next tier. Hidden when nothing qualifies.
 */
const FeatsAlmostThere = ({ items, onOpenTiers }: FeatsAlmostThereProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;

  if (items.length === 0) return null;

  return (
    <Stack gap={16}>
      <Stack gap={4}>
        <Title order={2} fz={18} fw={600} className={"text-white"}>
          {t("achievements.almostThere.title")}
        </Title>
        <Text fz={14} lh={"normal"} className={"text-[#8c8c8c]"}>
          {t("achievements.almostThere.subtitle")}
        </Text>
      </Stack>

      <Flex gap={12} className={"overflow-x-auto pb-1"}>
        {items.slice(0, 3).map((item) => {
          const nextTier = item.nextTier;
          if (!nextTier) return null;

          const value = item.progress?.value ?? 0;
          const threshold = item.nextThreshold ?? nextTier.threshold;
          const progress =
            threshold > 0 ? Math.min((value / threshold) * 100, 100) : 0;

          return (
            <UnstyledButton
              key={item.achievement.id}
              onClick={() => onOpenTiers(item)}
              className={
                "w-[280px] shrink-0 rounded-2xl border border-brand/20 p-4 text-left sm:w-auto sm:min-w-0 sm:flex-1"
              }
              style={{
                backgroundImage:
                  "linear-gradient(158deg, #1a120f 0%, #121212 60%)",
              }}
            >
              <Group gap={16} align={"center"} wrap={"nowrap"}>
                <AchievementBadge
                  icon={item.achievement.icon}
                  tier={item.progress?.tier ?? 0}
                  size={46}
                  variant={"tile"}
                />
                <Stack gap={2} className={"min-w-0 flex-1"}>
                  <Text
                    fz={16}
                    fw={600}
                    lh={"normal"}
                    className={"truncate text-white"}
                  >
                    {item.achievement.name}
                  </Text>
                  <Text
                    fz={13}
                    lh={"normal"}
                    className={"text-[#a6a6a6]"}
                    lineClamp={2}
                  >
                    {item.achievement.description}
                  </Text>

                  <Box mt={10}>
                    <Progress
                      value={progress}
                      color={"brand"}
                      radius={"xl"}
                      size={8}
                    />
                  </Box>

                  <Group justify={"space-between"} gap={8} mt={6}>
                    <Text fz={12} lh={"normal"} className={"text-[#a6a6a6]"}>
                      {t("achievements.almostThere.progress", {
                        value: formatFeatNumber(value, locale),
                        threshold: formatFeatNumber(threshold, locale),
                      })}
                    </Text>
                    <Text
                      fz={12}
                      fw={700}
                      lh={"normal"}
                      className={"text-brand"}
                    >
                      {t("achievements.almostThere.nextLevel", {
                        xp: formatFeatNumber(nextTier.expReward, locale),
                      })}
                    </Text>
                  </Group>
                </Stack>
              </Group>
            </UnstyledButton>
          );
        })}
      </Flex>
    </Stack>
  );
};

export { FeatsAlmostThere };
