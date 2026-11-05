import { AppPage } from "@/components/general/AppPage";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { DailyArchiveView, isDailyMode } from "@repo/ui";
import { Redirect } from "react-router-dom";

interface Props {
  mode: string;
}

const DailyArchivePage = ({ mode }: Props) => {
  if (!isDailyMode(mode)) {
    return <Redirect to={getTabAwareHref("/daily")} />;
  }

  return (
    <AppPage>
      <DailyArchiveView mode={mode} />
    </AppPage>
  );
};

export default DailyArchivePage;
