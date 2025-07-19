import React from "react";
import type { JournalEntryYearGroupDto } from "@repo/wrapper/server";
import { Divider, Stack, Title } from "@mantine/core";
import { JournalOverviewMonthGroup } from "#@/components";
import "./journal-overview.css";

interface Props {
  yearGroup: JournalEntryYearGroupDto;
}

const JournalOverviewYearGroup = ({ yearGroup }: Props) => {
  const targetYear = yearGroup.year;

  return (
    <Stack className={"journal-overview-group"}>
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
