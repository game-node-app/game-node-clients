import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { AwardsSharedBallotScreen } from "@repo/ui";
import { useRouter } from "next/router";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps();

const AwardsUserNomineesPage = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year, userId } = router.query;

  const eventYear = Number.parseInt(year as string);
  const ballotUserId = userId as string | undefined;

  if (!Number.isFinite(eventYear) || !ballotUserId) {
    return null;
  }

  const values = { username: seoProfile?.username, year: eventYear };
  return (
    <Stack className={"w-full mb-12"}>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.awards.ballotTitle", values)}
        description={t("seo.awards.ballotDescription", values)}
      />
      <AwardsSharedBallotScreen eventYear={eventYear} userId={ballotUserId} />
    </Stack>
  );
};

export default AwardsUserNomineesPage;
