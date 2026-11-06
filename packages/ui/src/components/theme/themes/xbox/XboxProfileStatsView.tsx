import { LineChart, LineChartSeries } from "@mantine/charts";
import { Skeleton, Tabs, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import {
  ProfileMetricsDistributionYearBy,
  useProfileMetricsDistributionByYear,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByYear";
import { useProfileMetricsOverview } from "#@/components/profile/hooks/useProfileMetricsOverview";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { ProfileStatsViewProps } from "#@/components/profile/view/stats/ProfileStatsView";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { XboxStatsRanking } from "./XboxStatsRanking";

// validated for the dark surface (dataviz validate_palette); "reviewed" is also dashed, so it never relies on hue alone
const TOTAL_COLOR = "#4CAF2A";
const REVIEWED_COLOR = "#3A92D0";

const YEAR_TABS: ProfileMetricsDistributionYearBy[] = ["finish_year", "release_year", "playtime"];

/**
 * Xbox stats page: a compact gamercard, the headline numbers strip, games per year as one line chart with pill tabs,
 * then every distribution as a ranked bar list. Styled in xbox/theme.css.
 */
const XboxProfileStatsView = ({ userId, withUserLevel = true }: ProfileStatsViewProps) => {
  const { t, i18n } = useTranslation();
  const [yearBy, setYearBy] = useState<ProfileMetricsDistributionYearBy>("finish_year");
  const overview = useProfileMetricsOverview(userId).data;
  const yearQuery = useProfileMetricsDistributionByYear(userId, yearBy);
  const profile = useUserProfile(userId).data;
  const level = useUserLevel(userId).data;

  const locale = i18n.resolvedLanguage || i18n.language;
  const format = new Intl.NumberFormat(locale).format;
  const xp = level ? Math.round((level.currentLevelExp / level.levelUpExpCost) * 100) : 0;
  const finishedShare =
    overview && overview.totalGames > 0
      ? Math.round((overview.totalFinishedGames / overview.totalGames) * 100)
      : 0;

  const yearLabels: Record<ProfileMetricsDistributionYearBy, string> = {
    finish_year: t("profile.stats.finishYear"),
    release_year: t("profile.stats.releaseYear"),
    playtime: t("profile.stats.playtime"),
  };
  const series: LineChartSeries[] =
    yearBy === "playtime"
      ? [{ name: "count", label: t("profile.stats.estimatedPlaytime"), color: TOTAL_COLOR }]
      : [
          { name: "count", label: t("profile.stats.total"), color: TOTAL_COLOR },
          {
            name: "reviewedCount",
            label: t("profile.stats.reviewed"),
            color: REVIEWED_COLOR,
            strokeDasharray: "6 4",
          },
        ];
  const yearData =
    yearBy === "playtime"
      ? // playtime comes in seconds
        yearQuery.data?.distribution.map((item) => ({ ...item, count: Math.ceil(item.count / 3600) }))
      : yearQuery.data?.distribution;

  return (
    <div className={"gn-stats-view"}>
      {withUserLevel && profile && (
        <section className={"gn-stats-gamercard"}>
          <UserAvatar userId={userId} className={"gn-profile-gamerpic"} />
          <div className={"gn-profile-hero-info"}>
            <h1 className={"gn-stats-gamertag"}>{profile.username}</h1>
            <div className={"gn-profile-level"}>
              <Text className={"gn-profile-level-value"}>
                {t("user.labels.level", { level: level?.currentLevel ?? 1 })}
              </Text>
              <div
                className={"gn-profile-xp"}
                role={"progressbar"}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={xp}
                aria-label={`${level?.currentLevelExp ?? 0} / ${level?.levelUpExpCost ?? 0} XP`}
              >
                <span style={{ width: `${xp}%` }} />
              </div>
              <Text className={"gn-profile-xp-label"}>
                {level?.currentLevelExp ?? 0} / {level?.levelUpExpCost ?? 0} XP
              </Text>
            </div>
            <Text className={"gn-profile-since"}>
              {t("profile.memberSince", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                  new Date(profile.createdAt),
                ),
              })}
            </Text>
          </div>
        </section>
      )}

      {overview ? (
        <div className={"gn-profile-stats-wrap"}>
          <div className={"gn-profile-stats"}>
            <div className={"gn-profile-stat"}>
              <Text className={"gn-profile-stat-value"}>{format(overview.totalGames)}</Text>
              <Text className={"gn-profile-stat-label"}>{t("profile.stats.gamesLabel")}</Text>
            </div>
            <div className={"gn-profile-stat"}>
              <Text className={"gn-profile-stat-value"}>{format(overview.totalCollections)}</Text>
              <Text className={"gn-profile-stat-label"}>{t("profile.stats.collectionsLabel")}</Text>
            </div>
            <div className={"gn-profile-stat"}>
              <Text className={"gn-profile-stat-value"}>
                {format(Math.ceil(overview.totalEstimatedPlaytime / 3600))}
              </Text>
              <Text className={"gn-profile-stat-label"}>{t("profile.stats.estimatedPlaytime")}</Text>
            </div>
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
                {format(overview.totalFinishedGames)} / {format(overview.totalGames)}{" "}
                {t("profile.stats.finishedGames").toLowerCase()}
              </Text>
            </div>
          </div>
          <Text className={"gn-profile-stat-note"}>
            * {t("profile.stats.playtimeNote1")} {t("profile.stats.playtimeNote2")}
          </Text>
        </div>
      ) : (
        <Skeleton className={"h-28"} />
      )}

      <section className={"gn-stats-card"}>
        <Tabs
          unstyled
          value={yearBy}
          onChange={(value) => value && setYearBy(value as ProfileMetricsDistributionYearBy)}
        >
          <header className={"gn-stats-card-head"}>
            <h3 className={"gn-stats-card-title"}>{t("profile.stats.gamesByYear")}</h3>
            <Tabs.List className={"gn-stats-tabs"}>
              {YEAR_TABS.map((value) => (
                <Tabs.Tab key={value} value={value} className={"gn-profile-tab"}>
                  {yearLabels[value]}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </header>
        </Tabs>
        {yearData ? (
          <LineChart
            h={280}
            dataKey={"year"}
            data={yearData}
            series={series}
            curveType={"monotone"}
            withLegend={series.length > 1}
            legendProps={{ verticalAlign: "top", height: 36 }}
            gridAxis={"y"}
            strokeWidth={2}
          />
        ) : (
          <Skeleton className={"h-[280px]"} />
        )}
      </section>

      <div className={"gn-stats-grid"}>
        <XboxStatsRanking userId={userId} by={"platform"} title={t("explore.filters.platforms")} />
        <XboxStatsRanking userId={userId} by={"status"} title={t("collectionEntry.labels.status")} />
        <XboxStatsRanking userId={userId} by={"genre"} title={t("explore.filters.genres")} />
        <XboxStatsRanking userId={userId} by={"theme"} title={t("explore.filters.themes")} />
        <XboxStatsRanking userId={userId} by={"mode"} title={t("explore.filters.modes")} />
      </div>
    </div>
  );
};

export { XboxProfileStatsView };
