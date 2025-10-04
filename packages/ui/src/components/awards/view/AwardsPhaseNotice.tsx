import React, { useMemo } from "react";
import { Flex, Stack, Text, Title } from "@mantine/core";
import { useAwardEvent } from "#@/components";
import dayjs from "dayjs";

interface Props {
  eventId: number;
}

const AwardsPhaseNotice = ({ eventId }: Props) => {
  const { data: event } = useAwardEvent({ eventId });

  const votingPhaseText = useMemo(() => {
    if (!event) {
      return "";
    }
    const now = dayjs();
    if (now.isBefore(dayjs(event.votingStartDate))) {
      return "Starting Soon";
    }

    if (
      now.isAfter(dayjs(event.votingEndDate)) &&
      now.isBefore(dayjs(event.resultsDate))
    ) {
      return "Counting of Votes";
    }

    if (now.isAfter(dayjs(event.resultsDate))) {
      return "Event Ended";
    }

    return "Voting";
  }, [event]);

  const phaseTimeText = useMemo(() => {
    if (!event) {
      return "";
    }

    const now = dayjs();
    const votingStartDate = dayjs(event.votingStartDate);
    const votingEndDate = dayjs(event.votingEndDate);
    const resultsDate = dayjs(event.resultsDate);

    if (now.isBefore(votingStartDate)) {
      return `Voting starts in ${votingStartDate.toNow(true)} (${votingStartDate.format("DD/MM")})`;
    }

    if (now.isAfter(votingEndDate)) {
      return `Voting ended. Results will be out in ${resultsDate.fromNow(true)} (${resultsDate.format("DD/MM")})`;
    }

    if (now.isAfter(resultsDate)) {
      return `Results are out!`;
    }

    return `Voting ends in ${votingEndDate.fromNow(true)} (${votingEndDate.format("DD/MM")})`;
  }, [event]);

  return (
    <Stack className={"w-full items-center"}>
      <Title className={"text-center text-white text-5xl"}>
        {votingPhaseText}
      </Title>
      <Text className={"text-center text-dimmed text-md"}>Current Phase</Text>
      <Text className={"text-md"}>{phaseTimeText}</Text>
    </Stack>
  );
};

export { AwardsPhaseNotice };
