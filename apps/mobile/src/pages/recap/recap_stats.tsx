import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { useUserId, useUserProfile, YearRecapScreen } from "@repo/ui";

interface Props {
  year: number;
  userId: string;
}

const RecapStatsPage = ({ year, userId }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const profile = useUserProfile(userId);
  const isOwnRecap = ownUserId === userId;

  return (
    <AppPage
      title={
        isOwnRecap
          ? t("mobile.recap.titleOwn", { year })
          : t("mobile.recap.titleFor", {
              year,
              username: profile.data?.username ?? "",
            })
      }
    >
      <YearRecapScreen year={year} userId={userId} />
    </AppPage>
  );
};

export default RecapStatsPage;
