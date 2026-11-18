import React from "react";
import { Box, Stack } from "@mantine/core";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { ActivitiesService } from "@repo/wrapper/server";
import { GetServerSidePropsContext } from "next";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { OpenGraph } from "@/components/general/OpenGraph";
import { ActivityDetailView } from "@repo/ui";
import {
  fetchForSeo,
  gameCoverUrl,
  plainText,
  SeoProfile,
  toSeoProfile,
} from "@/util/seo";

type SeoActivity = {
  profile: SeoProfile;
  gameName: string | null;
  coverUrl: string | null;
  reviewText: string | null;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { activityId } = ctx.query;
  const activity =
    typeof activityId === "string"
      ? await fetchForSeo(() =>
          ActivitiesService.activitiesRepositoryControllerFindOneByIdV1(
            activityId,
          ),
        )
      : null;
  const seoActivity: SeoActivity | null = activity
    ? {
        profile: toSeoProfile(activity.profile),
        gameName: activity.game?.name ?? null,
        coverUrl: gameCoverUrl(activity.game?.cover?.url),
        reviewText: plainText(activity.review?.content) || null,
      }
    : null;
  return { props: { seoActivity } };
};

const ActivityDetailPage = ({
  seoActivity,
}: {
  seoActivity: SeoActivity | null;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { activityId } = router.query;

  if (!router.isReady) {
    return null;
  } else if (activityId == undefined) {
    return (
      <CenteredErrorMessage message={"No activity found. Please try again."} />
    );
  }

  const profile = seoActivity?.profile;
  return (
    <Stack mih={"100%"} pos={"relative"} className="items-center">
      {seoActivity && profile && (
        <OpenGraph
          title={t("seo.activity.title", { username: profile.username })}
          description={
            seoActivity.reviewText ||
            t("seo.activity.description", { username: profile.username })
          }
          imageUrl={seoActivity.coverUrl ?? profile.imageUrl}
          imageAlt={seoActivity.gameName ?? profile.username}
          wideImage={!seoActivity.coverUrl && profile.wideImage}
        />
      )}
      <Box className={"w-full"}>
        <ActivityDetailView activityId={activityId as string} />
      </Box>
    </Stack>
  );
};

export default ActivityDetailPage;
