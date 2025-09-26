import React from "react";
import { Box, Stack } from "@mantine/core";
import { useRouter } from "next/router";
import {
  AwardsNomineesScreen,
  AwardsNomineesVoteCTA,
  AwardsNomineesVotes,
  useUserProfile,
} from "@repo/ui";
import { AwardsNomineesOverview } from "@repo/ui";

const AwardsUserNomineesPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;

  const yearAsNumber = Number.parseInt(year as string);

  const userProfile = useUserProfile(userId as string);

  return <AwardsNomineesScreen eventId={1} userId={userId as string} />;
};

export default AwardsUserNomineesPage;
