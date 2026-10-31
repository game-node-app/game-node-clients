import { JournalAchievementsYearGroupView } from "#@/components";
import { Stack } from "@mantine/core";
import { JournalAchievementsYearGroup } from "@repo/wrapper/server";

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