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

  useUserProfile(userId as string);

  if (!event) {
    return;
  }

  return (
    <Stack className={"w-full mb-12"}>
      <AwardsNomineesScreen
        eventId={event.id}
        userId={userId as string}
        onShare={async (file) => {
          const toShare: ShareData = {
            title: "GameNode Share",
            text: `Create yours at https://gamenode.app/awards/${event?.year}/vote`,
            files: [file],
            url: `https://gamenode.app/awards/${event?.year}/vote`,
          };

          return await navigator.share(toShare);
        }}
      />
    </Stack>
  );
};

export default AwardsUserNomineesPage;
