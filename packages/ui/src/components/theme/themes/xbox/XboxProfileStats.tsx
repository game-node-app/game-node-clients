import { Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useProfileMetricsOverview } from "#@/components/profile/hooks/useProfileMetricsOverview";
import type { ProfileStatsSimpleOverviewProps } from "#@/components/profile/view/ProfileStatsSimpleOverview";

/**
 * Xbox profile stats: one strip of headline numbers, the last one the backlog completion with its meter
 * (a two-number bar chart said less than "X of Y"). Styled in xbox/theme.css.
 */
const XboxProfileStats = ({ userId }: ProfileStatsSimpleOverviewProps) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useProfileMetricsOverview(userId);

  if (isLoading) {
    return <Skeleton className={"h-40"} />;
  }
  if (!data) {
    return null;
  }

  const format = new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language).format;
  const finishedShare =
    data.totalGames > 0 ? Math.round((data.totalFinishedGames / data.totalGames) * 100) : 0;
  const tiles = [
    { value: format(data.totalPlayedGames), label: t("profile.stats.totalGamesPlayed") },
    { value: format(data.totalPlayedGamesInYear), label: t("profile.stats.playedThisYear") },
    {
      value: format(Math.ceil(data.totalEstimatedPlaytime / 3600)),
      label: t("profile.stats.totalPlaytime"),
    },
  ];

  return (
    <div className={"gn-profile-stats-wrap"}>
      <div className={"gn-profile-stats"}>
        {tiles.map((tile) => (
          <div key={tile.label} className={"gn-profile-stat"}>
            <Text className={"gn-profile-stat-value"}>{tile.value}</Text>
            <Text className={"gn-profile-stat-label"}>{tile.label}</Text>
          </div>
        ))}
        <div className={"gn-profile-stat"}>
          <Text className={"gn-profile-stat-value"}>{finishedShare}%</Text>
          <Text className={"gn-profile-stat-label"}>{t("profile.stats.backlogTracking")}</Text>
          <div
            className={"gn-profile-xp gn-profile-backlog-bar"}
            role={"progressbar"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={finishedShare}
            aria-label={t("profile.stats.backlogTracking")}
          >
            <span style={{ width: `${finishedShare}%` }} />
          </div>
          <Text className={"gn-profile-stat-note"}>
            {format(data.totalFinishedGames)} / {format(data.totalGames)}{" "}
            {t("profile.stats.finishedGames").toLowerCase()}
          </Text>
        </div>
      </div>
      <Text className={"gn-profile-stat-note"}>
        * {t("profile.stats.playtimeNote1")} {t("profile.stats.playtimeNote2")}
      </Text>
    </div>
  );
};

export { XboxProfileStats };
