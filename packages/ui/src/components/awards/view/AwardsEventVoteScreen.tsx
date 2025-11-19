import React from "react";
import { useAwardEvent, useUserId } from "#@/components";
import { AwardsEventOverview } from "#@/components/awards/view/AwardsEventOverview.tsx";
import { Box, Button, Stack, Text } from "@mantine/core";
import { AwardsVoteLayout } from "#@/components/awards/view/AwardsVoteLayout.tsx";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { AwardsEventCategoriesList } from "#@/components/awards/category/AwardsEventCategoriesList.tsx";
import { AwardsPhaseNotice } from "#@/components/awards/view/AwardsPhaseNotice.tsx";
import { Link } from "#@/util";
import { AwardsRecentVotes } from "#@/components/awards/view/AwardsRecentVotes";

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
          <AwardsEventOverview eventId={event.id} withButton={false} />
        </Box>
        <Link
          href={`/awards/${event.year}/nominees/${userId}`}
          className={"block w-full lg:w-40 mt-3"}
        >
          <Button color={"green"} fullWidth>
            Share your votes!
          </Button>
        </Link>
        <Text className={"text-dimmed mt-2 lg:hidden"}>
          Tap on a category to expand and vote for your favorite games.
        </Text>
        <Box className={"mt-6 lg:mt-8 xl:w-full"}>
          <AwardsVoteLayout
            userId={userId!}
            title={"Your Votes"}
            eventId={event.id}
          >
            <AwardsEventCategoriesList
              eventId={event.id}
              userId={userId!}
              isVotingPermitted={true}
            />
          </AwardsVoteLayout>
        </Box>

        <AwardsPhaseNotice eventId={event.id} />
        <AwardsRecentVotes eventId={event.id} />
      </Stack>
    </SessionAuth>
  );
};

export { AwardsEventVoteScreen };
