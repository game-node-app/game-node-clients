import { useGameAchievementsV2, useUserId } from "#@/components";
import { getServerStoredIcon } from "#@/util";
import { Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

interface Props {
  gameId: number;
}

const GameInfoShareAchievementProgress = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();

  const achievementsQuery = useGameAchievementsV2(userId, gameId, true);

  const eligibleAchievementGroups = useMemo(
    () =>
      (achievementsQuery.data ?? []).filter((group) =>
        group.achievements.some((achievement) => achievement.isObtained),
      ),
    [achievementsQuery.data],
  );

  const achievementProgressBySource = useMemo(
    () =>
      eligibleAchievementGroups
        .map((group) => {
          const totalAchievements = group.achievements.length;
          const totalObtainedAchievements = group.achievements.filter(
            (achievement) => achievement.isObtained,
          ).length;

          return {
            source: group.source,
            sourceName: group.sourceAbbreviatedName,
            sourceIcon: group.iconName,
            totalAchievements,
            totalObtainedAchievements,
            progressPercentage:
              totalAchievements > 0
                ? Math.round(
                    (totalObtainedAchievements / totalAchievements) * 100,
                  )
                : 0,
          };
        })
        .sort((a, b) => a.sourceName.localeCompare(b.sourceName)),
    [eligibleAchievementGroups],
  );

  if (achievementProgressBySource.length === 0) {
    return null;
  }

  return (
    <Stack className={"gap-1 items-start"}>
      <Text>{t("collectionEntry.tabs.achievements")}</Text>
      <Stack className={"gap-1 items-start"}>
        {achievementProgressBySource.map((sourceProgress) => (
          <Group
            key={`achievement-source-${sourceProgress.source}`}
            className={"w-full justify-start items-center gap-2"}
          >
            {sourceProgress.sourceIcon ? (
              <img
                src={getServerStoredIcon(sourceProgress.sourceIcon)}
                alt={`${sourceProgress.sourceName} icon`}
                className={"w-5 h-5 object-contain"}
              />
            ) : (
              <Text size={"sm"} c={"dimmed"}>
                {sourceProgress.sourceName}
              </Text>
            )}
            <Text
              size={"sm"}
            >{`${sourceProgress.totalObtainedAchievements}/${sourceProgress.totalAchievements} (${sourceProgress.progressPercentage}%)`}</Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};

export { GameInfoShareAchievementProgress };
