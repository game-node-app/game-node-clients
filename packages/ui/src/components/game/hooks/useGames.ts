import {
  Game,
  GameRepositoryFindAllDto,
  GameRepositoryService,
} from "../../../../../wrapper/src/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { GameCoverArg } from "#@/components/game/util/gameCoverRequest";
import { useGameCoverRequest } from "#@/components/game/hooks/useGameCoverRequest";

type FindAllGamesByIdsDto = Partial<GameRepositoryFindAllDto>;

export function useGames(
  dto: FindAllGamesByIdsDto,
  keepPreviousData = false,
  cover?: GameCoverArg,
): ExtendedUseQueryResult<Game[]> {
  const queryClient = useQueryClient();
  const { fields, keyPart } = useGameCoverRequest(
    !!dto.relations?.cover,
    cover,
  );
  const defaultQueryKey = ["game", "all", dto.gameIds, dto.relations];
  const queryKey = keyPart
    ? [...defaultQueryKey, { coverContext: keyPart }]
    : defaultQueryKey;
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
          ...(keyPart ? fields : {}),
        });
      },
      enabled: dto.gameIds != undefined,
      placeholderData: keepPreviousData
        ? (previousData) => previousData
        : keyPart
          ? () => queryClient.getQueryData<Game[]>(defaultQueryKey)
          : undefined,
    }),
    queryKey,
    invalidate,
  };
}
