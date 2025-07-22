import React, { useMemo } from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { BackToTopButton, CenteredLoading } from "#@/components";

interface Props {
  userId: string;
}

const JournalOverviewView = ({ userId }: Props) => {
  const { data, isLoading } = useJournalOverview(userId);

  const renderedItens = useMemo(() => {
    return data?.years.map((yearGroup) => (
      <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
    ));
  }, [data]);

  return (
    <Stack>
      <BackToTopButton />
      {isLoading && <CenteredLoading message={"Loading Journal..."} />}
      {renderedItens}
    </Stack>
  );
};

export { JournalOverviewView };
