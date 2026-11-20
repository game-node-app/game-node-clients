import { Skeleton } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { useIsLibraryHidden } from "#@/components/library/hooks/useIsLibraryHidden";
import { useProfileMetricsOverview } from "#@/components/profile/hooks/useProfileMetricsOverview";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { ProfileStatsSimpleOverviewProps } from "#@/components/profile/view/ProfileStatsSimpleOverview";
import { XboxStatsStrip } from "./XboxStatsStrip";

/**
 * Xbox profile stats summary: one strip of headline numbers ending with the
 * backlog completion and its meter (a two-number bar chart said less than
 * "X of Y").
 *
 * The default `ProfileStatsSimpleOverview` has no caller on `main`, so the Xbox
 * gamercard renders this presenter itself. It follows the same library privacy
 * rule as `ProfileStatsView`: a hidden library hides every number here.
 */
const XboxProfileStats = ({ userId }: ProfileStatsSimpleOverviewProps) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const profileQuery = useUserProfile(userId);
  const { isHidden } = useIsLibraryHidden(userId, profileQuery.data);
  const metricsQuery = useProfileMetricsOverview(userId);

  if (profileQuery.isLoading && !profileQuery.data) {
    return <Skeleton height={132} radius={"sm"} />;
  }

  // No profile (deleted/404) or a library this viewer cannot see: no numbers.
  if (!profileQuery.data || isHidden) {
    return null;
  }

  if (metricsQuery.isLoading) {
    return <Skeleton height={132} radius={"sm"} />;
  }

  const data = metricsQuery.data;

  if (!data) {
    return null;
  }

  const format = new Intl.NumberFormat(language).format;
  const finishedShare =
    data.totalGames > 0
      ? Math.round((data.totalFinishedGames / data.totalGames) * 100)
      : 0;

  return (
    <XboxStatsStrip
      tiles={[
        {
          value: format(data.totalPlayedGames),
          label: t("profile.stats.totalGamesPlayed"),
        },
        {
          value: format(data.totalPlayedGamesInYear),
          label: t("profile.stats.playedThisYear"),
        },
        {
          value: format(Math.ceil(data.totalEstimatedPlaytime / 3600)),
          label: t("profile.stats.totalPlaytime"),
        },
      ]}
      finishedShare={finishedShare}
      finishedCount={data.totalFinishedGames}
      totalGames={data.totalGames}
      note={`${t("profile.stats.playtimeNote1")} ${t("profile.stats.playtimeNote2")}`}
    />
  );
};

export { XboxProfileStats };
