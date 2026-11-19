import { ListEmptyState } from "@/components/general/card";
import { useTranslation } from "@repo/locales";
import { IconBook2 } from "@tabler/icons-react";

const MobileJournalOverviewEmpty = () => {
  const { t } = useTranslation();
  return (
    <ListEmptyState
      className="mx-0"
      icon={<IconBook2 size={28} />}
      title={t("journal.overview.emptyTitle")}
      description={t("journal.overview.emptyDescription")}
    />
  );
};

export { MobileJournalOverviewEmpty };
