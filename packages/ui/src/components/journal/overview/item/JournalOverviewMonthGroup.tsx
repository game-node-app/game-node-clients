import React, { useMemo } from "react";
import type { JournalEntryMonthGroupDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { Divider, Stack, Title } from "@mantine/core";
import { JournalOverviewItem } from "#@/components";

interface Props {
  year: number;
  monthGroup: JournalEntryMonthGroupDto;
}

const JournalOverviewMonthGroup = ({ monthGroup, year }: Props) => {
  const targetMonth = monthGroup.month;
  const targetMonthName = useMemo(
    () => dayjs(`${targetMonth + 1}/01/${year}`).format("MMMM"),
    [targetMonth, year],
  );

  const itensInMonth = useMemo(() => {
    return monthGroup.days.flatMap((dayGroup) => {
      return dayGroup.entries.map((entry) => ({
        targetDay: dayGroup.day,
        entry,
      }));
    });
  }, [monthGroup.days]);

  const renderedItens = useMemo(() => {
    return itensInMonth.map(({ targetDay, entry }) => (
      <JournalOverviewItem
        key={`${entry.collectionEntryId}-${entry.status}`}
        targetDay={targetDay}
        item={entry}
      />
    ));
  }, [itensInMonth]);

  return (
    <Stack className={"gap-2"}>
      <Title size={"h5"} className={"text-white"}>
        {targetMonthName}
      </Title>
      {renderedItens}
    </Stack>
  );
};

export { JournalOverviewMonthGroup };
