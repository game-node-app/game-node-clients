import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { AwardsBallotScreen } from "@repo/ui";

interface Props {
  eventYear: number | string;
}

const AwardsVotePage = ({ eventYear }: Props) => {
  const { t } = useTranslation();
  const eventYearNumber =
    typeof eventYear === "string" ? Number.parseInt(eventYear) : eventYear;

  return (
    <AppPage title={t("awards.ballot.title")} withSearch={false}>
      <AwardsBallotScreen eventYear={eventYearNumber} />
    </AppPage>
  );
};

export default AwardsVotePage;
