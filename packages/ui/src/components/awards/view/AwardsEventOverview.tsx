import React from "react";
import { useAwardEvent, useAwardEventCategories } from "#@/components";
import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { AwardsOverviewTextBadge } from "#@/components/awards/view/AwardsOverviewTextBadge.tsx";
import dayjs from "dayjs";
import { Link } from "#@/util";

interface Props {
  eventId: number;
  withButton?: boolean;
  withBackground?: boolean;
}

const AwardsEventOverview = ({
  eventId,
  withButton = true,
  withBackground = true,
}: Props) => {
  const { data: event } = useAwardEvent({ eventId });
  const { data: eventCategories } = useAwardEventCategories(eventId);

  const resultsDate = dayjs(event?.resultsDate).format("DD/MM");
  const totalCategories = eventCategories?.length ?? 0;

  return (
    <Stack className={"z-10 h-fit overflow-hidden"}>
      {withBackground && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100%",
            backgroundImage: `url('/img/awards_event_bg.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -1,
            opacity: 1,
          }}
        />
      )}
      <Title className={"text-7xl text-white"}>AWARDS</Title>
      <Text className={"text-[#DEDEDE] text-wrap lg:w-96"}>
        The Game Awards and GameNode community&#39;s nominees in one place
      </Text>
      {withButton && (
        <Link href={`/awards/${event?.year}/vote`}>
          <Button className={"rounded-md w-40"}>Vote now</Button>
        </Link>
      )}
      <Text className={"text-sm text-dimmed"}>
        Earn 1000XP and a badge for participating!
      </Text>
      <Group className={"w-full flex-nowrap gap-4"}>
        <AwardsOverviewTextBadge>
          {totalCategories} Categories
        </AwardsOverviewTextBadge>
        <AwardsOverviewTextBadge>Voted by the public</AwardsOverviewTextBadge>
        <AwardsOverviewTextBadge>Results {resultsDate}</AwardsOverviewTextBadge>
      </Group>
    </Stack>
  );
};

export { AwardsEventOverview };
