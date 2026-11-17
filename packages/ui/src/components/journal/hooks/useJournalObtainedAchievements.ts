import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useJournalObtainedAchievements(userId: string) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["journal", "achievements", "obtained", userId, viewerId ?? null],
    queryFn: async () => {
      return JournalService.journalControllerGetObtainedAchievementsJournalV1(
        userId,
      );
    },
  });
}
