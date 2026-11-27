import { queryOptions, useQuery } from "@tanstack/react-query";
import { Game, GameRepositoryService } from "../../../../../wrapper/src/server";

export function gamesResourceOptions<U extends keyof Game>(resourceName: U) {
  return queryOptions({
    queryKey: ["game", "resource", resourceName],
    queryFn: async () => {
      const resource =
        await GameRepositoryService.gameRepositoryControllerGetResourceV1(
          resourceName,
        );

      return resource as Game[U];
    },
    // Resources are constant
    staleTime: Infinity,
  });
}

export function useGamesResource<U extends keyof Game>(
  resourceName: U,
  enabled = true,
) {
  return useQuery({ ...gamesResourceOptions(resourceName), enabled });
}
