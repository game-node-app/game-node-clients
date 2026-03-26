import React from "react";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Box, Group, Spoiler } from "@mantine/core";
import { GameAchievementHoverIcon, useOnMobile } from "#@/components";

interface Props {
  achievements: GameAchievementWithObtainedInfo[];
}

const JournalAchievementsIconsList = ({ achievements }: Props) => {
  return (
    <Spoiler
      maxHeight={56}
      hideLabel={"Show less"}
      showLabel={"Show more"}
      transitionDuration={200}
    >
      <Group className={"gap-1.5 mb-2 w-full"}>
        {achievements.map((achievement) => (
          <GameAchievementHoverIcon
            key={achievement.externalId}
            achievement={achievement}
          />
        ))}
      </Group>
    </Spoiler>
  );
};

export { JournalAchievementsIconsList };
