import { useQuery } from "@tanstack/react-query";
import { PlaytimeTtbService } from "@repo/wrapper/server";

export function useTimeToBeat(gameId: number) {
  return useQuery({
    queryKey: ["game", "ttb", gameId],
    queryFn: async () => {
      return PlaytimeTtbService.timeToBeatControllerFindOneForGameIdV1(gameId);
    },
    gcTime: Infinity,
  });
}
