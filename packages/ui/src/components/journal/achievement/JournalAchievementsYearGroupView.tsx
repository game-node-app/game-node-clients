import React from "react";
import { JournalAchievementsYearGroup } from "@repo/wrapper/server";
import { Divider, Group, Stack, Text, Title } from "@mantine/core";
import { JournalAchievementsMonthGroupView } from "#@/components/journal/achievement/JournalAchievementsMonthGroupView";

interface Props {
  userId: string;
  yearGroup: JournalAchievementsYearGroup;
}

const JournalAchievementsYearGroupView = ({ userId, yearGroup }: Props) => {
  return (
    <Stack className={"gap-0"}>
      <Group className={"gap-3"}>
        <Title size={"h4"} fw={"bold"} className={"text-white"}>
          {yearGroup.year}
        </Title>
        <Text className={"text-sm text-dimmed"}>
          {yearGroup.totalObtained} achievements
        </Text>
      </Group>
      <Divider className={"w-full mt-2 mb-5"} />
      <Stack className={"gap-3"}>
        {yearGroup.months.map((monthGroup) => (
          <JournalAchievementsMonthGroupView
            key={monthGroup.month}
            userId={userId}
            year={yearGroup.year}
            monthGroup={monthGroup}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export { JournalAchievementsYearGroupView };
