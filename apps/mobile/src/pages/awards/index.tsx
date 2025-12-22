import React from "react";
import { CenteredLoading, useAwardEventRedirect } from "@repo/ui";

interface Props {
  eventYear: string | number;
}

const AwardsEventRedirectPage = ({ eventYear }: Props) => {
  const targetYear =
    typeof eventYear === "number" ? eventYear : Number.parseInt(eventYear);
  useAwardEventRedirect(targetYear);

  return <CenteredLoading />;
};

export default AwardsEventRedirectPage;
