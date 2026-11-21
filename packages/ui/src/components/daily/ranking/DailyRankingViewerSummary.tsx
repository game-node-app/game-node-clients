import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { DailyRankingRowDto } from "@repo/wrapper/server";
import {
  formatDailyCount,
  formatDailyPoints,
} from "#@/components/daily/ranking/rankingFormat";
import type { DailyRankingPeriod } from "#@/components/daily/ranking/useInfiniteDailyRanking";

interface Props {
  viewer: DailyRankingRowDto | null;
  pointsToTop100: number | null;
  period: DailyRankingPeriod;
  isOverall: boolean;
}

const Tile = ({ value, label }: { value: string; label: string }) => (
  <div
    className={
      "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[10px] bg-nav-canvas p-2.5"
    }
  >
    <Text fz={18} fw={700} c={"white"} lh={1.3}>
      {value}
    </Text>
    <Text fz={11} className={"text-dimmed"}>
      {label}
    </Text>
  </div>
);

/**
 * The signed-in viewer's position, points and streak in the current list, with the gap to the top 100.
 */
const DailyRankingViewerSummary = ({
  viewer,
  pointsToTop100,
  period,
  isOverall,
}: Props) => {
  const { t, i18n } = useTranslation();
  const language = i18n?.language ?? "en";
  const streak = isOverall ? viewer?.currentStreak : viewer?.bestStreak;

  return (
    <section
      className={
        "flex flex-col gap-3 rounded-[14px] border border-solid border-line bg-paper-8 p-[18px]"
      }
    >
      <Text component={"h2"} fz={15} fw={700} c={"white"} className={"m-0"}>
        {t(`daily.ranking.summary.title.${period}`)}
      </Text>
      {viewer ? (
        <>
          <div className={"flex gap-2"}>
            <Tile
              value={`#${formatDailyCount(viewer.position, language)}`}
              label={t("daily.ranking.summary.position")}
            />
            <Tile
              value={formatDailyPoints(viewer.points, language)}
              label={t("daily.ranking.summary.points")}
            />
            <Tile
              value={t("daily.ranking.summary.streakValue", {
                count: streak ?? 0,
              })}
              label={t(
                isOverall
                  ? "daily.ranking.summary.streak"
                  : "daily.ranking.summary.bestStreak",
              )}
            />
          </div>
          {pointsToTop100 != null && (
            <Text fz={12} c={"var(--gn-dimmed-2)"}>
              {t("daily.ranking.summary.gap", {
                points: formatDailyPoints(pointsToTop100, language),
              })}
            </Text>
          )}
        </>
      ) : (
        <Text fz={13} lh={"19px"} c={"var(--gn-dimmed-2)"}>
          {t("daily.ranking.summary.empty")}
        </Text>
      )}
    </section>
  );
};

export { DailyRankingViewerSummary };
