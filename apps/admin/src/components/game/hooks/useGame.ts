import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
    Game,
    GameRepositoryFindOneDto,
    GameRepositoryService,
} from "@/wrapper/server";

export function useGame(
    id: number | undefined,
    dto: GameRepositoryFindOneDto,
): UseQueryResult<Game | undefined> {
    return useQuery<Game | undefined>({
        queryKey: ["game", id, dto],
        queryFn: async (): Promise<Game | undefined> => {
            if (!id) {
                return undefined;
            }
            const game =
                await GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
                    id,
                    dto,
                );

            return game;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes,
        enabled: !!id,
    });
}
