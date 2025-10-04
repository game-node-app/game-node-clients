import React from "react";
import { AppPage } from "@/components/general/AppPage.tsx";
import { AwardsEventVoteScreen } from "@repo/ui";

interface Props {
  eventYear: number | string;
}

const AwardsVotePage = ({ eventYear }: Props) => {
  const eventYearNumber =
    typeof eventYear === "string" ? Number.parseInt(eventYear) : eventYear;

  return (
    <AppPage>
      <AwardsEventVoteScreen eventId={undefined} eventYear={eventYearNumber} />
    </AppPage>
  );
};

export default AwardsVotePage;
