import { useQuery } from "@tanstack/react-query";
import { ExternalGameService } from "@repo/wrapper/server";

export function useUnmappedExternalGames() {
  return useQuery({
    queryKey: ["game", "external", "unmapped"],
    // shortcut: one large page instead of server pagination, move to server paging when the queue outgrows it.
    queryFn: async () =>
      (
        await ExternalGameService.externalGameControllerFindUnmappedEntriesV1(
          undefined,
          500,
        )
      ).data,
  });
}
