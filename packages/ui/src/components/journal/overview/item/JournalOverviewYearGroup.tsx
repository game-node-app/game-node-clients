import React from "react";
import type { JournalEntryYearGroupDto } from "@repo/wrapper/server";
import { Divider, Stack, Title } from "@mantine/core";
import { JournalOverviewMonthGroup } from "#@/components/journal/overview/item/JournalOverviewMonthGroup.tsx";

interface Props {
  yearGroup: JournalEntryYearGroupDto;
}

const JournalOverviewYearGroup = ({ yearGroup }: Props) => {
  const targetYear = yearGroup.year;

  return (
    <Stack>
      <Title size={"h4"} fw={"bold"}>
        {targetYear}
      </Title>
      {yearGroup.months.map((monthGroup) => (
        <JournalOverviewMonthGroup
          key={monthGroup.month}
          year={targetYear}
          monthGroup={monthGroup}
        />
      ))}
    </Stack>
  );
};

export { JournalOverviewYearGroup };
