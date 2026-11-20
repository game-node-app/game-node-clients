import { useTranslation } from "@repo/locales";
import { buildPresenterComponent, ProfileStatsView } from "@repo/ui";
import { useRouter } from "next/router";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

const ProfileStatsPresenter = buildPresenterComponent(
  "ProfileStatsView",
  ProfileStatsView,
);

export const getServerSideProps = getSeoProfileProps();

const ProfileStatsPage = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = router.query;

  return (
    <>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.stats.title", { username: seoProfile?.username })}
        description={t("seo.stats.description", {
          username: seoProfile?.username,
        })}
      />
      <ProfileStatsPresenter userId={userId as string} />
    </>
  );
};

export default ProfileStatsPage;
