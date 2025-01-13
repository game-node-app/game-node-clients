import { useQuery } from "@tanstack/react-query";
import { PlaytimeService } from "@/wrapper/server";

export function useAccumulatedPlaytimeForGame(
    userId: string | undefined,
    gameId: number,
) {
    return useQuery({
        queryKey: ["playtime", "accumulated", "game", userId, gameId],
        queryFn: async () => {
            if (!gameId || !userId) {
                return null;
            }

            return PlaytimeService.playtimeControllerFindAccumulatedForUserIdAndGameIdV1(
                gameId,
                userId,
            );
        },
        staleTime: Infinity,
    });
}
