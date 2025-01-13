import { useQuery } from "@tanstack/react-query";
import { GameRepositoryService } from "@/wrapper/server";

export function useGameExternalStores(gameId: number) {
    return useQuery({
        queryKey: ["game", "external-stores", gameId],
        queryFn: async () => {
            return GameRepositoryService.gameRepositoryControllerGetExternalStoresForGameIdV1(
                gameId,
            );
        },
        retry: 1,
        staleTime: Infinity,
    });
}
