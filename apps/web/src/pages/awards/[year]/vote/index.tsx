import React from "react";
import { Stack } from "@mantine/core";
import { AwardsEventVoteScreen } from "@repo/ui";
import { useRouter } from "next/router";

const AwardsEventVotePage = () => {
  const router = useRouter();
  const { year } = router.query;

  return (
    <Stack>
      <AwardsEventVoteScreen
        eventId={undefined}
        eventYear={Number.parseInt(year as string)}
      />
    </Stack>
  );
};

export default AwardsEventVotePage;
