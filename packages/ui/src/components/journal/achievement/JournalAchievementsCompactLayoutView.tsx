import React, { useMemo } from "react";
import {
  JournalAchievementsGameGroup,
  JournalAchievementsYearGroup,
} from "@repo/wrapper/server";
import { Stack } from "@mantine/core";
import { JournalAchievementsGameGroupView } from "#@/components";

interface Props {
  userId: string;
  groups: JournalAchievementsYearGroup[];
}

const JournalAchievementsCompactLayoutView = ({ userId, groups }: Props) => {
  const gameGroups = useMemo(() => {
    /**
     * Flatten the groups into a single array of game groups, ignoring the year and month grouping.
     * As such, the same game may appear in multiple groups if achievements were obtained in different months.
     */
    const gameGroups = groups
      .flatMap((year) => year.months)
      .flatMap((month) => month.games);

    /**
     * Flatten the groups to avoid rendering multiple components for the same game.
     */
    const groupedOnlyByExternalGameId = Map.groupBy(
      gameGroups,
      (g) => g.externalGameId,
    );

    const gameGroupsFlattened: JournalAchievementsGameGroup[] = Array.from(
      groupedOnlyByExternalGameId.entries(),
    ).map(([externalGameId, groups]) => {
      const allObtainedAchievements = groups.flatMap((g) => g.achievements);

      return {
        gameId: groups[0].gameId,
        externalGameId: externalGameId,
        source: groups[0].source,
        sourceIcon: groups[0].sourceIcon,
        sourceName: groups[0].sourceName,
        sourceAbbreviatedName: groups[0].sourceAbbreviatedName,
        isComplete: groups.some((g) => g.isComplete),
        isPlatinum: groups.some((g) => g.isPlatinum),
        achievements: allObtainedAchievements,
      };
    });

    return gameGroupsFlattened;
  }, [groups]);

  return (
    <Stack className={"gap-2 w-full"}>
      {gameGroups.map((gameGroup) => (
        <JournalAchievementsGameGroupView
          key={`${gameGroup.gameId}`}
          userId={userId}
          gameGroup={gameGroup}
        />
      ))}
    </Stack>
  );
};

export { JournalAchievementsCompactLayoutView };
