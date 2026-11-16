import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { AwardsNominationsScreen } from "@repo/ui";

interface Props {
  eventYear: string | number;
}

const AwardsNominationsPage = ({ eventYear }: Props) => {
  const { t } = useTranslation();
  const targetYear =
    typeof eventYear === "number" ? eventYear : Number.parseInt(eventYear);

  return (
    <AppPage title={t("mobile.awards.nominationsTitle")} withSearch={false}>
      <AwardsNominationsScreen eventYear={targetYear} />
    </AppPage>
  );
};

export default AwardsNominationsPage;
