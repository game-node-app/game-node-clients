import React from "react";
import { useRouter } from "next/router";
import { CenteredLoading, useAwardEventRedirect } from "@repo/ui";

const AwardsEventPage = () => {
  const router = useRouter();
  const { year } = router.query;
  const eventYear = Array.isArray(year) ? undefined : Number(year);
  useAwardEventRedirect(eventYear);

  return <CenteredLoading />;
};

export default AwardsEventPage;
