import { useUserId } from "#@/components/auth/hooks/useUserId";
import { GameCoverService } from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

/**
 * The signed-in viewer's stored choice for a game. Disabled when signed out,
 * since there is no choice to read and a 401 would start the auth flow.
 */
export function useGameCoverChoice(gameId: number | undefined, enabled = true) {
  const userId = useUserId();

  return useQuery({
    queryKey: ["game-cover", gameId, "mine", userId],
    queryFn: () => GameCoverService.gameCoverControllerFindMineV1(gameId!),
    enabled: enabled && !!userId && gameId != undefined,
  });
}
