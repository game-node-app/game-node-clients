import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { DailyPracticeView, isDailyPracticeMode } from "@repo/ui";
import { Redirect } from "react-router-dom";

interface Props {
  mode: string;
}

const DailyPracticePage = ({ mode }: Props) => {
  const { t } = useTranslation();
  // Practice only exists for Cover and Specs.
  if (!isDailyPracticeMode(mode)) {
    return <Redirect to={getTabAwareHref("/daily")} />;
  }

  return (
    <AppPage title={t("navigation.daily")}>
      <DailyPracticeView mode={mode} />
    </AppPage>
  );
};

export default DailyPracticePage;
