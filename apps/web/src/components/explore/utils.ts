import { ParsedUrlQuery } from "querystring";
import {
  Game,
  GameRankingCriteriaDto,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import type { ExploreViewValue } from "@repo/ui";
import period = StatisticsRankingsRequestDto.period;

export const DEFAULT_EXPLORE_SCREEN_PERIOD = period.MONTH;

/** `?view=ranking` opens the overall ranking, which has no criteria to show. */
const RANKING_VIEW = "ranking";

export const exploreUrlQueryToValue = (
  query: ParsedUrlQuery,
): ExploreViewValue => {
  const criteria: GameRankingCriteriaDto = {};
  for (const key of [
    "ids",
    "status",
    "category",
    "themes",
    "gameModes",
    "platforms",
    "genres",
  ] as const) {
    const value = query[key];
    if (typeof value !== "string") continue;
    const values = value
      .split(",")
      .filter((part) => /^\d+$/.test(part))
      .map(Number)
      .filter(
        (id) =>
          Number.isSafeInteger(id) &&
          (key === "status" || key === "category" ? id >= 0 : id > 0),
      );
    const valid =
      key === "status"
        ? values.filter((id) => Object.values(Game.status).includes(id))
        : key === "category"
          ? values.filter((id) => Object.values(Game.category).includes(id))
          : values;
    if (valid.length) Object.assign(criteria, { [key]: valid });
  }
  const selectedPeriod =
    typeof query.period === "string" &&
    Object.values(period).includes(query.period as period)
      ? (query.period as period)
      : DEFAULT_EXPLORE_SCREEN_PERIOD;
  const showsRanking =
    Object.keys(criteria).length > 0 || query.view === RANKING_VIEW;
  return { period: selectedPeriod, ...(showsRanking && { criteria }) };
};

export const exploreValueToUrlQuery = ({
  period,
  criteria,
}: ExploreViewValue) => {
  const query: Record<string, string> = {};
  if (period !== DEFAULT_EXPLORE_SCREEN_PERIOD) query.period = period;
  for (const [key, value] of Object.entries(criteria ?? {}))
    if (value?.length) query[key] = value.join(",");
  if (criteria && !Object.values(criteria).some((value) => value?.length))
    query.view = RANKING_VIEW;
  return query;
};
