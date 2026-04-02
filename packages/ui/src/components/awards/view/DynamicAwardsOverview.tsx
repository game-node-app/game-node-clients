import React from "react";
import { AwardsEventOverview, useRunningAwardEvent } from "#@/components";
import { Stack, Text } from "@mantine/core";
import { AwardsRecentVotes } from "#@/components/awards/view/AwardsRecentVotes";
import { AwardsEventResultOverview } from "#@/components/awards/view/AwardsEventResultOverview";
import { useTranslation } from "@repo/locales";

/**
 * Component that dinamically renders the awards' vote CTA or result overview based on the event year
 * @constructor
 */
const DynamicAwardsOverview = () => {
  const { t } = useTranslation();
  const { isResultsPeriod, isVotingPeriod, eventId, eventYear } =
    useRunningAwardEvent();

  if (isVotingPeriod) {
    return (
      <Stack className={"w-fit"}>
        <AwardsEventOverview
          eventId={eventId!}
          withBackground={false}
          withButton
        />
        {eventYear && (
          <Text className={"text-sm text-dimmed max-w-xl"}>
            {t("awards.messages.highlights", { year: eventYear })}
          </Text>
        )}
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
