import React from "react";
import { AwardsResultScreen } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";

interface Props {
  eventYear: string | number;
}

const AwardsResultPage = ({ eventYear }: Props) => {
  const targetYear =
    typeof eventYear === "number" ? eventYear : Number.parseInt(eventYear);

  return (
    <AppPage title={"Awards Results"} withSearch={false}>
      <AwardsResultScreen
        eventYear={targetYear}
        eventId={undefined}
      ></AwardsResultScreen>
    </AppPage>
  );
};

export default AwardsResultPage;
