import { ParsedUrlQuery } from "querystring";
import {
  Game,
  GameRankingCriteriaDto,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import { InfiniteQueryTrendingGamesDto } from "@repo/ui";
import period = StatisticsRankingsRequestDto.period;

export const DEFAULT_EXPLORE_RESULT_LIMIT = 20;
export const DEFAULT_EXPLORE_SCREEN_PERIOD = period.MONTH;
export const DEFAULT_EXPLORE_TRENDING_GAMES_DTO: InfiniteQueryTrendingGamesDto =
  {
    limit: DEFAULT_EXPLORE_RESULT_LIMIT,
    criteria: {},
    period: DEFAULT_EXPLORE_SCREEN_PERIOD,
  };

export const exploreScreenUrlQueryToDto = (
  query: ParsedUrlQuery,
): InfiniteQueryTrendingGamesDto => {
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
      : period.MONTH;
  return {
    limit: DEFAULT_EXPLORE_RESULT_LIMIT,
    criteria,
    period: selectedPeriod,
  };
};

export const exploreScreenDtoToSearchParams = (
  dto: InfiniteQueryTrendingGamesDto,
) => {
  const params = new URLSearchParams();
  params.set("period", dto.period ?? period.MONTH);
  for (const [key, value] of Object.entries(dto.criteria ?? {}))
    if (value?.length) params.set(key, value.join(","));
  return params;
};
