import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { AchievementsScreen, useUserProfile } from "@repo/ui";

interface Props {
  userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  useUserProfile(userId);
  return (
    <AppPage title={t("navigation.feats")} withSearch>
      <AchievementsScreen targetUserId={userId} />
    </AppPage>
  );
};

export default AchievementsPage;
