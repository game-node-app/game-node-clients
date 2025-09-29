import React from "react";
import {
  AwardsNomineesOverview,
  AwardsNomineesVoteCTA,
  AwardsNomineesVotes,
  useAwardEvent,
} from "#@/components";
import { Stack } from "@mantine/core";
import { AwardsNomineesShareButtons } from "#@/components/awards/view/AwardsNomineesShareButtons.tsx";

interface Props {
  eventId: number;
  userId: string;
}

const AwardsNomineesScreen = ({ eventId, userId }: Props) => {
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Stack className={"overflow-clip"}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100%",
          background:
            "#212121 linear-gradient(180deg, rgba(33, 33, 33, 1) 50%, rgba(9, 9, 9, 1) 100%)",
          zIndex: -1,
          opacity: 1,
        }}
      />
      <AwardsNomineesOverview eventId={eventId} userId={userId} />
      <AwardsNomineesVotes eventId={eventId} userId={userId} />
      <AwardsNomineesShareButtons
        userId={userId}
        eventId={eventId}
        className={"my-10"}
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
      <AwardsNomineesVoteCTA eventId={eventId} />
    </Stack>
  );
};

export { AwardsNomineesScreen };
