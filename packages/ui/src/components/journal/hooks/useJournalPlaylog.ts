import { JournalService } from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { retryUnlessHidden } from "#@/util";

export function useJournalPlaylog(userId: string, gameId: number) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["journal", "playlog", userId, gameId, viewerId ?? null],
    queryFn: () => {
      return JournalService.journalControllerGetJournalPlaylogV1(
        userId,
        gameId,
      );
    },
    // A hidden library answers 404: render the hidden state, don't retry.
    retry: retryUnlessHidden,
  });
}
