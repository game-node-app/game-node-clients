import { useTranslation } from "@repo/locales";
import { RecapStoriesScreen } from "@repo/ui";
import Head from "next/head";
import { useRouter } from "next/router";

/**
 * `/recap/[year]/[userId]/stories`: the five Recap stories in the full-screen
 * viewer (design §11). The card is rendered and exported on the client; the
 * page only parses the route and injects the app share sheet.
 */
const RecapStoriesPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { year, userId } = router.query;

  const rawYear = Array.isArray(year) ? year[0] : year;
  const targetYear = Number.parseInt(rawYear ?? "", 10);
  const targetUserId = Array.isArray(userId) ? userId[0] : userId;

  return (
    <>
      <Head>
        <title>
          {Number.isFinite(targetYear)
            ? `${t("recap.stories.opening.eyebrow", {
                year: targetYear,
              })} | GameNode`
            : "GameNode"}
        </title>
      </Head>
      {targetUserId && Number.isFinite(targetYear) && (
        <RecapStoriesScreen
          userId={targetUserId}
          year={targetYear}
          onShare={async (file) => {
            const toShare: ShareData = {
              title: t("game.share.title"),
              text: t("game.share.recentlyPlayed"),
              files: [file],
              url: `https://gamenode.app`,
            };

            await navigator.share(toShare);
          }}
        />
      )}
    </>
  );
};

export default RecapStoriesPage;
