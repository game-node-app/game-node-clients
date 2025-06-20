import React from "react";
import { Box, Divider, Flex, Stack } from "@mantine/core";
import {
  ProfileFavoriteGames,
  ProfileStatsSimpleOverview,
  RecentActivityList,
  TextLink,
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
    <Stack className={"w-full h-full"}>
      <Box className={"w-full mt-2 mb-4"}>
        <ProfileFavoriteGames userId={userId} />
      </Box>
      <Divider className={"w-full mt-6 mb-2"} label={"Stats"} />
      <Stack>
        <ProfileStatsSimpleOverview userId={userId} />
        <TextLink href={`/profile/${userId}/stats`}>Show more</TextLink>
      </Stack>

      <Flex className={"w-full flex-col lg:flex-row lg:flex-nowrap lg:gap-3"}>
        <Stack className={showPlaytimeInfo ? "w-full lg:w-2/5" : "hidden"}>
          <Divider className={"w-full mt-6 mb-2"} label={"Recently Played"} />
          <UserRecentGames userId={userId} offset={0} limit={5} />
        </Stack>
        <Stack className={showPlaytimeInfo ? "w-full lg:w-3/5" : "w-full"}>
          <Divider className={"w-full mt-6 mb-2"} label={"Recent activity"} />
          <RecentActivityList
            userId={userId}
            withUserAvatar={true}
            limit={10}
          />
        </Stack>
      </Flex>
    </Stack>
  );
};

export { ProfileViewMainPage };
