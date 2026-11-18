import { Box } from "@mantine/core";
import { ProfileViewContent, getUserProfileQueryKey } from "@repo/ui";
import { ProfileService } from "@repo/wrapper/server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const query = ctx.query;
  const userId = query.userId as string;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    /*
      The server has no session here, so it dehydrates the anonymous key
      (`null` viewer). That is the key the client computes while the session is
      still loading, so hydration matches; once the session resolves, the
      viewer-aware key is fetched and replaces it.
     */
    queryKey: getUserProfileQueryKey(userId, null),
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

  return (
    <Box className={"w-full h-full mt-3 mb-8"}>
      <ProfileViewContent key={userIdString} userId={userIdString} />
    </Box>
  );
};

export default Index;
