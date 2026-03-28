import React, { useMemo } from "react";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import { SimpleGrid, Spoiler } from "@mantine/core";
import { GameAchievementHoverIcon } from "#@/components";

interface Props {
  achievements: GameAchievementWithObtainedInfo[];
}

const JournalAchievementsIconsList = ({ achievements }: Props) => {
  const renderedContent = useMemo(() => {
    return achievements.map((achievement) => (
      <GameAchievementHoverIcon
        key={achievement.externalId}
        achievement={achievement}
      />
    ));
  }, [achievements]);

  return (
    <Spoiler
      maxHeight={56}
      hideLabel={"Show less"}
      showLabel={"Show more"}
      transitionDuration={200}
      classNames={{ control: "mt-2" }}
    >
      <SimpleGrid
        cols={{ base: 6, xs: 12, md: 15 }}
        className={"gap-1 gap-y-3 w-full"}
      >
        {renderedContent}
      </SimpleGrid>
    </Spoiler>
  );
};

export { JournalAchievementsIconsList };
