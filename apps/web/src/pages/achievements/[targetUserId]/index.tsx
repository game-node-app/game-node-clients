import React from "react";
import { useRouter } from "next/router";
import { Stack } from "@mantine/core";
import { JournalObtainedAchievementsView } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps("targetUserId");

const JournalAchievementsPage = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { targetUserId } = router.query;

  if (targetUserId === undefined || typeof targetUserId !== "string") {
    return null;
  }

  return (
    <Stack className={"w-full my-4"}>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.achievements.title", { username: seoProfile?.username })}
        description={t("seo.profile.description", {
          username: seoProfile?.username,
        })}
      />
      <JournalObtainedAchievementsView
        userId={targetUserId as string}
        withUserInfo
      />
    </Stack>
  );
};

export default JournalAchievementsPage;
