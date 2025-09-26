import React from "react";
import { useAwardEvent, useUserId } from "#@/components";
import { AwardsEventOverview } from "#@/components/awards/view/AwardsEventOverview.tsx";
import { Box, Stack } from "@mantine/core";
import { AwardsVoteLayout } from "#@/components/awards/view/AwardsVoteLayout.tsx";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AwardsEventCategoriesList } from "#@/components/awards/category/AwardsEventCategoriesList.tsx";
import { AwardsPhaseNotice } from "#@/components/awards/view/AwardsPhaseNotice.tsx";

interface Props {
  eventId: number | undefined;
  eventYear: number | undefined;
}

const AwardsEventVoteScreen = ({ eventYear, eventId }: Props) => {
  const userId = useUserId();
  const { data: event } = useAwardEvent({ eventYear, eventId });

  if (!event) {
    return;
  }

  return (
    <SessionAuth>
      <Stack className={"gap-4"}>
        <Box className={"w-full mt-8 lg:mt-14"}>
          <AwardsEventOverview eventId={event.id} />
        </Box>
        <Box className={"mt-10 lg:mt-8 w-screen xl:w-full -ms-2.5 xl:-ms-0"}>
          <AwardsVoteLayout
            userId={userId!}
            title={"Your Votes"}
            eventId={event.id}
          >
            <AwardsEventCategoriesList eventId={event.id} userId={userId!} />
          </AwardsVoteLayout>
        </Box>
        <AwardsPhaseNotice eventId={event.id} />
      </Stack>
    </SessionAuth>
  );
};

export { AwardsEventVoteScreen };
