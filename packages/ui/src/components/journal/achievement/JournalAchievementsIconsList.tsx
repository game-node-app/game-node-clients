import React, { useMemo } from "react";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import { Group, Spoiler } from "@mantine/core";
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
      <Group className={"gap-1.5 w-full"}>{renderedContent}</Group>
    </Spoiler>
  );
};

export { JournalAchievementsIconsList };
