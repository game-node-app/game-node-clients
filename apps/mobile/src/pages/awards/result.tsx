import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { AwardsResultsScreen } from "@repo/ui";

interface Props {
  eventYear: string | number;
}

const AwardsResultPage = ({ eventYear }: Props) => {
  const { t } = useTranslation();
  const targetYear =
    typeof eventYear === "number" ? eventYear : Number.parseInt(eventYear);

  return (
    <AppPage title={t("mobile.awards.resultsTitle")} withSearch={false}>
      <AwardsResultsScreen eventYear={targetYear} />
    </AppPage>
  );
};

export default AwardsResultPage;
