import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { ProfileStatsView } from "@repo/ui";

interface Props {
  userId: string;
}

const ProfileStatsPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  return (
    <AppPage title={t("navigation.stats")}>
      <ProfileStatsView userId={userId} />
    </AppPage>
  );
};

export default ProfileStatsPage;
