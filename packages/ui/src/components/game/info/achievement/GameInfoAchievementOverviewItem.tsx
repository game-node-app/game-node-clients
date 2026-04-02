import React, { useMemo } from "react";
import { GameAchievementGroupDto } from "@repo/wrapper/server";
import { Badge, Box, Group, Image, Stack, Text } from "@mantine/core";
import { getServerStoredIcon, Link } from "#@/util";
import {
  useGameAchievementsV2,
  useGamesResource,
  useOnMobilePlatform,
  useUserId,
} from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props {
  source: GameAchievementGroupDto.source;
  gameId: number;
}

const GameInfoAchievementOverviewItem = ({ gameId, source }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data, isLoading, isError } = useGameAchievementsV2(userId, gameId);
  const platformsQuery = useGamesResource("platforms");

  const targetAchievementGroup = useMemo(() => {
    return data?.find((group) => group.source === source);
  }, [data, source]);

  const availablePlatforms = useMemo(() => {
    if (targetAchievementGroup == undefined || platformsQuery.data == undefined)
      return [];

    return platformsQuery.data.filter((platform) => {
      return targetAchievementGroup.achievements.some((achievement) =>
        achievement.platformIds.includes(platform.id),
      );
    });
  }, [platformsQuery.data, targetAchievementGroup]);

  const renderedAchievementsInfo = useMemo(() => {
    if (targetAchievementGroup == undefined) return null;

    const totalAchievements = targetAchievementGroup.achievements.length;
    const itemName =
      targetAchievementGroup.source === GameAchievementGroupDto.source._36
        ? t("game.achievement.trophies")
        : t("game.achievement.achievements");

    return (
      <Text>
        <Text span className={"font-bold"}>
          {totalAchievements}
        </Text>{" "}
        {itemName}
      </Text>
    );
  }, [targetAchievementGroup, t]);

  return (
    <Link
      href={`/game/${gameId}?tab=achievements`}
      scroll={false}
      replace
      className={"hover:bg-paper rounded-sm p-3"}
    >
      <Group className={"flex-nowrap gap-2 max-w-fit"}>
        <Box className={"p-1"}>
          {targetAchievementGroup && (
            <Image
              alt={
                targetAchievementGroup?.sourceAbbreviatedName ??
                t("game.labels.externalStore")
              }
              src={getServerStoredIcon(targetAchievementGroup?.iconName)}
              className={"h-8 w-8 object-contain"}
            />
          )}
        </Box>
        <Stack className={"gap-1"}>
          <Box className={"p-1"}>
            {renderedAchievementsInfo ?? (
              <Text>{t("game.achievement.notAvailable")}</Text>
            )}
          </Box>
          <Group className={"flex-nowrap gap-1"}>
            {availablePlatforms.map((platform) => (
              <Badge
                key={`platform-${platform.id}`}
                variant={"default"}
                size={"sm"}
                className={"mobile:bg-paper-0 mobile:border-0"}
              >
                {platform.abbreviation.toUpperCase()}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Group>
    </Link>
  );
};

export { GameInfoAchievementOverviewItem };
