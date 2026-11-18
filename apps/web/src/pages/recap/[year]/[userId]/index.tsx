import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { YearRecapScreen } from "@repo/ui";
import { useRouter } from "next/router";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps();

const RecapPage = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year, userId } = router.query;
  const targetYear = Array.isArray(year)
    ? parseInt(year[0], 10)
    : parseInt(year || "", 10);
  const targetUserId = Array.isArray(userId) ? userId[0] : userId;

  if (!targetUserId || Number.isNaN(targetYear)) {
    return null;
  }

  const values = { username: seoProfile?.username, year: targetYear };
  return (
    <Stack className={"w-full"}>
      <ProfileOpenGraph
        profile={seoProfile}
        title={t("seo.recap.title", values)}
        description={t("seo.recap.description", values)}
      />
      <YearRecapScreen year={targetYear} userId={targetUserId} />
    </Stack>
  );
};

export default RecapPage;
