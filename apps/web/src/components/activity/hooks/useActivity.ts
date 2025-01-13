import { useQuery } from "@tanstack/react-query";
import { ActivitiesService } from "@/wrapper/server";

export function useActivity(activityId: string | undefined) {
    return useQuery({
        queryKey: ["activity", "detail", activityId],
        queryFn: () => {
            if (!activityId) return null;
            return ActivitiesService.activitiesRepositoryControllerFindOneByIdV1(
                activityId,
            );
        },
        enabled: activityId != undefined,
        retry: 1,
    });
}
