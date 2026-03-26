import React, { useMemo } from "react";
import { JournalAchievementsMonthGroup } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { Stack, Title } from "@mantine/core";
import { JournalAchievementsGameGroupView } from "#@/components/journal/achievement/JournalAchievementsGameGroupView";

interface Props {
  userId: string;
  year: number;
  monthGroup: JournalAchievementsMonthGroup;
}

const JournalAchievementsMonthGroupView = ({
  userId,
  year,
  monthGroup,
}: Props) => {
  const targetMonth = monthGroup.month;
  const targetMonthName = useMemo(
    () => dayjs(`${targetMonth + 1}/01/${year}`).format("MMMM"),
    [targetMonth, year],
  );

  const renderedContent = useMemo(() => {
    return monthGroup.games.map((gameGroup) => (
      <JournalAchievementsGameGroupView
        key={`${year}_${monthGroup.month}_${gameGroup.gameId}`}
        userId={userId}
        gameGroup={gameGroup}
      />
    ));
  }, [monthGroup.games, monthGroup.month, userId, year]);

  return (
    <Stack className={"gap-2"}>
      <Title size={"h5"} className={"text-white"}>
        {targetMonthName}
      </Title>
      {renderedContent}
    </Stack>
  );
};

export { JournalAchievementsMonthGroupView };
