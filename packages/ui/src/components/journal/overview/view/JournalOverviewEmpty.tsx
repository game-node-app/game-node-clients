import { ListEmptyState } from "#@/components/general/ListEmptyState";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { buildPresenterComponent, useOpenGameSearch } from "#@/context";
import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconBook2 } from "@tabler/icons-react";

export interface JournalOverviewEmptyProps {
  userId: string;
}

/**
 * Empty journal. The journal is built from status changes on library entries (started, finished,
 * dropped), so the owner's next step is adding a game: the CTA opens the game search. Visitors
 * of someone else's journal get no action, because there is nothing they can do about it.
 */
const DEFAULT_JournalOverviewEmpty = ({
  userId,
}: JournalOverviewEmptyProps) => {
  const { t } = useTranslation();
  const openGameSearch = useOpenGameSearch();
  const isOwn = useUserId() === userId;

  return (
    <ListEmptyState
      icon={<IconBook2 size={28} />}
      title={t("journal.overview.emptyTitle")}
      description={t("journal.overview.emptyDescription")}
      action={
        isOwn && openGameSearch ? (
          <Button radius="xl" onClick={openGameSearch}>
            {t("journal.overview.emptyAction")}
          </Button>
        ) : undefined
      }
    />
  );
};

const JournalOverviewEmpty = buildPresenterComponent(
  "JournalOverviewEmpty",
  DEFAULT_JournalOverviewEmpty,
);

export { JournalOverviewEmpty };
