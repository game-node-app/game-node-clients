import React from "react";
import { AwardsResultScreen } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";

interface Props {
  eventYear: string | number;
}

const AwardsResultPage = ({ eventYear }: Props) => {
  const { t } = useTranslation();
  const targetYear =
    typeof eventYear === "number" ? eventYear : Number.parseInt(eventYear);

  return (
    <AppPage title={t("mobile.awards.resultsTitle")} withSearch={false}>
      <AwardsResultScreen
        eventYear={targetYear}
        eventId={undefined}
      ></AwardsResultScreen>
    </AppPage>
  );
};

export default AwardsResultPage;
