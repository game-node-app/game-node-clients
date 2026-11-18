import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ProfileViewContent, getUserProfileQueryKey } from "@repo/ui";
import { Profile, ProfileService } from "@repo/wrapper/server";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { OpenGraph } from "@/components/general/OpenGraph";
import { isNotFoundError, SeoProfile, toSeoProfile } from "@/util/seo";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const query = ctx.query;
  const userId = query.userId as string;
  const queryClient = new QueryClient();

  let profile: Profile | null = null;
  try {
    profile = await queryClient.fetchQuery({
      /*
        The server has no session here, so it dehydrates the anonymous key
        (`null` viewer). That is the key the client computes while the session
        is still loading, so hydration matches; once the session resolves, the
        viewer-aware key is fetched and replaces it.
       */
      queryKey: getUserProfileQueryKey(userId, null),
      queryFn: () => ProfileService.profileControllerFindOneByIdV1(userId),
    });
  } catch (error) {
    if (isNotFoundError(error)) return { notFound: true };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      seoProfile: profile ? toSeoProfile(profile) : null,
    },
  };
}

const Index = ({ seoProfile }: { seoProfile: SeoProfile | null }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { userId } = router.query;
  const userIdString = userId as string;

  return (
    <Box className={"w-full h-full mt-3 mb-8"}>
      {seoProfile && (
        <OpenGraph
          type="profile"
          title={t("seo.profile.title", { username: seoProfile.username })}
          description={
            seoProfile.bio ||
            t("seo.profile.description", { username: seoProfile.username })
          }
          imageUrl={seoProfile.imageUrl}
          imageAlt={seoProfile.username}
          wideImage={seoProfile.wideImage}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: seoProfile.username,
              identifier: seoProfile.userId,
              ...(seoProfile.bio ? { description: seoProfile.bio } : {}),
              ...(seoProfile.imageUrl ? { image: seoProfile.imageUrl } : {}),
            },
          }}
        />
      )}
      <ProfileViewContent key={userIdString} userId={userIdString} />
    </Box>
  );
};

export default Index;
