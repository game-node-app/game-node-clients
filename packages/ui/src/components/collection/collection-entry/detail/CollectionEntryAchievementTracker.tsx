import React, { useEffect, useMemo, useState } from "react";
import {
  CenteredErrorMessage,
  DetailsBox,
  GameAchievementsList,
  useGameAchievementsV2,
} from "#@/components";
import { SegmentedControl } from "@mantine/core";
import { GameAchievementGroupDto } from "@repo/wrapper/server";

interface Props {
  userId: string;
  gameId: number;
  withTitle?: boolean;
}

const CollectionEntryAchievementTracker = ({
  userId,
  gameId,
  withTitle = true,
}: Props) => {
  const achievementsQuery = useGameAchievementsV2(userId, gameId);

  /**
   * achievements groups that actually have owned achievements
   */
  const availableGroups = useMemo(() => {
    return (
      achievementsQuery.data?.filter((group) => {
        return group.achievements.some((achievement) => {
          return achievement.isObtained;
        });
      }) ?? []
    );
  }, [achievementsQuery.data]);

  const [selectedSource, setSelectedSource] = useState<
    GameAchievementGroupDto.source | undefined
  >(undefined);

  const isEmpty = !achievementsQuery.isLoading && availableGroups.length === 0;

  useEffect(() => {
    if (availableGroups.length > 0) {
      const firstSource = availableGroups.at(0)?.source;
      if (firstSource) {
        setSelectedSource(firstSource);
      }
    }
  }, [availableGroups]);

  return (
    <DetailsBox
      withPadding
      withBorder
      title={withTitle ? "Achievements" : ""}
      rightSide={
        <SegmentedControl
          value={selectedSource && String(selectedSource)}
          onChange={(value) => setSelectedSource(Number(value))}
          size={"sm"}
          data={
            availableGroups.map((group) => ({
              value: String(group.source),
              label: group.sourceAbbreviatedName,
            })) ?? []
          }
        />
      }
    >
      {isEmpty && (
        <CenteredErrorMessage
          message={"No obtained achievements found for this game."}
        />
      )}
      {selectedSource && !isEmpty && (
        <GameAchievementsList
          source={selectedSource}
          userId={userId}
          gameId={gameId}
        />
      )}
    </DetailsBox>
  );
};

export { CollectionEntryAchievementTracker };
