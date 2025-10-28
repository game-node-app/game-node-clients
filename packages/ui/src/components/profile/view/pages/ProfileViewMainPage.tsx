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

interface Props {
  userId: string;
}

const ProfileViewMainPage = ({ userId }: Props) => {
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
      <Divider className={"w-full mt-6 mb-2"} label={"Stats"} />
      <Stack>
        <ProfileStatsSimpleOverview userId={userId} />
        <TextLink href={`/profile/${userId}/stats`}>Show more</TextLink>
      </Stack>

      <Flex className={"w-full flex-col lg:flex-row lg:flex-nowrap gap-3"}>
        <DetailsBox
          title={onMobilePlatform ? "Recently Played" : ""}
          withDimmedTitle
          stackProps={{
            className: showPlaytimeInfo ? "w-full lg:w-2/5" : "hidden",
          }}
        >
          {!onMobilePlatform && (
            <Divider className={"w-full mt-6 mb-2"} label={"Recently Played"} />
          )}
          <UserRecentGames userId={userId} offset={0} limit={5} />
        </DetailsBox>

        <DetailsBox
          title={onMobilePlatform ? "Recent Activity" : ""}
          withDimmedTitle
          stackProps={{
            className: showPlaytimeInfo ? "w-full lg:w-3/5" : "w-full",
          }}
        >
          {!onMobilePlatform && (
            <Divider className={"w-full mt-6 mb-2"} label={"Recent activity"} />
          )}
          <RecentActivityList
            userId={userId}
            withUserAvatar={true}
            limit={10}
          />
        </DetailsBox>
      </Flex>
    </Stack>
  );
};

export { ProfileViewMainPage };
