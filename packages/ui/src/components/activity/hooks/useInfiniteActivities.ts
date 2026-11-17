import { useInfiniteQuery } from "@tanstack/react-query";
import { ActivitiesFeedService } from "../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

interface UseActivitiesProps {
  criteria: "following" | "all";
  limit?: number;
}

export function useInfiniteActivities({
  criteria,
  limit = 20,
}: UseActivitiesProps) {
  const viewerId = useUserId();

  return useInfiniteQuery({
    queryKey: ["activities", criteria, limit, viewerId ?? null],
    queryFn: async ({ pageParam }) => {
      return ActivitiesFeedService.activitiesFeedControllerBuildActivitiesFeedV1(
        criteria,
        pageParam,
        limit,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam, _allPageParams) => {
      if (lastPage.pagination != undefined && lastPage.pagination.hasNextPage) {
        return lastPageParam + limit;
      }
      return undefined;
    },
  });
}
