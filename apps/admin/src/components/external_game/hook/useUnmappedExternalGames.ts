import { useQuery } from "@tanstack/react-query";
import { ExternalGameService } from "@repo/wrapper/server";

export function useUnmappedExternalGames() {
  return useQuery({
    queryKey: ["game", "external", "unmapped"],
    queryFn: () => {
      return ExternalGameService.externalGameControllerFindUnmappedEntriesV1();
    },
  });
}
