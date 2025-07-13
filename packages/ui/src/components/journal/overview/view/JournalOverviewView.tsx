import React from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";

interface Props {
  userId: string;
}

const JournalOverviewView = ({ userId }: Props) => {
  const { data } = useJournalOverview(userId);
  return (
    <Stack>
      {data?.years.map((yearGroup) => (
        <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
      ))}
    </Stack>
  );
};

export { JournalOverviewView };
