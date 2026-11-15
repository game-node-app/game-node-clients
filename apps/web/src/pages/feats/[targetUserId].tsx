import { AchievementsScreen } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import Head from "next/head";
import { useRouter } from "next/router";

export default function FeatsPage() {
  const router = useRouter();
  const query = router.query;
  const targetUserId = query.targetUserId as string;
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{`${t("achievements.page.title")} - GameNode`}</title>
      </Head>
      <AchievementsScreen targetUserId={targetUserId} />
    </>
  );
}
