import React from "react";
import { useAwardEvent, useAwardEventCategories } from "#@/components";
import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { AwardsOverviewTextBadge } from "#@/components/awards/view/AwardsOverviewTextBadge.tsx";
import dayjs from "dayjs";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";

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
  const { t } = useTranslation();
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
      <Title className={"text-7xl text-white"}>{t("awards.title")}</Title>
      <Text className={"text-[#DEDEDE] text-wrap lg:w-96"}>
        {t("awards.subtitle")}
      </Text>
      {withButton && (
        <Link href={`/awards/${event?.year}/vote`}>
          <Button className={"rounded-md w-40"}>{t("awards.voteNow")}</Button>
        </Link>
      )}
      <Text className={"text-sm text-dimmed"}>
        {t("awards.participationReward")}
      </Text>
      <Group className={"w-full flex-nowrap gap-4"}>
        <AwardsOverviewTextBadge>
          {t("awards.categoriesCount", { count: totalCategories })}
        </AwardsOverviewTextBadge>
        <AwardsOverviewTextBadge>
          {t("awards.votedByPublic")}
        </AwardsOverviewTextBadge>
        <AwardsOverviewTextBadge>
          {t("awards.resultsDate", { date: resultsDate })}
        </AwardsOverviewTextBadge>
      </Group>
    </Stack>
  );
};

export { AwardsEventOverview };
