import { useQuery } from "@tanstack/react-query";
import { PlaytimeService } from "@/wrapper/server";

export function usePlaytimeForGame(userId: string | undefined, gameId: number) {
    return useQuery({
        queryKey: ["playtime", "game", userId, gameId],
        queryFn: async () => {
            if (!gameId || !userId) {
                return null;
            }

            return PlaytimeService.playtimeControllerFindAllByUserIdAndGameIdV1(
                gameId,
                userId,
            );
        },
        staleTime: Infinity,
    });
}
