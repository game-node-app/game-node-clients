import React from "react";
import { AwardsEventCategoriesList, AwardsVoteLayout } from "#@/components";
import { Box } from "@mantine/core";

interface Props {
  eventId: number;
  userId: string;
}

const AwardsNomineesVotes = ({ eventId, userId }: Props) => {
  return (
    <Box className={"mt-8 lg:w-screen xl:w-full -ms-2.5 xl:-ms-0"}>
      <AwardsVoteLayout eventId={eventId} userId={userId} title={"Nominees"}>
        <AwardsEventCategoriesList eventId={eventId} userId={userId!} />
      </AwardsVoteLayout>
    </Box>
  );
};

export { AwardsNomineesVotes };
