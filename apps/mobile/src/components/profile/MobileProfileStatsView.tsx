import { CardSection, StatTile } from "@/components/general/card";
import { BarChart } from "@mantine/charts";
import { useTranslation } from "@repo/locales";
import {
  LibraryHiddenState,
  ProfileStatsDistributionBarByType,
  ProfileStatsDistributionLineByYear,
  ProfileStatsDistributionRadarByType,
  ProfileStatsViewProps,
  useIsLibraryHidden,
  useProfileMetricsOverview,
  UserAvatarWithLevelInfo,
} from "@repo/ui";
import {
  IconClock,
  IconDeviceGamepad2,
  IconListCheck,
  IconStack2,
} from "@tabler/icons-react";

/** Turns the year-distribution pills into a full-width segmented control (styling only). */
const SEGMENTED_TABS =
  "[&_.mantine-Group-root]:flex-nowrap [&_.mantine-Group-root]:justify-stretch [&_.mantine-Group-root]:rounded-xl [&_.mantine-Group-root]:bg-paper-4 [&_.mantine-Group-root]:p-1 [&_.mantine-Tabs-tab]:flex-1 [&_.mantine-Tabs-tab]:rounded-lg [&_.mantine-Tabs-tab]:px-1 [&_.mantine-Tabs-tab]:text-xs";

/**
 * Mobile restyle of `ProfileStatsView`: shared level header, 2-column stat tiles and every chart
 * block inside its own card. Data hooks and chart components are the shared ones from `@repo/ui`.
 */
export const MobileProfileStatsView = ({
  userId,
  withUserLevel = true,
}: ProfileStatsViewProps) => {
  const { t } = useTranslation();
  const { isHidden, profile } = useIsLibraryHidden(userId);
  const metricsQuery = useProfileMetricsOverview(userId);
  const metrics = metricsQuery.data;

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  const playtimeInHours = metrics?.totalEstimatedPlaytime
    ? Math.ceil(metrics.totalEstimatedPlaytime / 3600)
    : 0;

  return (
    <div className="flex w-full flex-col gap-5 pb-6 pt-3">
      {withUserLevel && <UserAvatarWithLevelInfo userId={userId} />}
      <div className="grid grid-cols-2 gap-3 px-4">
        <StatTile
          icon={<IconDeviceGamepad2 size={20} />}
          value={metrics?.totalGames ?? 0}
          label={t("profile.stats.gamesLabel")}
        />
        <StatTile
          icon={<IconStack2 size={20} />}
          value={metrics?.totalCollections ?? 0}
          label={t("profile.stats.collectionsLabel")}
        />
        <StatTile
          icon={<IconListCheck size={20} />}
          value={metrics?.totalFinishedGames ?? 0}
          label={t("profile.stats.finishedGamesLabel")}
        />
        <StatTile
          icon={<IconClock size={20} />}
          value={playtimeInHours}
          label={t("profile.stats.playtimeShort")}
        />
      </div>
      {metrics && (
        <CardSection title={t("profile.stats.backlogTracking")}>
          <div className="p-3">
            <BarChart
              h={80}
              data={[
                {
                  label: t("profile.stats.backlogTracking"),
                  totalGames: metrics.totalGames,
                  totalFinishedGames: metrics.totalFinishedGames,
                },
              ]}
              dataKey="label"
              orientation="vertical"
              series={[
                {
                  name: "totalGames",
                  color: "blue",
                  label: t("profile.stats.total"),
                },
                {
                  name: "totalFinishedGames",
                  color: "red",
                  label: t("profile.stats.finishedGames"),
                },
              ]}
              gridAxis="y"
              barProps={{ barSize: 20, height: 20 }}
              withYAxis={false}
            />
          </div>
        </CardSection>
      )}
      <CardSection title={t("profile.stats.gamesByYear")}>
        <div className={`p-3 ${SEGMENTED_TABS}`}>
          <ProfileStatsDistributionLineByYear userId={userId} />
        </div>
      </CardSection>
      <CardSection title={t("profile.stats.gamesByPlatform")}>
        <div className="p-3">
          <ProfileStatsDistributionBarByType
            userId={userId}
            by="platform"
            orientation="vertical"
          />
        </div>
      </CardSection>
      <CardSection title={t("profile.stats.libraryDistribution")}>
        <div className="flex flex-col gap-4 p-3">
          <ProfileStatsDistributionRadarByType userId={userId} by="status" />
          <ProfileStatsDistributionRadarByType userId={userId} by="genre" />
          <ProfileStatsDistributionRadarByType userId={userId} by="theme" />
          <ProfileStatsDistributionRadarByType userId={userId} by="mode" />
        </div>
      </CardSection>
    </div>
  );
};
