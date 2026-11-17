import { AppPage } from "@/components/general/AppPage";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { DailyPracticeView, isDailyPracticeMode } from "@repo/ui";
import { Redirect } from "react-router-dom";

interface Props {
  mode: string;
}

const DailyPracticePage = ({ mode }: Props) => {
  // Practice only exists for Cover and Specs.
  if (!isDailyPracticeMode(mode)) {
    return <Redirect to={getTabAwareHref("/daily")} />;
  }

  return (
    <AppPage>
      <DailyPracticeView mode={mode} />
    </AppPage>
  );
};

export default DailyPracticePage;
