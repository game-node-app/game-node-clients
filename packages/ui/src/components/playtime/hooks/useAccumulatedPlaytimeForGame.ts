import { useQuery } from "@tanstack/react-query";
import { PlaytimeService } from "../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useAccumulatedPlaytimeForGame(
  userId: string | undefined,
  gameId: number,
) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "playtime",
      "accumulated",
      "game",
      userId,
      gameId,
      viewerId ?? null,
    ],
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
