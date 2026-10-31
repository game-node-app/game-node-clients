import { BackToTopButton, CenteredLoading } from "#@/components";
import { useJournalOverview } from "#@/components/journal/hooks/useJournalOverview.ts";
import { JournalOverviewYearGroup } from "#@/components/journal/overview/item/JournalOverviewYearGroup.tsx";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

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