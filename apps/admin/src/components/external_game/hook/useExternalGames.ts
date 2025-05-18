import { useQuery } from "@tanstack/react-query";
import { ExternalGameService } from "@repo/wrapper/server";

export function useExternalGames(offset = 0, limit = 20) {
  return useQuery({
    queryKey: ["game", "external", offset, limit],
    queryFn: () => {
      return ExternalGameService.externalGameControllerFindAllV1(limit, offset);
    },
  });
}
