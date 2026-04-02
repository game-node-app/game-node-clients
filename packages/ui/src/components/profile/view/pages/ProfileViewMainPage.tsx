import React from "react";
import { Box, Divider, Flex, Stack, Text } from "@mantine/core";
import {
  DetailsBox,
  JournalHeatmap,
  ProfileFavoriteGames,
  ProfileStatsSimpleOverview,
  RecentActivityList,
  TextLink,
  useOnMobilePlatform,
  usePlaytimeForUser,
  UserRecentGames,
  useUserId,
} from "#@/components";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import period = FindAllPlaytimeFiltersDto.period;
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const ProfileViewMainPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const onMobilePlatform = useOnMobilePlatform();
  const playtime = usePlaytimeForUser({
    userId: userId,
    offset: 0,
    limit: 5,
    period: period.YEAR,
  });

  const ownUserId = useUserId();

  const hasPlaytimeInfo =
    playtime.data != undefined && playtime.data.data.length > 0;

  const showPlaytimeInfo = hasPlaytimeInfo || ownUserId === userId;

  return (
    <Stack>
      <Box className={"w-full mt-2 mb-4"}>
        <ProfileFavoriteGames userId={userId} />
      </Box>
      <JournalHeatmap userId={userId} />
      <Divider
        className={"w-full mt-6 mb-2"}
        label={t("profile.labels.stats")}
      />
      <Stack>
        <ProfileStatsSimpleOverview userId={userId} />
        <TextLink href={`/profile/${userId}/stats`}>
          {t("actions.showMore")}
        </TextLink>
      </Stack>

      <Flex className={"w-full flex-col lg:flex-row lg:flex-nowrap gap-3"}>
        <DetailsBox
          title={onMobilePlatform ? t("profile.recent.recentlyPlayed") : ""}
          withDimmedTitle
          stackProps={{
            className: showPlaytimeInfo ? "w-full lg:w-2/5" : "hidden",
          }}
        >
          {!onMobilePlatform && (
            <Divider
              className={"w-full mt-6 mb-2"}
              label={t("profile.recent.recentlyPlayed")}
            />
          )}
          <UserRecentGames userId={userId} offset={0} limit={5} />
        </DetailsBox>

        <DetailsBox
          title={onMobilePlatform ? t("profile.recent.recentActivity") : ""}
          withDimmedTitle
          stackProps={{
            className: showPlaytimeInfo ? "w-full lg:w-3/5" : "w-full",
          }}
        >
          {!onMobilePlatform && (
            <Divider
              className={"w-full mt-6 mb-2"}
              label={t("profile.recent.recentActivity")}
            />
          )}
          <RecentActivityList
            userId={userId}
            withUserAvatar={true}
            limit={10}
            variant={"card"}
          />
        </DetailsBox>
      </Flex>
    </Stack>
  );
};

export { ProfileViewMainPage };
