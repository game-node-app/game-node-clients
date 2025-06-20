import React from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import {
  FindAllPlaytimeFiltersDto,
  ProfileService,
} from "@repo/wrapper/server";
import { Box } from "@mantine/core";
import {
  ProfileUserInfoWithBanner,
  ProfileViewContent,
  useUserProfile,
} from "@repo/ui";

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
  const router = useRouter();
  const { userId } = router.query;
  const userIdString = userId as string;
  useUserProfile(userIdString);

  return (
    <Box className={"w-full h-full xl:flex xl:justify-center"}>
      <Box className={"mt-3 mb-12 xl:max-w-screen-xl"}>
        <ProfileUserInfoWithBanner userId={userIdString}>
          <ProfileViewContent userId={userIdString} />
        </ProfileUserInfoWithBanner>
      </Box>
    </Box>
  );
};

export default Index;
