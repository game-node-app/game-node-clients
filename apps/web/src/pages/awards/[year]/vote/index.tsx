import React from "react";
import { Stack } from "@mantine/core";
import { AwardsBallotScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsEventVotePage = () => {
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <AwardsBallotScreen eventYear={Number.parseInt(year as string)} />
    </Stack>
  );
};

export default AwardsEventVotePage;
