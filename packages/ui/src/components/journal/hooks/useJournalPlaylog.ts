import { JournalService } from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

export function useJournalPlaylog(userId: string, gameId: number) {
  return useQuery({
    queryKey: ["journal", "playlog", userId, gameId],
    queryFn: () => {
      return JournalService.journalControllerGetJournalPlaylogV1(
        userId,
        gameId,
      );
    },
  });
}
