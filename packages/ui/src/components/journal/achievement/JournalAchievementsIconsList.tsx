import React, { useMemo } from "react";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import { SimpleGrid, Spoiler } from "@mantine/core";
import { GameAchievementHoverIcon } from "#@/components";

interface Props {
  achievements: GameAchievementWithObtainedInfo[];
}

const JournalAchievementsIconsList = ({ achievements }: Props) => {
  console.log("JournalAchievementsIconsList render", achievements.length);

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
      classNames={{ control: "mt-2", root: "w-full @container" }}
    >
      <SimpleGrid
        className={
          "gap-1 gap-y-3 w-full grid-cols-6 @xs:grid-cols-8 @sm:grid-cols-12 @md:grid-cols-[repeat(15,minmax(0,1fr))] @lg:grid-cols-[repeat(18,minmax(0,1fr))]"
        }
      >
        {renderedContent}
      </SimpleGrid>
    </Spoiler>
  );
};

export { JournalAchievementsIconsList };
