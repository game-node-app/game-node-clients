import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { DailyWeeklyView } from "@repo/ui";

const DailyWeeklyPage = () => {
  const { t } = useTranslation();
  return (
    <AppPage title={t("navigation.daily")}>
      <DailyWeeklyView />
    </AppPage>
  );
};

export default DailyWeeklyPage;
