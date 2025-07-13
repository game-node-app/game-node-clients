import React from "react";
import type { JournalEntryMonthGroupDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { Divider, Stack, Title } from "@mantine/core";
import { JournalOverviewDayGroup } from "#@/components/journal/overview/item/JournalOverviewDayGroup.tsx";

interface Props {
  year: number;
  monthGroup: JournalEntryMonthGroupDto;
}

const JournalOverviewMonthGroup = ({ monthGroup, year }: Props) => {
  const targetMonth = monthGroup.month;
  const targetMonthName = dayjs(`${targetMonth + 1}/01/${year}`).format("MMMM");

  return (
    <Stack className={"ps-1"}>
      <Title size={"h4"}>{targetMonthName}</Title>
      {monthGroup.days.map((dayGroup) => (
        <JournalOverviewDayGroup key={dayGroup.day} dayGroup={dayGroup} />
      ))}
    </Stack>
  );
};

export { JournalOverviewMonthGroup };
