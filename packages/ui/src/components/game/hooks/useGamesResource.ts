import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ApiError,
  Game,
  GameRepositoryService,
} from "../../../../../wrapper/src/server";

export function useGamesResource<U extends keyof Game>(
  resourceName: U,
  enabled = true,
) {
  return useQuery({
    queryKey: ["game", "resource", resourceName],
    queryFn: async () => {
      const resource =
        await GameRepositoryService.gameRepositoryControllerGetResourceV1(
          resourceName,
        );

      return resource as Game[U];
    },
    enabled,
    // Resources are constant
    staleTime: Infinity,
  });
}
