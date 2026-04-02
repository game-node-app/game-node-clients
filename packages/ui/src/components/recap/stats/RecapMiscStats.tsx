import React from "react";
import { BaseRecapStatsProps, useRecap } from "#@/components";
import { Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

const RecapMiscStats = ({ userId, targetYear }: BaseRecapStatsProps) => {
  const { t } = useTranslation();
  const { data: recap } = useRecap(userId, targetYear);
  return (
    <Stack className={"items-center"}>
      <Title className={"text-2xl font-black text-center"}>
        {t("recap.stats.heading")}
      </Title>
      <Group
        className={
          "w-full justify-between lg:justify-center lg:gap-40 flex-nowrap"
        }
      >
        <Stack className={"gap-1"}>
          <Title className={"text-7xl font-black text-center"}>
            {recap?.totalAddedGames || 0}
          </Title>
          <Title className={"text-sm text-center"}>
            {t("recap.stats.addedGames")}
          </Title>
        </Stack>
        <Stack className={"gap-1"}>
          <Title className={"text-7xl font-black text-center"}>
            {recap?.totalReviewsCreated || 0}
          </Title>
          <Title className={"text-sm text-center"}>
            {t("recap.stats.reviewsMade")}
          </Title>
        </Stack>
      </Group>
      <Group className={"w-full justify-center lg:gap-28 mt-6"}>
        <Group className={"gap-3"}>
          <Text className={"text-4xl font-black"}>
            {recap?.totalCollectionsCreated}
          </Text>
          <Text className={"text-sm"}>
            {t("recap.stats.collectionsCreated")}
          </Text>
        </Group>
        <Group className={"gap-3"}>
          <Text className={"text-4xl font-black"}>
            {recap?.totalFollowersGained}
          </Text>
          <Text className={"text-sm"}>{t("recap.stats.followersGained")}</Text>
        </Group>
        <Group className={"gap-3"}>
          <Text className={"text-4xl font-black"}>
            {recap?.totalLikesPerformed}
          </Text>
          <Text className={"text-sm"}>{t("recap.stats.likesGiven")}</Text>
        </Group>
      </Group>
    </Stack>
  );
};

export { RecapMiscStats };
