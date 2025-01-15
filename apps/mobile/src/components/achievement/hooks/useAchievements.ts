import { useQuery } from "@tanstack/react-query";
import { AchievementsService } from "@repo/wrapper/server";

interface Props {
    offset?: number;
    limit?: number;
}

export function useAchievements({ offset = 0, limit = 1000 }: Props) {
    return useQuery({
        queryKey: ["achievements"],
        queryFn: () => {
            return AchievementsService.achievementsControllerGetAchievementsV1(offset, limit);
        },
    });
}
