import React from "react";
import { AwardsEventOverview, useRunningAwardEvent } from "#@/components";
import { Stack } from "@mantine/core";
import { AwardsRecentVotes } from "#@/components/awards/view/AwardsRecentVotes";
import { AwardsEventResultOverview } from "#@/components/awards/view/AwardsEventResultOverview";

/**
 * Component that dinamically renders the awards' vote CTA or result overview based on the event year
 * @constructor
 */
const DynamicAwardsOverview = () => {
  const { isResultsPeriod, isVotingPeriod, eventId } = useRunningAwardEvent();

  if (isVotingPeriod) {
    return (
      <Stack className={"w-fit"}>
        <AwardsEventOverview
          eventId={eventId!}
          withBackground={false}
          withButton
        />
        <AwardsRecentVotes eventId={eventId!} />
      </Stack>
    );
  }

  if (isResultsPeriod) {
    return <AwardsEventResultOverview eventId={eventId!} />;
  }

  return null;
};

export { DynamicAwardsOverview };
