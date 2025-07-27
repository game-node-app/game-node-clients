import { useQuery } from "@tanstack/react-query";
import { GameRepositoryService } from "@repo/wrapper/server";

export function useGamePlatformIcons(gameId: number | undefined) {
  return useQuery({
    queryKey: ["game", "platform", "icon", gameId],
    queryFn: async () => {
      try {
        return GameRepositoryService.gameRepositoryControllerGetIconNamesForPlatformAbbreviationsV1(
          gameId!,
        );
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    enabled: !!gameId,
    staleTime: Infinity,
  });
}
