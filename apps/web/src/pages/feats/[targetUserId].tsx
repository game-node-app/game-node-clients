import { AchievementsScreen } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { useRouter } from "next/router";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps("targetUserId");

export default function FeatsPage({ seoProfile }: SeoProfileProps) {
  const router = useRouter();
  const query = router.query;
  const targetUserId = query.targetUserId as string;
  const { t } = useTranslation();

  return (
    <>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.feats.title", { username: seoProfile?.username })}
        description={t("achievements.page.subtitle")}
      />
      <AchievementsScreen targetUserId={targetUserId} />
    </>
  );
}
