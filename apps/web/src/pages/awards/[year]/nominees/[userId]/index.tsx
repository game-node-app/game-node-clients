import React from "react";
import { Stack } from "@mantine/core";
import { useRouter } from "next/router";
import { useUserProfile } from "@repo/ui";
import { AwardsNomineesOverview } from "@repo/ui";

const AwardsUserNomineesPage = () => {
  const router = useRouter();
  const { year, userId } = router.query;

  const yearAsNumber = Number.parseInt(year as string);

  const userProfile = useUserProfile(userId as string);

  return (
    <Stack>
      <AwardsNomineesOverview eventId={1} userId={userId as string} />
    </Stack>
  );
};

export default AwardsUserNomineesPage;
