import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useJournalOverview(userId: string) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["journal", "overview", userId, viewerId ?? null],
    queryFn: () => {
      return JournalService.journalControllerGetJournalOverviewV1(userId);
    },
  });
}
