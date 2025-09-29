import React from "react";
import { Box, Stack } from "@mantine/core";
import { useRouter } from "next/router";
import {
  AwardsNomineesScreen,
  AwardsNomineesVoteCTA,
  AwardsNomineesVotes,
  useAwardEvent,
  useUserProfile,
} from "@repo/ui";
import { AwardsNomineesOverview } from "@repo/ui";

const AwardsUserNomineesPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;

  const yearAsNumber = Number.parseInt(year as string);

  const { data: event } = useAwardEvent({ eventYear: yearAsNumber });

  const userProfile = useUserProfile(userId as string);

  return (
    <Stack className={"w-full mb-12"}>
      <AwardsNomineesScreen eventId={1} userId={userId as string} />
    </Stack>
  );
};

export default AwardsUserNomineesPage;
