import { AppPage } from "@/components/general/AppPage";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { DailyPlayView, isDailyMode } from "@repo/ui";
import { Redirect } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

interface Props {
  mode: string;
}

const DailyPlayPage = ({ mode }: Props) => {
  const searchParameters = useSearchParameters();
  const puzzleId = Number(searchParameters.get("puzzle")) || undefined;

  if (!isDailyMode(mode)) {
    return <Redirect to={getTabAwareHref("/daily")} />;
  }

  return (
    <AppPage>
      <DailyPlayView mode={mode} puzzleId={puzzleId} />
    </AppPage>
  );
};

export default DailyPlayPage;
