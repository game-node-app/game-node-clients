import React from "react";
import {
  AwardsNomineesOverview,
  AwardsNomineesVoteCTA,
  AwardsNomineesVotes,
} from "#@/components";
import { Box, Stack } from "@mantine/core";
import "./AwardsNomineesScreen.css";

interface Props {
  eventId: number;
  userId: string;
}

const AwardsNomineesScreen = ({ eventId, userId }: Props) => {
  return (
    <Stack className={"overflow-hidden"}>
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
      <AwardsNomineesVoteCTA />
    </Stack>
  );
};

export { AwardsNomineesScreen };
