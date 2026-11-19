import { ListEmptyState } from "@/components/general/card";
import { IonButton } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { JournalOverviewEmptyProps, useRouter, useUserId } from "@repo/ui";
import { IconBook2 } from "@tabler/icons-react";

/**
 * Empty journal. The journal is built from status changes on library entries (started, finished,
 * dropped), so the owner's next step is adding a game: the CTA opens the game search. Visitors
 * of someone else's journal get no action, because there is nothing they can do about it.
 */
const MobileJournalOverviewEmpty = ({ userId }: JournalOverviewEmptyProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isOwn = useUserId() === userId;

  return (
    <ListEmptyState
      className="mx-0"
      icon={<IconBook2 size={28} />}
      title={t("journal.overview.emptyTitle")}
      description={t("journal.overview.emptyDescription")}
      action={
        isOwn ? (
          <IonButton shape="round" onClick={() => void router.push("/search")}>
            {t("journal.overview.emptyAction")}
          </IonButton>
        ) : undefined
      }
    />
  );
};

export { MobileJournalOverviewEmpty };
