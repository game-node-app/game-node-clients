import { GameCoverService } from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

/**
 * IGDB cover options listed for a game. Signed-out visitors can browse them;
 * choosing one requires a session (see `useSetGameCoverChoice`).
 */
export function useGameCoverOptions(
  gameId: number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["game-cover", gameId, "options"],
    queryFn: () => GameCoverService.gameCoverControllerFindOptionsV1(gameId!),
    enabled: enabled && gameId != undefined,
    staleTime: 5 * 60 * 1000,
  });
}
