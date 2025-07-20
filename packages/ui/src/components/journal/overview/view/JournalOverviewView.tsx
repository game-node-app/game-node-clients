import React, { useMemo, useState } from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { CenteredLoading, SimpleInfiniteLoader } from "#@/components";

interface Props {
  userId: string;
}

const DEFAULT_LIMIT = 20;

const JournalOverviewView = ({ userId }: Props) => {
  const { data, isLoading } = useJournalOverview(userId);

  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const nextLimit = limit + DEFAULT_LIMIT;

  const renderedItens = useMemo(() => {
    return data?.years.slice(0, limit) ?? [];
  }, [data, limit]);

  return (
    <Stack>
      {isLoading && <CenteredLoading message={"Loading Journal..."} />}
      {renderedItens.map((yearGroup) => (
        <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
      ))}
      <SimpleInfiniteLoader
        fetchNextPage={async () => setLimit(nextLimit)}
        isFetching={false}
        hasNextPage={data != undefined && data.years.length > nextLimit}
      />
    </Stack>
  );
};

export { JournalOverviewView };
