import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
    Game,
    GameRepositoryFindOneDto,
    GameRepositoryService,
} from "@/wrapper/server";

export function useGame(
    id: number | undefined,
    dto: GameRepositoryFindOneDto,
): UseQueryResult<Game | null> {
    return useQuery<Game | null>({
        queryKey: ["game", id, dto],
        queryFn: async () => {
            if (!id) {
                return null;
            }
            return GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
                id,
                dto,
            );
        },
        staleTime: 5 * 60 * 1000, // 5 minutes,
        enabled: !!id,
    });
}
