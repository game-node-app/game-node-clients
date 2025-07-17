import React from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { CenteredLoading } from "#@/components";

interface Props {
  userId: string;
}

const JournalOverviewView = ({ userId }: Props) => {
  const { data, isLoading } = useJournalOverview(userId);
  return (
    <Stack>
      {isLoading && <CenteredLoading message={"Loading Journal..."} />}
      {data?.years.map((yearGroup) => (
        <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
      ))}
    </Stack>
  );
};

export { JournalOverviewView };
