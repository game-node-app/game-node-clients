import React, { useMemo } from "react";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { Stack } from "@mantine/core";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { BackToTopButton, CenteredLoading } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const JournalOverviewView = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading } = useJournalOverview(userId);

  const renderedItens = useMemo(() => {
    return data?.years.map((yearGroup) => (
      <JournalOverviewYearGroup key={yearGroup.year} yearGroup={yearGroup} />
    ));
  }, [data]);

  return (
    <Stack>
      <BackToTopButton />
      {isLoading && <CenteredLoading message={t("journal.loading")} />}
      {renderedItens}
    </Stack>
  );
};

export { JournalOverviewView };
