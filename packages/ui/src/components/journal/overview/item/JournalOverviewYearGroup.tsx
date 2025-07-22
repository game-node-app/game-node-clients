import React, { useMemo } from "react";
import type { JournalEntryYearGroupDto } from "@repo/wrapper/server";
import { Divider, Group, Stack, Text, Title } from "@mantine/core";
import { JournalOverviewMonthGroup } from "#@/components";

interface Props {
  yearGroup: JournalEntryYearGroupDto;
}

const JournalOverviewYearGroup = ({ yearGroup }: Props) => {
  const targetYear = yearGroup.year;

  const totalGames = useMemo(() => {
    const gameIds = yearGroup.months
      .flatMap((monthGroup) => monthGroup.days)
      .flatMap((dayGroup) => dayGroup.entries)
      .flatMap((entries) => entries.gameId);

    return new Set(gameIds).size;
  }, [yearGroup.months]);

  const renderedItens = useMemo(() => {
    return yearGroup.months.map((monthGroup) => (
      <JournalOverviewMonthGroup
        key={monthGroup.month}
        year={targetYear}
        monthGroup={monthGroup}
      />
    ));
  }, [targetYear, yearGroup.months]);

  return (
    <Stack className={"gap-0 ps-2"}>
      <Group className={"gap-3"}>
        <Title size={"h4"} fw={"bold"} className={"text-white"}>
          {targetYear}
        </Title>
        <Text className={"text-sm text-dimmed"}>{totalGames} games</Text>
      </Group>
      <Divider className={"w-full mt-2 mb-5"} />
      <Stack className={"gap-3"}>{renderedItens}</Stack>
    </Stack>
  );
};

export { JournalOverviewYearGroup };
