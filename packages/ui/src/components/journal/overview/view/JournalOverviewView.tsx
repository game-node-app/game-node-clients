import React, { useMemo, useState } from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { CenteredLoading, SimpleInfiniteLoader } from "#@/components";

interface Props {
  userId: string;
}

const DEFAULT_LIMIT = 5;

const JournalOverviewView = ({ userId }: Props) => {
  const { data, isLoading } = useJournalOverview(userId);

  const [offset, setOffset] = useState(0);

  const nextOffset = offset + DEFAULT_LIMIT;

  const renderedItens = useMemo(() => {
    return data?.years.slice(offset, offset + DEFAULT_LIMIT) ?? [];
  }, [data, offset]);

  return (
    <Stack>
      {isLoading && <CenteredLoading message={"Loading Journal..."} />}
      {renderedItens.map((yearGroup) => (
        <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
      ))}
      <SimpleInfiniteLoader
        fetchNextPage={async () => setOffset(nextOffset)}
        isFetching={false}
        hasNextPage={data != undefined && data.years.length > nextOffset}
      />
    </Stack>
  );
};

export { JournalOverviewView };
