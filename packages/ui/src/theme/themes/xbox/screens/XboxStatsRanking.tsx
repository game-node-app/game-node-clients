import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";
import { Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import classes from "./XboxStatsRanking.module.css";

const COLLAPSED_ROWS = 6;

export interface XboxStatsRankingProps {
  userId: string;
  by: ProfileMetricsDistributionTypeBy;
  title: string;
}

/**
 * One distribution as a ranked list: a bar per criteria sized against the
 * largest entry, with the finished share filled solid inside it.
 *
 * It replaces the radar/wide bar charts, whose wrapped labels and 20+ axes were
 * hard to read. The status distribution has no finished count in the API, so it
 * renders totals only.
 */
const XboxStatsRanking = ({ userId, by, title }: XboxStatsRankingProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useProfileMetricsDistributionByType(userId, by);

  const items = [...(data?.distribution ?? [])]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const largest = items[0]?.count ?? 0;
  const withFinished = by !== "status";
  const visible = expanded ? items : items.slice(0, COLLAPSED_ROWS);
  const hasMore = items.length > COLLAPSED_ROWS;

  return (
    <section className={classes.card} data-testid={`xbox-stats-ranking-${by}`}>
      <header className={classes.head}>
        <h3 className={classes.title}>{title}</h3>
        {withFinished && items.length > 0 && (
          <ul className={classes.legend}>
            <li data-series={"total"}>{t("profile.stats.total")}</li>
            <li data-series={"finished"}>{t("profile.stats.finishedGames")}</li>
          </ul>
        )}
      </header>

      {isLoading ? (
        <Skeleton height={160} radius={"sm"} />
      ) : items.length === 0 ? (
        <Text className={classes.note}>–</Text>
      ) : (
        <ol className={classes.ranking}>
          {visible.map((item) => {
            const finished = item.finishedCount ?? 0;
            const totalShare = largest > 0 ? (item.count / largest) * 100 : 0;
            const finishedShare =
              withFinished && item.count > 0
                ? (finished / item.count) * 100
                : 0;

            return (
              <li
                key={item.criteriaId}
                className={classes.rank}
                data-testid={"xbox-stats-rank"}
                data-criteria={item.criteriaName}
                title={
                  withFinished
                    ? `${item.count} · ${finished} ${t("profile.stats.finishedGames")}`
                    : `${item.count}`
                }
              >
                <span className={classes.rankName}>{item.criteriaName}</span>
                <span className={classes.track} aria-hidden>
                  <span
                    className={classes.total}
                    style={{ width: `${totalShare}%` }}
                    data-testid={"xbox-stats-rank-total"}
                  >
                    {withFinished && (
                      <span
                        className={classes.finished}
                        style={{ width: `${finishedShare}%` }}
                        data-testid={"xbox-stats-rank-finished"}
                      />
                    )}
                  </span>
                </span>
                <span className={classes.value}>
                  {item.count}
                  {withFinished && (
                    <span className={classes.sub}> / {finished}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {hasMore && (
        <UnstyledButton
          className={classes.more}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? t("actions.showLess")
            : `${t("actions.showMore")} (${items.length - COLLAPSED_ROWS})`}
        </UnstyledButton>
      )}
    </section>
  );
};

export { XboxStatsRanking };
