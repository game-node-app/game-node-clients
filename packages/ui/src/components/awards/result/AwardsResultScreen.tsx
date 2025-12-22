import React from "react";
import { Box, Stack, Text } from "@mantine/core";
import {
  AwardsEventOverview,
  AwardsResultCategories,
  useAwardEvent,
} from "#@/components";

interface Props {
  eventId: number | undefined;
  eventYear: number | undefined;
}

const AwardsResultScreen = ({ eventId, eventYear }: Props) => {
  const { data: event } = useAwardEvent({ eventYear, eventId });

  if (!event) {
    return null;
  }

  return (
    <Stack>
      <Box className={"w-full mt-8 lg:mt-14"}>
        <AwardsEventOverview eventId={event.id} withButton={false} />
      </Box>
      <Stack className={"gap-4"}>
        <Text className={"text-lg font-bold text-center"}>
          These are the most loved games of our community in{" "}
          <Text span className={"text-brand-4 font-extrabold"}>
            {event.year}
          </Text>
          !
        </Text>
        <Text className={"text-center text-dimmed text-sm"}>
          Please be aware that results are determined by popular vote.
        </Text>
        <AwardsResultCategories eventId={event.id} />
      </Stack>
    </Stack>
  );
};

export { AwardsResultScreen };
