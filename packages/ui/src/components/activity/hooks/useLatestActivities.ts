import { useQuery } from "@tanstack/react-query";
import { ActivitiesService, Activity } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useLatestActivities(
  userId: string | undefined,
  offset = 0,
  limit = 10,
  type?: Activity.type,
) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "activities",
      "latest",
      userId,
      offset,
      limit,
      type,
      viewerId ?? null,
    ],
    queryFn: async () => {
      return ActivitiesService.activitiesRepositoryV2ControllerFindLatestV2(
        userId,
        type,
        offset,
        limit,
      );
    },
    retry: 1,
  });
}
