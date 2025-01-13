import {
    Game,
    GameRepositoryFindAllDto,
    GameRepositoryService,
} from "@/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

interface FindAllGamesByIdsDto extends Partial<GameRepositoryFindAllDto> {}

export function useGames(
    dto: FindAllGamesByIdsDto,
    keepPreviousData = false,
): ExtendedUseQueryResult<Game[]> {
    const queryClient = useQueryClient();
    const queryKey = ["game", "all", dto.gameIds, dto.relations];
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: [queryKey[0], queryKey[1]] });

    return {
        ...useQuery({
            queryKey: queryKey,
            queryFn: () => {
                if (
                    dto == undefined ||
                    dto.gameIds == undefined ||
                    dto.gameIds.length === 0
                ) {
                    return null;
                }

                return GameRepositoryService.gameRepositoryControllerFindAllByIdsV1(
                    {
                        gameIds: dto.gameIds,
                        relations: dto.relations,
                    },
                );
            },
            enabled: dto.gameIds && dto.gameIds.length > 0,
            placeholderData: keepPreviousData
                ? (previousData) => previousData
                : undefined,
        }),
        queryKey,
        invalidate,
    };
}
