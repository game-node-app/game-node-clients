import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";

export function useJournalOverview(userId: string) {
  return useQuery({
    queryKey: ["journal", "overview", userId],
    queryFn: () => {
      return JournalService.journalControllerGetJournalOverviewV1(userId);
    },
  });
}
