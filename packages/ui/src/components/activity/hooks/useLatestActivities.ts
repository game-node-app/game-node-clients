import { useQuery } from "@tanstack/react-query";
import { ActivitiesService, Activity } from "@repo/wrapper/server";

export function useLatestActivities(
  userId: string | undefined,
  offset = 0,
  limit = 10,
  type?: Activity.type,
) {
  return useQuery({
    queryKey: ["activities", "latest", userId, offset, limit, type],
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
