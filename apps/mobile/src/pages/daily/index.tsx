import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { DailyHomeView } from "@repo/ui";

const DailyPage = () => {
  const { t } = useTranslation();
  return (
    <AppPage title={t("navigation.daily")}>
      <DailyHomeView />
    </AppPage>
  );
};

export default DailyPage;
