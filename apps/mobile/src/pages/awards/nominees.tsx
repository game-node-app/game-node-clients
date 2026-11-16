import { AppPage } from "@/components/general/AppPage.tsx";
import { useTranslation } from "@repo/locales";
import { AwardsSharedBallotScreen } from "@repo/ui";

interface Props {
  userId: string;
  eventYear: number | string;
}

const AwardsNomineesPage = ({ userId, eventYear }: Props) => {
  const { t } = useTranslation();
  const eventYearNumber =
    typeof eventYear === "string" ? Number.parseInt(eventYear) : eventYear;

  return (
    <AppPage title={t("awards.ballot.shared.heading")} withSearch={false}>
      <AwardsSharedBallotScreen
        eventYear={eventYearNumber}
        userId={userId}
      />
    </AppPage>
  );
};

export default AwardsNomineesPage;
