import React from "react";
import { JournalAchievementsYearGroup } from "@repo/wrapper/server";
import { Stack } from "@mantine/core";
import { JournalAchievementsYearGroupView } from "#@/components";

interface Props {
  userId: string;
  groups: JournalAchievementsYearGroup[];
}

const JournalAchievementsDetailedLayoutView = ({ userId, groups }: Props) => {
  return (
    <Stack className={"gap-2 w-full"}>
      {groups.map((yearGroup) => (
        <JournalAchievementsYearGroupView
          key={yearGroup.year}
          userId={userId}
          yearGroup={yearGroup}
        />
      ))}
    </Stack>
  );
};

export { JournalAchievementsDetailedLayoutView };
