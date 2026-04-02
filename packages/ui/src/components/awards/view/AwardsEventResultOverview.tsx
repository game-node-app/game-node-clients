import React from "react";
import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "#@/util";
import { useAwardEvent } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props {
  eventId: number;
}

const AwardsEventResultOverview = ({ eventId }: Props) => {
  const { t } = useTranslation();
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Stack>
      <Title className={"text-7xl text-white"}>{t("awards.title")}</Title>
      <Text className={"text-[#DEDEDE] text-wrap lg:w-96"}>
        {t("awards.subtitle")}
      </Text>
      <Link href={`/awards/${event?.year}/result`}>
        <Button className={"rounded-md w-full lg:w-56"} color={"green"}>
          {t("awards.phaseMessages.resultsOut")}
        </Button>
      </Link>
    </Stack>
  );
};

export { AwardsEventResultOverview };
