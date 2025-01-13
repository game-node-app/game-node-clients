import { useQuery } from "@tanstack/react-query";
import { AchievementsService } from "@/wrapper/server/services/AchievementsService";

interface Props {
    offset?: number;
    limit?: number;
}

export function useAchievements({ offset = 0, limit = 1000 }: Props) {
    return useQuery({
        queryKey: ["achievements", offset, limit],
        queryFn: () => {
            return AchievementsService.achievementsControllerGetAchievementsV1(
                offset,
                limit,
            );
        },
    });
}
