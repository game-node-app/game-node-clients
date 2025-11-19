import React, { useMemo } from "react";
import dayjs from "dayjs";
import { AwardsEventOverview, useAwardEvent } from "#@/components";
import { Box, Stack } from "@mantine/core";
import { AwardsRecentVotes } from "#@/components/awards/view/AwardsRecentVotes";

/**
 * Component that dinamically renders the awards' vote CTA or result overview based on the event year
 * @constructor
 */
const DynamicAwardsOverview = () => {
  const targetYear = useMemo(() => {
    // Shows last year event if the current month is before March (non-inclusive)
    if (dayjs().month() + 1 < 3) {
      return dayjs().subtract(1, "year").year();
    }

    return dayjs().year();
  }, []);

  const { data: event } = useAwardEvent({ eventYear: targetYear });

  const isResultAvailable =
    event != undefined && dayjs().isAfter(dayjs(event?.resultsDate));

  const isVotingPermitted =
    event != undefined &&
    dayjs().isAfter(event.votingStartDate) &&
    dayjs().isBefore(dayjs(event?.votingEndDate));

  if (!event) {
    return null;
  }

  if (isVotingPermitted || !isResultAvailable) {
    return (
      <Stack className={"w-fit"}>
        <AwardsEventOverview
          eventId={event.id}
          withBackground={false}
          withButton
        />
        <AwardsRecentVotes eventId={event.id} limit={3} />
      </Stack>
    );
  }

  return null;
};

export { DynamicAwardsOverview };
