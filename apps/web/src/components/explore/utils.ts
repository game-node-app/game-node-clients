import { ParsedUrlQuery } from "querystring";
import { FindStatisticsTrendingGamesDto } from "@/wrapper/server";
import period = FindStatisticsTrendingGamesDto.period;

export const DEFAULT_EXPLORE_RESULT_LIMIT = 20;
export const DEFAULT_EXPLORE_SCREEN_PERIOD = period.MONTH.valueOf();

export const DEFAULT_EXPLORE_TRENDING_GAMES_DTO: FindStatisticsTrendingGamesDto =
    {
        limit: DEFAULT_EXPLORE_RESULT_LIMIT,
        criteria: {},
        period: DEFAULT_EXPLORE_SCREEN_PERIOD as period,
    };

export const exploreScreenUrlQueryToDto = (query: ParsedUrlQuery) => {
    const dto: FindStatisticsTrendingGamesDto = structuredClone(
        DEFAULT_EXPLORE_TRENDING_GAMES_DTO,
    );
    for (const [k, v] of Object.entries(query)) {
        if (k !== "period" && typeof v === "string" && v.length > 0) {
            if (v.includes(",")) {
                //@ts-ignore
                dto.criteria[k] = v.split(",");
            } else {
                //@ts-ignore
                dto.criteria[k] = [v];
            }
        } else if (typeof v === "string" && v.length > 0) {
            // @ts-ignore
            dto[k] = v;
        }
    }
    return dto;
};

export const exploreScreenDtoToSearchParams = (
    dto: FindStatisticsTrendingGamesDto,
) => {
    const params = new URLSearchParams();
    const { period, criteria } = dto;
    params.set("period", period);
    if (criteria) {
        for (const [k, v] of Object.entries(criteria)) {
            params.set(k, `${v}`);
        }
    }
    return params;
};
