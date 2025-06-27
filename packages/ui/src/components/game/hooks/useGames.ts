import {
  Game,
  GameRepositoryFindAllDto,
  GameRepositoryService,
} from "../../../../../wrapper/src/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

type FindAllGamesByIdsDto = Partial<GameRepositoryFindAllDto>;

export function useGames(
  dto: FindAllGamesByIdsDto,
  keepPreviousData = false,
): ExtendedUseQueryResult<Game[]> {
  const queryClient = useQueryClient();
  const queryKey = ["game", "all", dto.gameIds, dto.relations];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });

  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: () => {
        if (
          dto == undefined ||
          dto.gameIds == undefined ||
          dto.gameIds.length === 0
        ) {
          return [];
        }

        return GameRepositoryService.gameRepositoryControllerFindAllByIdsV1({
          gameIds: dto.gameIds,
          relations: dto.relations,
        });
      },
      enabled: dto.gameIds != undefined,
      placeholderData: keepPreviousData
        ? (previousData) => previousData
        : undefined,
    }),
    queryKey,
    invalidate,
  };
}
