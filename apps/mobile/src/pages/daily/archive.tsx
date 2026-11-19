import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { DailyArchiveView, isDailyMode } from "@repo/ui";
import { Redirect } from "react-router-dom";

interface Props {
  mode: string;
}

const DailyArchivePage = ({ mode }: Props) => {
  const { t } = useTranslation();
  if (!isDailyMode(mode)) {
    return <Redirect to={getTabAwareHref("/daily")} />;
  }

  return (
    <AppPage title={t("navigation.daily")}>
      <DailyArchiveView mode={mode} />
    </AppPage>
  );
};

export default DailyArchivePage;
