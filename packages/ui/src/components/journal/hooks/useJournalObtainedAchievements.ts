import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";

export function useJournalObtainedAchievements(userId: string) {
  return useQuery({
    queryKey: ["journal", "achievements", "obtained", userId],
    queryFn: async () => {
      return JournalService.journalControllerGetObtainedAchievementsJournalV1(
        userId,
      );
    },
  });
}
