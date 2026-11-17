import { AppPage } from "@/components/general/AppPage";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { IonButton } from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  DAILY_RANKING_PERIODS,
  DailyRankingPeriod,
  DailyRankingQuery,
  DailyRankingScoringModal,
  DailyRankingView,
  isDailyMode,
} from "@repo/ui";
import { IconHelpCircle } from "@tabler/icons-react";

const DailyRankingPage = () => {
  const { t } = useTranslation();
  const searchParameters = useSearchParameters();
  const [scoringOpened, scoring] = useDisclosure(false);

  const initialFilters: Partial<DailyRankingQuery> = {};
  const mode = searchParameters.get("mode");
  const period = searchParameters.get("period") as DailyRankingPeriod;
  if (isDailyMode(mode)) initialFilters.mode = mode;
  if (DAILY_RANKING_PERIODS.includes(period)) initialFilters.period = period;
  if (searchParameters.get("scope") === "following") {
    initialFilters.scope = "following";
  }

  return (
    <AppPage
      title={t("daily.ranking.title")}
      withSearch={false}
      endButtons={
        <IonButton
          onClick={scoring.open}
          aria-label={t("daily.ranking.scoring.title")}
        >
          <IconHelpCircle size={22} />
        </IonButton>
      }
    >
      <DailyRankingView initialFilters={initialFilters} withHeader={false} />
      <DailyRankingScoringModal
        opened={scoringOpened}
        onClose={scoring.close}
      />
    </AppPage>
  );
};

export default DailyRankingPage;
