import React from "react";
import { Box, Button, Text, Title } from "@mantine/core";
import { Link } from "#@/util";
import { useAwardEvent } from "#@/components";

interface Props {
  eventId: number;
}

const AwardsNomineesVoteCTA = ({ eventId }: Props) => {
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Box className={"min-h-96 w-full"}>
      <div className={"w-full flex flex-col items-center gap-6"}>
        <Title className={"text-5xl text-white mt-24"}>AWARDS</Title>
        <Text className={"text-[#DEDEDE] text-wrap text-center lg:w-96"}>
          The Game Awards and GameNode community&#39;s nominees in one place
        </Text>
        <Link href={`/awards/${event?.year}/vote`}>
          <Button
            className={"w-48 h-12"}
            classNames={{
              label: "text-white text-lg text-bold",
            }}
          >
            Vote Now
          </Button>
        </Link>
      </div>
    </Box>
  );
};

export { AwardsNomineesVoteCTA };
