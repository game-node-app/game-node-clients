import React from "react";
import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "#@/util";
import { useAwardEvent } from "#@/components";

interface Props {
  eventId: number;
}

const AwardsEventResultOverview = ({ eventId }: Props) => {
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Stack>
      <Title className={"text-7xl text-white"}>AWARDS</Title>
      <Text className={"text-[#DEDEDE] text-wrap lg:w-96"}>
        The Game Awards and GameNode community&#39;s nominees in one place
      </Text>
      <Link href={`/awards/${event?.year}/result`}>
        <Button className={"rounded-md w-full lg:w-56"} color={"green"}>
          Results are out!
        </Button>
      </Link>
    </Stack>
  );
};

export { AwardsEventResultOverview };
