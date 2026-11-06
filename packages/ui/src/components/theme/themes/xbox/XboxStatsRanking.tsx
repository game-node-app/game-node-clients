import { Skeleton, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import {
  ProfileMetricsDistributionTypeBy,
  useProfileMetricsDistributionByType,
} from "#@/components/profile/hooks/useProfileMetricsDistributionByType";

const COLLAPSED_ROWS = 6;

interface Props {
  userId: string;
  by: ProfileMetricsDistributionTypeBy;
  title: string;
}

/**
 * One distribution as a ranked list: a bar per criteria sized against the largest, with the finished share
 * filled solid inside it. Replaces the radar/bar charts, whose 20+ axes and wrapped labels could not be read.
 */
const XboxStatsRanking = ({ userId, by, title }: Props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useProfileMetricsDistributionByType(userId, by);

  const items = [...(data?.distribution ?? [])]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const max = items[0]?.count ?? 0;
  // the API has no finished count for statuses
  const withFinished = by !== "status";
  const visible = expanded ? items : items.slice(0, COLLAPSED_ROWS);

  return (
    <section className={"gn-stats-card"}>
      <header className={"gn-stats-card-head"}>
        <h3 className={"gn-stats-card-title"}>{title}</h3>
        {withFinished && items.length > 0 && (
          <ul className={"gn-stats-legend"}>
            <li data-series={"total"}>{t("profile.stats.total")}</li>
            <li data-series={"finished"}>{t("profile.stats.finishedGames")}</li>
          </ul>
        )}
      </header>
      {isLoading ? (
        <Skeleton className={"h-40"} />
      ) : items.length === 0 ? (
        <Text className={"gn-profile-stat-note"}>–</Text>
      ) : (
        <ol className={"gn-stats-ranking"}>
          {visible.map((item) => (
            <li
              key={item.criteriaId}
              className={"gn-stats-rank"}
              title={
                withFinished
                  ? `${item.count} · ${item.finishedCount} ${t("profile.stats.finishedGames")}`
                  : `${item.count}`
              }
            >
              <span className={"gn-stats-rank-name"}>{item.criteriaName}</span>
              <span className={"gn-stats-rank-track"} aria-hidden>
                <span
                  className={"gn-stats-rank-total"}
                  style={{ width: `${(item.count / max) * 100}%` }}
                >
                  {withFinished && (
                    <span
                      className={"gn-stats-rank-finished"}
                      style={{ width: `${(item.finishedCount / item.count) * 100}%` }}
                    />
                  )}
                </span>
              </span>
              <span className={"gn-stats-rank-value"}>
                {item.count}
                {withFinished && (
                  <span className={"gn-stats-rank-sub"}> / {item.finishedCount}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
      {items.length > COLLAPSED_ROWS && (
        <UnstyledButton className={"gn-stats-more"} onClick={() => setExpanded((v) => !v)}>
          {expanded ? t("actions.showLess") : `${t("actions.showMore")} (${items.length - COLLAPSED_ROWS})`}
        </UnstyledButton>
      )}
    </section>
  );
};

export { XboxStatsRanking };
