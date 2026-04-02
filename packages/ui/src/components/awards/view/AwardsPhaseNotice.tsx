import React, { useMemo } from "react";
import { Flex, Stack, Text, Title } from "@mantine/core";
import { useAwardEvent } from "#@/components";
import dayjs from "dayjs";
import { useTranslation } from "@repo/locales";

interface Props {
  eventId: number;
}

const AwardsPhaseNotice = ({ eventId }: Props) => {
  const { t } = useTranslation();
  const { data: event } = useAwardEvent({ eventId });

  const votingPhaseText = useMemo(() => {
    if (!event) {
      return "";
    }
    const now = dayjs();
    if (now.isBefore(dayjs(event.votingStartDate))) {
      return t("awards.phases.startingSoon");
    }

    if (
      now.isAfter(dayjs(event.votingEndDate)) &&
      now.isBefore(dayjs(event.resultsDate))
    ) {
      return t("awards.phases.countingVotes");
    }

    if (now.isAfter(dayjs(event.resultsDate))) {
      return t("awards.phases.eventEnded");
    }

    return t("awards.phases.voting");
  }, [event, t]);

  const phaseTimeText = useMemo(() => {
    if (!event) {
      return "";
    }

    const now = dayjs();
    const votingStartDate = dayjs(event.votingStartDate);
    const votingEndDate = dayjs(event.votingEndDate);
    const resultsDate = dayjs(event.resultsDate);

    if (now.isBefore(votingStartDate)) {
      return t("awards.phaseMessages.votingStartsIn", {
        time: `${votingStartDate.toNow(true)} (${votingStartDate.format("DD/MM")})`,
      });
    }

    if (now.isAfter(votingEndDate)) {
      return t("awards.phaseMessages.votingEnded", {
        time: `${resultsDate.fromNow(true)} (${resultsDate.format("DD/MM")})`,
      });
    }

    if (now.isAfter(resultsDate)) {
      return t("awards.phaseMessages.resultsOut");
    }

    return t("awards.phaseMessages.votingEndsIn", {
      time: `${votingEndDate.fromNow(true)} (${votingEndDate.format("DD/MM")})`,
    });
  }, [event, t]);

  return (
    <Stack className={"w-full items-center"}>
      <Title className={"text-center text-white text-5xl"}>
        {votingPhaseText}
      </Title>
      <Text className={"text-center text-dimmed text-md"}>
        {t("awards.currentPhase")}
      </Text>
      <Text className={"text-md"}>{phaseTimeText}</Text>
    </Stack>
  );
};

export { AwardsPhaseNotice };
