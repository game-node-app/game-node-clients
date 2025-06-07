import React from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import {
  FindAllPlaytimeFiltersDto,
  ProfileService,
} from "@repo/wrapper/server";
import { Box, Divider, Flex, Stack } from "@mantine/core";
import {
  ProfileFavoriteGames,
  ProfileStatsSimpleOverview,
  ProfileUserInfoWithBanner,
  ProfileViewNavbar,
  RecentActivityList,
  TextLink,
  useOnMobile,
  usePlaytimeForUser,
  UserRecentGames,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import period = FindAllPlaytimeFiltersDto.period;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const query = ctx.query;
  const userId = query.userId as string;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => {
      const profile = ProfileService.profileControllerFindOneByIdV1(userId);
      if (!profile) {
        return null;
      }
      return profile;
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

const Index = () => {
  const onMobile = useOnMobile();
  const router = useRouter();
  const { userId } = router.query;
  const userIdString = userId as string;
  useUserProfile(userIdString);

  const playtime = usePlaytimeForUser({
    userId: userIdString,
    offset: 0,
    limit: 5,
    period: period.YEAR,
  });

  const ownUserId = useUserId();

  const hasPlaytimeInfo =
    playtime.data != undefined && playtime.data.data.length > 0;

  const showPlaytimeInfo = hasPlaytimeInfo || ownUserId === userIdString;

  return (
    <Box className={"w-full h-full xl:flex xl:justify-center"}>
      <Box className={"mt-3 mb-12 xl:max-w-screen-xl"}>
        <ProfileUserInfoWithBanner userId={userIdString}>
          <ProfileViewNavbar userId={userIdString} />
          <Box className={"w-full mt-6 mb-4"}>
            <ProfileFavoriteGames userId={userIdString} />
          </Box>
          <Divider className={"w-full mt-6 mb-2"} label={"Stats"} />
          <Stack>
            <ProfileStatsSimpleOverview userId={userIdString} />
            <TextLink href={`/profile/${userIdString}/stats`}>
              Show more
            </TextLink>
          </Stack>

          <Flex
            className={"w-full flex-col lg:flex-row lg:flex-nowrap lg:gap-3"}
          >
            <Stack className={showPlaytimeInfo ? "w-full lg:w-2/5" : "hidden"}>
              <Divider
                className={"w-full mt-6 mb-2"}
                label={"Recently Played"}
              />
              <UserRecentGames userId={userIdString} offset={0} limit={5} />
            </Stack>
            <Stack className={showPlaytimeInfo ? "w-full lg:w-3/5" : "w-full"}>
              <Divider
                className={"w-full mt-6 mb-2"}
                label={"Recent activity"}
              />
              <RecentActivityList
                userId={userIdString}
                withUserAvatar={false}
                limit={7}
              />
            </Stack>
          </Flex>
        </ProfileUserInfoWithBanner>
      </Box>
    </Box>
  );
};

export default Index;
