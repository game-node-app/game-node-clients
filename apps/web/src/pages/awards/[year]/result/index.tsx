import React from "react";
import { AwardsResultScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsResultPage = () => {
  const router = useRouter();
  const { year } = router.query;

  return (
    <AwardsResultScreen
      eventYear={Number.parseInt(year as string)}
      eventId={undefined}
    ></AwardsResultScreen>
  );
};

export default AwardsResultPage;
