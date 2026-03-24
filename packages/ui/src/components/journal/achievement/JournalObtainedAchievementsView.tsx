import React from "react";
import {
  BackToTopButton,
  JournalAchievementsYearGroupView,
  useJournalObtainedAchievements,
} from "#@/components";
import { Stack } from "@mantine/core";

interface Props {
  userId: string;
}

/**
 * Render a list of obtained achievements grouped by year and month, then by game.
 * @param userId
 * @constructor
 */
const JournalObtainedAchievementsView = ({ userId }: Props) => {
  const { data: achievementGroups } = useJournalObtainedAchievements(userId);

  return (
    <Stack className={"gap-1.5 h-full w-full"}>
      <BackToTopButton />
      {achievementGroups?.years?.map((yearGroup) => (
        <JournalAchievementsYearGroupView
          key={`${userId}_${yearGroup.year}`}
          userId={userId}
          yearGroup={yearGroup}
        />
      ))}
    </Stack>
  );
};

export { JournalObtainedAchievementsView };
