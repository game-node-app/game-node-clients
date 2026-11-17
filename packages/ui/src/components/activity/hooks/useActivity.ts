import { useQuery } from "@tanstack/react-query";
import { ActivitiesService } from "../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { isNotFoundApiError } from "#@/util";

export function useActivity(activityId: string | undefined) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["activity", "detail", activityId, viewerId ?? null],
    queryFn: () => {
      if (!activityId) return null;
      return ActivitiesService.activitiesRepositoryControllerFindOneByIdV1(
        activityId,
      );
    },
    enabled: activityId != undefined,
    // Hidden COLLECTION_ENTRY activities answer 404: keep the single retry for
    // transient failures, but never retry the hidden/missing answer.
    retry: (failureCount, error) =>
      !isNotFoundApiError(error) && failureCount < 1,
  });
}
