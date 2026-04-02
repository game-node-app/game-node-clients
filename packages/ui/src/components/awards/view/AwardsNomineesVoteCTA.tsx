import React from "react";
import { Box, BoxProps, Button, Text, Title } from "@mantine/core";
import { cn, Link } from "#@/util";
import { useAwardEvent } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props extends BoxProps {
  eventId: number;
}

const AwardsNomineesVoteCTA = ({ eventId, ...others }: Props) => {
  const { t } = useTranslation();
  const { data: event } = useAwardEvent({ eventId });

  return (
    <Box {...others} className={cn("min-h-20 w-full", others.className)}>
      <div className={"w-full flex flex-col items-center gap-6"}>
        <Title className={"text-5xl text-white"}>{t("awards.title")}</Title>
        <Text className={"text-[#DEDEDE] text-wrap text-center lg:w-96"}>
          {t("awards.subtitle")}
        </Text>
        <Link href={`/awards/${event?.year}/vote`}>
          <Button
            className={"w-48 h-12"}
            classNames={{
              label: "text-white text-lg text-bold",
            }}
          >
            {t("awards.voteNow")}
          </Button>
        </Link>
      </div>
    </Box>
  );
};

export { AwardsNomineesVoteCTA };
