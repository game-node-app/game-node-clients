import React from "react";
import {
  AwardsNomineesOverview,
  AwardsNomineesVoteCTA,
  AwardsNomineesVotes,
  useAwardEvent,
} from "#@/components";
import { Stack } from "@mantine/core";
import { AwardsNomineesShareButtons } from "#@/components/awards/view/AwardsNomineesShareButtons.tsx";
import { AwardsRecentVotes } from "#@/components/awards/view/AwardsRecentVotes";

interface Props {
  eventId: number;
  userId: string;
  onShare: (file: File) => Promise<void>;
}

const AwardsNomineesScreen = ({ eventId, userId, onShare }: Props) => {
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Stack className={"mb-10"}>
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
        onShare={onShare}
      />
      <AwardsNomineesVoteCTA eventId={eventId} />
      <AwardsRecentVotes eventId={eventId} />
    </Stack>
  );
};

export { AwardsNomineesScreen };
