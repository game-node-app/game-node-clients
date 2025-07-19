import React, { useMemo } from "react";
import { JournalPlaylogEntryDto } from "@repo/wrapper/server";
import { GameAchievementHoverIcon } from "#@/components";
import { Group, Image } from "@mantine/core";

interface Props {
  items: JournalPlaylogEntryDto[];
}

const JournalPlaylogObtainedAchievements = ({ items }: Props) => {
  const renderedAchievements = items.map((item) => item.obtainedAchievement!);

  return (
    <Group className={"w-full gap-2 bg-paper p-4"}>
      {renderedAchievements.map((achievement) => (
        <GameAchievementHoverIcon
          key={`${achievement.externalGameId}-${achievement.externalId}`}
          achievement={achievement}
        />
      ))}
    </Group>
  );
};

export { JournalPlaylogObtainedAchievements };
