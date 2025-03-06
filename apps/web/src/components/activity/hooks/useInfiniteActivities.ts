import { useInfiniteQuery } from "@tanstack/react-query";
import { ActivitiesFeedService } from "@repo/wrapper/server";

interface UseActivitiesProps {
  criteria: "following" | "all";
  limit?: number;
}

export function useInfiniteActivities({
  criteria,
  limit = 20,
}: UseActivitiesProps) {
  return useInfiniteQuery({
    queryKey: ["activities", criteria, limit],
    queryFn: async ({ pageParam }) => {
      return ActivitiesFeedService.activitiesFeedControllerBuildActivitiesFeedV1(
        criteria,
        pageParam,
        limit,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage && lastPage.pagination && lastPage.pagination.hasNextPage) {
        return lastPageParam + limit;
      }

      return undefined;
    },
  });
}
