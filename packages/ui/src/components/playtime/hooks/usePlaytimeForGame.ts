import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlaytimeService, UserPlaytime } from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util";

export function usePlaytimeForGame(
  userId: string | undefined,
  gameId: number,
): ExtendedUseQueryResult<UserPlaytime[]> {
  const queryClient = useQueryClient();

  const queryKey = ["playtime", "game", userId, gameId];

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
    });
  };

  return {
    ...useQuery({
      queryKey,
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
    }),
    queryKey,
    invalidate,
  };
}
