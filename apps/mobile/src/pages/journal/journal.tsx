import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { JournalOverviewView, useUserId, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
}

const JournalPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  useUserId();

  useUserProfile(userId);

  return (
    <AppPage title={t("navigation.journal")}>
      <JournalOverviewView userId={userId} />
    </AppPage>
  );
};

export { JournalPage };
