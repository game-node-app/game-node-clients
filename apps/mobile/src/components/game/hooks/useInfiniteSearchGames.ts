import { useInfiniteQuery } from "@tanstack/react-query";
import { schema_GameSearchRequestDto, SearchService } from "@/wrapper/search";
import { parseSearchGamesDto } from "@/components/game/hooks/useSearchGames";

type InfiniteSearchGamesRequest = Omit<schema_GameSearchRequestDto, "page">;

export function useInfiniteSearchGames(searchParameters: InfiniteSearchGamesRequest, enabled: boolean = true) {
    const limit = searchParameters.limit || 10;

    return useInfiniteQuery({
        queryKey: ["game", "search", "infinite", searchParameters],
        queryFn: async ({ pageParam }) => {
            const parsedParams = parseSearchGamesDto(searchParameters);
            return SearchService.postSearchGames({
                ...parsedParams,
                limit: limit,
                page: pageParam,
            });
        },
        enabled,
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam): number | undefined => {
            if (lastPage.pagination != undefined && lastPage.pagination.hasNextPage) {
                return lastPageParam + 1;
            }
            return undefined;
        },
    });
}
