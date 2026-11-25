import {
  Game,
  GameRepositoryFindAllDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { useQueries } from "@tanstack/react-query";
import { GameCoverArg } from "#@/components/game/util/gameCoverRequest";
import { useGameCoverRequest } from "#@/components/game/hooks/useGameCoverRequest";

export interface GamesByPagesResult {
  /** Every page's games, in page and id order; `undefined` until the first page loads. */
  data: Game[] | undefined;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Games for an infinite list of ids (trending rankings), one request per page.
 *
 * `useGames` with every loaded id re-requested all previous pages whenever a
 * page was added (20, 40, 60... games) and missed the server cache each time.
 * Each page here keeps the same key `useGames` would use for its ids, so SSR
 * prefetches of the first page are reused.
 */
export function useGamesByPages(
  pages: number[][] | undefined,
  relations: GameRepositoryFindAllDto["relations"],
  cover?: GameCoverArg,
): GamesByPagesResult {
  const { fields, keyPart } = useGameCoverRequest(!!relations?.cover, cover);

  return useQueries({
    queries: (pages ?? []).map((gameIds) => {
      const defaultQueryKey = ["game", "all", gameIds, relations];
      return {
        queryKey: keyPart
          ? [...defaultQueryKey, { coverContext: keyPart }]
          : defaultQueryKey,
        queryFn: () =>
          gameIds.length === 0
            ? []
            : GameRepositoryService.gameRepositoryControllerFindAllByIdsV1({
                gameIds,
                relations,
                ...(keyPart ? fields : {}),
              }),
      };
    }),
    combine: (results) => {
      const loaded = results.filter((result) => result.data !== undefined);
      return {
        data:
          pages === undefined || (results.length > 0 && loaded.length === 0)
            ? undefined
            : loaded.flatMap((result) => result.data!),
        isFetching: results.some((result) => result.isFetching),
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
      };
    },
  });
}
