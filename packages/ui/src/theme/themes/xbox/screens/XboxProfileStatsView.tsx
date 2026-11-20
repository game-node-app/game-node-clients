import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { LibraryHiddenState } from "#@/components/library/view/LibraryHiddenState";
import { useIsLibraryHidden } from "#@/components/library/hooks/useIsLibraryHidden";
import {
  ProfileMetricsDistributionYearBy,
  useProfileMetricsDistributionByYear,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByYear";
import { useProfileMetricsOverview } from "#@/components/profile/hooks/useProfileMetricsOverview";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { ProfileStatsViewProps } from "#@/components/profile/view/stats/ProfileStatsView";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { LineChart, LineChartSeries } from "@mantine/charts";
import { Skeleton, Tabs, Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { useState } from "react";
import { XboxStatsRanking } from "./XboxStatsRanking";
import { XboxStatsStrip } from "./XboxStatsStrip";
import pillClasses from "./XboxProfileViewNavbarItem.module.css";
import classes from "./XboxProfileStatsView.module.css";

const YEAR_TABS: ProfileMetricsDistributionYearBy[] = [
  "finish_year",
  "release_year",
  "playtime",
];

/**
 * Xbox stats page: a compact gamercard, the headline numbers strip, games per
 * year as one line chart with pill tabs, then every distribution as a ranked
 * bar list.
 *
 * It reads the same hooks and obeys the same library privacy guard as the
 * default `ProfileStatsView`; a hidden library renders the shared
 * `LibraryHiddenState` instead of any number.
 */
const XboxProfileStatsView = ({
  userId,
  withUserLevel = true,
}: ProfileStatsViewProps) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const [yearBy, setYearBy] =
    useState<ProfileMetricsDistributionYearBy>("finish_year");
  const profileQuery = useUserProfile(userId);
  const profile = profileQuery.data;
  const { isHidden } = useIsLibraryHidden(userId, profile);
  const overviewQuery = useProfileMetricsOverview(userId);
  const yearQuery = useProfileMetricsDistributionByYear(userId, yearBy);
  const levelQuery = useUserLevel(userId);

  if (!profile) {
    return profileQuery.isLoading ? (
      <CenteredLoading />
    ) : (
      <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />
    );
  }

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  const overview = overviewQuery.data;
  const level = levelQuery.data;
  const format = new Intl.NumberFormat(language).format;
  const xp =
    level && level.levelUpExpCost > 0
      ? Math.round((level.currentLevelExp / level.levelUpExpCost) * 100)
      : 0;
  const finishedShare =
    overview && overview.totalGames > 0
      ? Math.round((overview.totalFinishedGames / overview.totalGames) * 100)
      : 0;
  const memberSince =
    profile?.createdAt && Number.isFinite(new Date(profile.createdAt).getTime())
      ? new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(profile.createdAt))
      : null;

  const yearLabels: Record<ProfileMetricsDistributionYearBy, string> = {
    finish_year: t("profile.stats.finishYear"),
    release_year: t("profile.stats.releaseYear"),
    playtime: t("profile.stats.playtime"),
  };
  const series: LineChartSeries[] =
    yearBy === "playtime"
      ? [
          {
            name: "count",
            label: t("profile.stats.estimatedPlaytime"),
            color: "var(--gn-brand)",
          },
        ]
      : [
          {
            name: "count",
            label: t("profile.stats.total"),
            color: "var(--gn-brand)",
          },
          {
            name: "reviewedCount",
            label: t("profile.stats.reviewed"),
            color: "var(--gn-chart-primary)",
            strokeDasharray: "6 4",
          },
        ];
  const yearData = yearQuery.data?.distribution.map((item) =>
    yearBy === "playtime"
      ? // playtime comes in seconds; the chart reads hours
        { ...item, count: Math.ceil(item.count / 3600) }
      : item,
  );

  return (
    <div className={classes.view}>
      {withUserLevel && profile && (
        <section className={classes.gamercard}>
          <UserAvatar
            userId={userId}
            profile={profile}
            alt={profile.username}
            className={classes.gamerpic}
          />
          <div className={classes.info}>
            <h1 className={classes.gamertag}>{profile.username}</h1>
            <div className={classes.level}>
              <Text className={classes.levelValue}>
                {t("user.labels.level", {
                  level: level?.currentLevel ?? 1,
                })}
              </Text>
              <div
                className={classes.xp}
                role={"progressbar"}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={xp}
                aria-label={t("user.labels.xp", {
                  exp: level?.currentLevelExp ?? 0,
                  cost: level?.levelUpExpCost ?? 0,
                })}
              >
                <span className={classes.xpFill} style={{ width: `${xp}%` }} />
              </div>
              <Text className={classes.xpLabel}>
                {t("user.labels.xp", {
                  exp: level?.currentLevelExp ?? 0,
                  cost: level?.levelUpExpCost ?? 0,
                })}
              </Text>
            </div>
            {memberSince && (
              <Text className={classes.since}>
                {t("profile.memberSince", { date: memberSince })}
              </Text>
            )}
          </div>
        </section>
      )}

      {overviewQuery.isLoading ? (
        <Skeleton height={132} radius={"sm"} />
      ) : overview ? (
        <XboxStatsStrip
          testId={"xbox-stats-overview"}
          tiles={[
            {
              value: format(overview.totalGames),
              label: t("profile.stats.gamesLabel"),
            },
            {
              value: format(overview.totalCollections),
              label: t("profile.stats.collectionsLabel"),
            },
            {
              value: format(Math.ceil(overview.totalEstimatedPlaytime / 3600)),
              label: t("profile.stats.estimatedPlaytime"),
            },
          ]}
          finishedShare={finishedShare}
          finishedCount={overview.totalFinishedGames}
          totalGames={overview.totalGames}
          note={`${t("profile.stats.playtimeNote1")} ${t("profile.stats.playtimeNote2")}`}
        />
      ) : null}

      <section className={classes.card}>
        <header className={classes.cardHead}>
          <h3 className={classes.cardTitle}>
            {t("profile.stats.gamesByYear")}
          </h3>
          <Tabs
            unstyled
            value={yearBy}
            onChange={(value) => {
              if (value) {
                setYearBy(value as ProfileMetricsDistributionYearBy);
              }
            }}
          >
            <Tabs.List className={pillClasses.list}>
              {YEAR_TABS.map((value) => (
                <Tabs.Tab key={value} value={value} className={pillClasses.tab}>
                  {yearLabels[value]}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </header>
        {yearQuery.isLoading ? (
          <Skeleton height={280} radius={"sm"} />
        ) : yearData ? (
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
            textColor={"dimmed"}
            xAxisLabel={
              yearBy === "playtime" ? t("profile.stats.year") : undefined
            }
          />
        ) : null}
      </section>

      <div className={classes.grid}>
        <XboxStatsRanking
          userId={userId}
          by={"platform"}
          title={t("explore.filters.platforms")}
        />
        <XboxStatsRanking
          userId={userId}
          by={"status"}
          title={t("collectionEntry.labels.status")}
        />
        <XboxStatsRanking
          userId={userId}
          by={"genre"}
          title={t("explore.filters.genres")}
        />
        <XboxStatsRanking
          userId={userId}
          by={"theme"}
          title={t("explore.filters.themes")}
        />
        <XboxStatsRanking
          userId={userId}
          by={"mode"}
          title={t("explore.filters.modes")}
        />
      </div>
    </div>
  );
};

export { XboxProfileStatsView };
